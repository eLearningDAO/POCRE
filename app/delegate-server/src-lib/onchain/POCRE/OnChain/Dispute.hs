module POCRE.OnChain.Dispute (
  disputeAddress,
  tokenOnlyValue,
  tokenAssetClass,
  policy,
  disputeTransitionResultingDatum,
  transitionValidityInterval,
  disputeValidator,
) where

-- Prelude imports
import PlutusTx.Prelude

-- Haskell imports
import Control.Monad (guard)

-- Plutus imports

import PlutusLedgerApi.Common (SerialisedScript, serialiseCompiledCode)
import PlutusLedgerApi.V1.Address (Address)
import PlutusLedgerApi.V1.Interval (
  Interval,
  always,
  contains,
  interval,
 )
import PlutusLedgerApi.V1.Time (POSIXTime)
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

{-# INLINEABLE checkTxIsScriptTransition #-}
checkTxIsScriptTransition :: ScriptContext -> (DisputeDatum, DisputeDatum)
checkTxIsScriptTransition context =
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
  where
    info = scriptContextTxInfo context
    selfAddress = scriptSelfAddress context

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

{-# INLINEABLE disputeTransitionResultingDatum #-}
disputeTransitionResultingDatum :: DisputeDatum -> DisputeNonHydraRedeemer -> Maybe DisputeDatum
disputeTransitionResultingDatum datum redeemer = do
  guard $ state datum == InProgress
  Just $ case redeemer of
    Vote voter _ decision ->
      let updatedVotes = voter : lookup decision (votesCastedFor datum)
       in datum
            { votesCastedFor = insert decision updatedVotes $ votesCastedFor datum
            }
    Withdraw _ -> datum {state = Withdrawed}
    Settle reason ->
      let
        votesCastedFinal = case reason of
          AllVotesCasted -> votesCastedFor datum
          Timeout ->
            insert Abstain (juryLeft datum) $ votesCastedFor datum
       in
        datum
          { votesCastedFor = votesCastedFinal
          , state = Settled $ countDecision votesCastedFinal
          }

transitionValidityInterval ::
  DisputeTerms -> DisputeNonHydraRedeemer -> Interval POSIXTime
transitionValidityInterval terms redeemer = case redeemer of
  Vote {} ->
    let
      (from, to) = voteInterval terms
     in
      interval from to
  _ -> always

{-# INLINEABLE mkDisputeValidator #-}
mkDisputeValidator :: DisputeDatum -> DisputeRedeemer -> ScriptContext -> Bool
mkDisputeValidator datum redeemer context =
  case redeemer of
    MoveToHydra ->
      checkIsMoveToHydra context (hydraHeadId $ terms datum)
    NonHydra nonHydra ->
      let (inDatum, outDatum) = checkTxIsScriptTransition context
       in case disputeTransitionResultingDatum inDatum nonHydra of
            Just expectedDatum ->
              traceIfFalse "Wrong output datum" (expectedDatum == outDatum)
                && checkHasRightForTransition nonHydra
            Nothing -> traceError "Incorrect input state"
  where
    checkHasRightForTransition nonHydra = case nonHydra of
      Vote voter signature _ ->
        checkHasRightToVote voter
          && checkUserSign (terms datum) voter signature
          && checkItIsVotingTime
      Withdraw signature ->
        let inTerms = terms datum
         in checkUserSign inTerms (claimer inTerms) signature
      Settle _ -> True
    checkItIsVotingTime =
      let (from, to) = voteInterval $ terms datum
       in traceIfFalse "Wrong interval for voting" $
            contains
              (rightExclusiveInterval from to)
              (txInfoValidRange $ scriptContextTxInfo context)
    checkHasRightToVote voter =
      traceIfFalse "Not a voter" (voter `elem` jury (terms datum))
        && traceIfFalse
          "Already casted a vote"
          (voter `notElem` allCastedVotes datum)
