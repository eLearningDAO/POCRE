module POCRE.OnChain.Dispute (
  disputeAddress,
  tokenOnlyValue,
  tokenAssetClass,
  policy,
  disputeValidator,
) where

-- Prelude imports
import PlutusTx.Prelude

-- Plutus imports

import PlutusLedgerApi.Common (SerialisedScript, serialiseCompiledCode)
import PlutusLedgerApi.V1.Address (Address)
import PlutusLedgerApi.V1.Interval (contains)
import PlutusLedgerApi.V1.Value (
  AssetClass (..),
  CurrencySymbol,
  TokenName (..),
  Value,
  singleton,
 )
import PlutusLedgerApi.V2 (txInInfoResolved)
import PlutusLedgerApi.V2.Contexts (
  ScriptContext (..),
  TxInfo (..),
  findOwnInput,
  ownCurrencySymbol,
 )
import PlutusLedgerApi.V2.Tx (
  TxOut (..),
  txOutAddress,
 )
import PlutusTx qualified

-- Hydra auction imports

import HydraAuctionUtils.Extras.Plutus (
  scriptCurrencySymbol,
  validatorAddress,
  wrapMintingPolicy,
  wrapValidator,
 )
import HydraAuctionUtils.Plutus (nothingForged)
import HydraAuctionUtils.Plutus.Hydra (checkIsMoveToHydra)
import HydraAuctionUtils.Plutus.Interval (rightExclusiveInterval)
import HydraAuctionUtils.Plutus.TxOut (
  decodeOutputDatum,
  isNotAdaOnlyOutput,
 )

-- POCRE imports
import POCRE.OnChain.TotalMap
import POCRE.OnChain.Types

-- Utils

{-# INLINEABLE scriptSelfAddress #-}
scriptSelfAddress :: ScriptContext -> Address
scriptSelfAddress context = case findOwnInput context of
  Just x -> txOutAddress $ txInInfoResolved x
  Nothing -> traceError "Impossible happened"

{-# INLINEABLE checkHasSingleTxOutTo #-}
checkHasSingleTxOutTo :: Address -> [TxOut] -> TxOut
checkHasSingleTxOutTo address txOuts =
  case filter isNotAdaOnlyOutput txOuts of
    [out] ->
      if txOutAddress out == address
        then out
        else traceError "TxOut is not to expected address"
    _ -> traceError "Not exactly one non-ADA TxOut"

-- State Token

{-# INLINEABLE mkPolicy #-}
mkPolicy :: Address -> StateTokenRedeemer -> ScriptContext -> Bool
mkPolicy disputeAddress' redeemer context =
  case redeemer of
    MintToken ->
      traceIfFalse
        "Not exactly one StateToken minted"
        (txInfoMint info == tokenOwnValue 1)
        && let txOut = checkHasSingleTxOutTo disputeAddress' $ txInfoOutputs info
            in case decodeOutputDatum info txOut of
                Just datum -> checkIsInit datum
                Nothing -> traceError "Cannot decode initial datum"
  where
    info = scriptContextTxInfo context
    tokenOwnValue = singleton (ownCurrencySymbol context) (TokenName "")
    checkIsInit datum =
      traceIfFalse "Wrong initial datum" $
        votesCastedFor datum == createTotalMap []
          && state datum == InProgress

policy :: SerialisedScript
policy =
  serialiseCompiledCode $
    $$(PlutusTx.compile [||wrapMintingPolicy . mkPolicy||])
      `PlutusTx.applyCode` PlutusTx.liftCode disputeAddress

tokenCurrencySymbol :: CurrencySymbol
tokenCurrencySymbol = scriptCurrencySymbol policy

tokenAssetClass :: AssetClass
tokenAssetClass =
  AssetClass (tokenCurrencySymbol, TokenName "")

tokenOnlyValue :: Integer -> Value
tokenOnlyValue = singleton tokenCurrencySymbol (TokenName "")

-- Script

{-# INLINEABLE areAllVotesCasted #-}
areAllVotesCasted :: DisputeDatum -> Bool
areAllVotesCasted datum =
  (length (jury $ terms datum) :: Integer)
    == length (allCastedVotes datum)

{-# INLINEABLE countDecision #-}
countDecision :: TotalMap Decision [UserID] -> Decision
countDecision votesMap = maxDecision
  where
    votes = fmap length votesMap
    maxDecision =
      if lookup Yes votes > lookup No votes
        then Yes
        else No

{-# INLINEABLE disputeValidator #-}
disputeValidator :: SerialisedScript
disputeValidator =
  serialiseCompiledCode $
    $$(PlutusTx.compile [||wrapValidator mkDisputeValidator||])

{-# INLINEABLE disputeAddress #-}
disputeAddress :: Address
disputeAddress = validatorAddress disputeValidator

{-# INLINEABLE mkDisputeValidator #-}
mkDisputeValidator :: DisputeDatum -> DisputeRedeemer -> ScriptContext -> Bool
mkDisputeValidator datum redeemer context =
  case redeemer of
    MoveToHydra ->
      checkIsMoveToHydra context (hydraHeadId $ terms datum)
    NonHydra nonHydra ->
      case nonHydra of
        Vote voter signature decision ->
          let (inDatum, outDatum) = checkTxIsScriptTransition
           in case (state inDatum, state outDatum) of
                (InProgress, InProgress) ->
                  checkHasRightToVote voter
                    && checkUserSign (terms datum) voter signature
                    && checkItIsVotingTime
                    && checkVoteCastedCorrectly outDatum voter decision
                (_, _) -> traceError "Wrong state transition"
        Withdraw signature ->
          let
            (inDatum, outDatum) = checkTxIsScriptTransition
            inTerms = terms datum
           in
            case (state inDatum, state outDatum) of
              (InProgress, Withdrawed) ->
                checkUserSign inTerms (claimer inTerms) signature
              (_, _) -> traceError "Wrong state transition"
        Settle reason ->
          let (inDatum, outDatum) = checkTxIsScriptTransition
           in case (state inDatum, state outDatum) of
                (InProgress, Settled decision) ->
                  checkVotesAddedCorrectly outDatum abstainedVotesAdded
                    && traceIfFalse
                      "Wrong decision"
                      ( countDecision (votesCastedFor outDatum) == decision
                      )
                (_, _) -> traceError "Wrong state transition"
          where
            abstainedVotesAdded = case reason of
              Timeout -> insert Abstain (juryLeft datum) $ createTotalMap []
              AllVotesCasted -> createTotalMap []
  where
    info = scriptContextTxInfo context
    selfAddress = scriptSelfAddress context
    checkItIsVotingTime =
      let (from, to) = voteInterval $ terms datum
       in traceIfFalse "Wrong interval for voting" $
            contains (rightExclusiveInterval from to) (txInfoValidRange info)
    -- FIXME: naming and move
    checkTxIsScriptTransition =
      let
        inTxOut =
          checkHasSingleTxOutTo selfAddress $
            map txInInfoResolved $
              txInfoInputs info
        outTxOut = checkHasSingleTxOutTo selfAddress $ txInfoOutputs info
        decodeDatum = decodeOutputDatum info
       in
        case (decodeDatum inTxOut, decodeDatum outTxOut) of
          (Just inDatum, Just outDatum) ->
            if nothingForged info
              then (inDatum, outDatum)
              else traceError "Output does not have state token"
          _ -> traceError "Wrong state transition"
    checkHasRightToVote voter =
      traceIfFalse "Not a voter" (voter `elem` jury (terms datum))
        && traceIfFalse
          "Already casted a vote"
          (voter `notElem` allCastedVotes datum)
    checkVoteCastedCorrectly datum' voter decision =
      checkVotesAddedCorrectly datum' $
        insert decision [voter] $
          createTotalMap []
    checkVotesAddedCorrectly txOutDatum addedMap =
      all checkVoteAdded enumerateValues
      where
        checkVoteAdded decision' =
          traceError
            "Wrong votes change"
            ( castedForDecision datum <> lookup decision' addedMap
                == castedForDecision txOutDatum
            )
          where
            castedForDecision = lookup decision' . votesCastedFor
