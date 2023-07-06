module POCRE.Delegate where

import HydraAuctionUtils.Prelude

-- Haskell imports

import Data.Aeson (FromJSON, ToJSON)

-- Hydra imports

import Cardano.Api.UTxO qualified as UTxO
import Hydra.API.ClientInput (ClientInput (..))
import Hydra.API.ServerOutput (ServerOutput (..))
import Hydra.Cardano.Api (
  CtxUTxO,
  Lovelace (..),
  Tx,
  TxIn,
  TxOut,
  fromPlutusScript,
  getTxBody,
  getTxId,
  mkTxIn,
  toPlutusKeyHash,
  verificationKeyHash,
 )
import Hydra.Chain (HeadId)
import Hydra.Chain.Direct.Tx (headIdToCurrencySymbol)

-- HydraAuctionUtils imports

import HydraAuctionUtils.Delegate.Interface
import HydraAuctionUtils.Delegate.Logic (
  DelegateLogic (..),
  SingleClientScope (..),
 )
import HydraAuctionUtils.Hydra.Monad (MonadHydra (..))
import HydraAuctionUtils.Hydra.Runner (HydraRunner)
import HydraAuctionUtils.HydraHacks
import HydraAuctionUtils.Monads (
  MonadQueryUtxo (..),
  MonadSubmitTx (..),
  UtxoQuery (..),
  submitAndAwaitTx,
 )
import HydraAuctionUtils.Monads.Actors (
  MonadHasActor (askActor),
  addressAndKeys,
 )
import HydraAuctionUtils.Tx.Build (mkInlinedDatumScriptWitness)
import HydraAuctionUtils.Tx.Common (
  actorAdaOnlyUtxo,
  queryOrCreateSingleMinAdaUtxo,
 )
import HydraAuctionUtils.Tx.Utxo (decodeInlineDatum)
import HydraAuctionUtils.Types (Layer (..))
import HydraAuctionUtils.WebSockets.Protocol (Protocol (..))
import HydraAuctionUtils.WebSockets.Protocol.Void (VoidProtocol)

import POCRE.OnChain.Dispute (disputeValidator)
import POCRE.OnChain.Types
import POCRE.Tx.Dispute

data POCREDelegateProtocol

data DelegateResponseKind = NotImplemented deriving stock (Eq, Show)

instance Protocol POCREDelegateProtocol where
  type Input POCREDelegateProtocol = FrontendRequest POCREDelegateProtocol
  type Output POCREDelegateProtocol = DelegateResponse POCREDelegateProtocol
  type OutputKind POCREDelegateProtocol = DelegateResponseKind
  type ConnectionConfig POCREDelegateProtocol = ()
  getOutputKind _ = NotImplemented
  configToConnectionPath _ () = ""

instance DelegateLogicTypes POCREDelegateProtocol where
  data CommitAction POCREDelegateProtocol = OpenDispute DisputeTerms Signature
    deriving stock (Eq, Show, Generic)
    deriving anyclass (ToJSON, FromJSON)

  data TxAction POCREDelegateProtocol = MkTxAction DisputeNonHydraRedeemer
    deriving stock (Eq, Show, Generic)
    deriving anyclass (ToJSON, FromJSON)

  data OpenState POCREDelegateProtocol = MkOpenState
    { disputeDatum :: DisputeDatum
    , disputeUtxo :: (TxIn, TxOut CtxUTxO)
    , delegateCollateral :: (TxIn, TxOut CtxUTxO)
    }
    deriving stock (Eq, Show, Generic)
    deriving anyclass (FromJSON, ToJSON)

  data CustomEvent POCREDelegateProtocol
    = VotingTermsSet DisputeTerms
    | VotingEnded
    deriving stock (Eq, Show, Generic)
    deriving anyclass (ToJSON, FromJSON)

-- | Uses or creates minAda Utxo for collateral
moveToHydraTx ::
  HasCallStack =>
  HeadId ->
  (TxIn, TxOut CtxUTxO) ->
  HydraRunner Tx
moveToHydraTx headId (standingBidTxIn, standingBidTxOut) = do
  -- FIXME: get headId from AuctionTerms
  utxoForL2Collateral <- runL1RunnerInComposite queryOrCreateSingleMinAdaUtxo

  utxoForL1Fee : _ <-
    filter (/= utxoForL2Collateral) . UTxO.pairs
      <$> runL1RunnerInComposite actorAdaOnlyUtxo
  -- FIXME: use Hydra external commit instread
  createCommitTx
    headId
    utxoForL1Fee
    (UTxO.fromPairs [utxoForL2Collateral])
    (standingBidTxIn, standingBidTxOut, standingBidWitness)
  where
    script = fromPlutusScript disputeValidator
    standingBidWitness = mkInlinedDatumScriptWitness script MoveToHydra

instance DelegateLogic POCREDelegateProtocol where
  type DelegatePlatformProtocol POCREDelegateProtocol = VoidProtocol

  performCommitAction ::
    HeadId ->
    CommitAction POCREDelegateProtocol ->
    HydraRunner [(SingleClientScope, DelegateResponse POCREDelegateProtocol)]
  performCommitAction headId (OpenDispute terms sign) = do
    utxoPair <- runL1RunnerInComposite $ do
      tx <- createInitialUtxo terms
      submitAndAwaitTx tx
      utxoPair : _ <- UTxO.pairs <$> queryUtxo (ByTxIns [mkTxIn tx 0])
      return utxoPair
    tx <- moveToHydraTx headId utxoPair
    _ <- runL1RunnerInComposite $ submitTx tx
    return
      [
        ( BroadcastEveryone
        , TxEvent L1 Submited (getTxId $ getTxBody tx)
        )
      ,
        ( BroadcastEveryone
        , CustomEventHappened $ VotingTermsSet terms
        )
      ]

  performTxAction headId (MkTxAction redeemer) state = do
    eTx <-
      trySome $
        changeUtxo'
          redeemer
          ( disputeUtxo state
          , disputeDatum state
          , Just $ UTxO.fromPairs [delegateCollateral state]
          )
    case eTx of
      Right tx ->
        return
          [
            ( BroadcastEveryone
            , TxEvent L2 Submited (getTxId $ getTxBody tx)
            )
          ]
      Left someError -> do
        putStrLn $ show someError
        return
          [
            ( SameClient
            , RequestIgnored $ IncorrectRequestData AuctionTermsAreInvalidOrNotMatchingHead
            )
          ]

  reactToCustomEvent state event = case event of
    VotingTermsSet terms -> return $ Right ()
    VotingEnded -> case state of
      Initialized _ (Open openState) -> do
        -- Call for Settle
        _ <-
          performTxAction
            (error "not used")
            (MkTxAction (Settle Timeout))
            openState
        return $ Right ()
      _ -> return $ Right ()

  reactToTxInvalid _tx _event _state = return $ Right ()

  isCorrectCommit :: TxOut CtxUTxO -> Bool
  isCorrectCommit _txOut = True

  delegateEventHook _ = return ()

  openStateUpdatedHook (MkOpenState {disputeDatum}) =
    when (isFinal $ state disputeDatum) $ sendCommand Close

  parseOpenStateFromUtxo (txIn, txOut) delegateCollateral = do
    disputeDatum <- hush $ decodeInlineDatum txOut
    return $
      MkOpenState
        { disputeDatum
        , disputeUtxo = (txIn, txOut)
        , delegateCollateral
        }
