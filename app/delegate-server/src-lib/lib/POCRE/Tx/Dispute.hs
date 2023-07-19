module POCRE.Tx.Dispute (
  createInitialUtxo,
  changeUtxo,
  changeUtxo',
) where

-- Prelude imports
import HydraAuctionUtils.Prelude

import PlutusLedgerApi.V1.Interval (always)

-- Hydra imports
import Cardano.Api.UTxO qualified as UTxO
import CardanoClient (buildScriptAddress)
import Hydra.Cardano.Api

-- HydraAuctionUtils imports

import HydraAuctionUtils.Monads
import HydraAuctionUtils.Monads.Actors
import HydraAuctionUtils.Tx.AutoCreateTx
import HydraAuctionUtils.Tx.Build (
  minLovelace,
  mintedTokens,
  mkInlineDatum,
  mkInlinedDatumScriptWitness,
 )
import HydraAuctionUtils.Tx.Common
import HydraAuctionUtils.Tx.Utxo (decodeInlineDatum)

-- POCRE imports

import POCRE.OnChain.Dispute
import POCRE.OnChain.TotalMap (createTotalMap)
import POCRE.OnChain.Types

-- Common utils

-- FIXME: use some common Carda address type
makeDisputeAddressCardano :: (MonadNetworkId m) => m (Address ShelleyAddr)
makeDisputeAddressCardano = do
  buildScriptAddress
    (PlutusScript $ fromPlutusScript disputeValidator)
    <$> askNetworkId

initialDatum terms =
  MkDisputeDatum
    { terms
    , votesCastedFor = createTotalMap []
    , state = InProgress
    }

-- Generic internal Tx sender

data UtxoMode
  = CreateUtxo
  | ChangeUtxo (TxIn, TxOut CtxUTxO) DisputeNonHydraRedeemer

createTx :: _ => UtxoMode -> DisputeDatum -> Maybe UTxO -> m Tx
createTx mode datum mMoneyUtxo = do
  disputeAddressCardano <- fromPlutusAddressInMonad disputeAddress
  (actorAddress, _, actorSk) <- addressAndKeys
  moneyUtxo <- case mMoneyUtxo of
    Just utxo -> return utxo
    Nothing -> fromJust <$> selectAdaUtxo minLovelace

  putStrLn $ show moneyUtxo

  autoCreateTx $
    AutoCreateParams
      { signedUtxos = [(actorSk, moneyUtxo)]
      , additionalSigners = []
      , referenceUtxo = mempty
      , collateral = Nothing
      , witnessedUtxos = witnessedUtxos
      , outs = [disputeTxOut disputeAddressCardano]
      , toMint
      , changeAddress = actorAddress
      , validityBound
      }
  where
    toMint =
      case mode of
        CreateUtxo -> mintSingle
        ChangeUtxo _ _ -> TxMintValueNone
      where
        mintSingle =
          mintedTokens
            (fromPlutusScript policy)
            MintToken
            [(AssetName "", 1)]
    witnessedUtxos = case mode of
      CreateUtxo -> []
      ChangeUtxo utxo redeemer ->
        [
          ( mkInlinedDatumScriptWitness
              (fromPlutusScript disputeValidator)
              (NonHydra redeemer)
          , UTxO.fromPairs [utxo]
          )
        ]
    disputeValue =
      lovelaceToValue minLovelace
        <> fromPlutusValue (tokenOnlyValue 1)
    disputeTxOut disputeAddressCardano =
      TxOut
        disputeAddressCardano
        disputeValue
        (mkInlineDatum datum)
        ReferenceScriptNone
    validityBound = case mode of
      CreateUtxo -> always
      ChangeUtxo _ redeemer ->
        transitionValidityInterval (terms datum) redeemer

-- External API

createInitialUtxo terms = do
  let datum = initialDatum terms
  createTx CreateUtxo datum Nothing

changeUtxo redeemer = do
  disputeAddressCardano <- makeDisputeAddressCardano
  disputeUtxos <- queryUtxo (ByAddress disputeAddressCardano)
  let
    disputeUtxo = case UTxO.pairs disputeUtxos of
      [pair] -> pair
      _ -> error "Cannot find deposit utxo (or found multiple)"
    inDatum = case decodeInlineDatum $ snd disputeUtxo of
      Right x -> x
      Left _ -> error "Cannot decode deposit utxo"

  tx <- changeUtxo' redeemer (disputeUtxo, inDatum, Nothing)
  submitAndAwaitTx tx

-- | `changeUtxo` with explicit inputs, used by delegate
changeUtxo' redeemer (disputeUtxo, inDatum, mMoneyUtxo) = do
  let outDatum = fromJust $ disputeTransitionResultingDatum inDatum redeemer
  createTx (ChangeUtxo disputeUtxo redeemer) outDatum mMoneyUtxo
