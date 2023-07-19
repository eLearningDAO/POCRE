module L1.L1Spec (spec) where

import HydraAuctionUtils.Prelude

import Test.Syd

import PlutusLedgerApi.V1.Time (POSIXTime (..))
import PlutusLedgerApi.V1.Value (CurrencySymbol (..))
import PlutusTx.Prelude (BuiltinByteString, emptyByteString, toBuiltin)

import Hydra.Cardano.Api (serialiseToRawBytes)
import Hydra.Cluster.Faucet (Marked (..))

import HydraAuctionUtils.Fixture (Actor (..), keysFor)
import HydraAuctionUtils.L1.Runner (L1Runner, executeTestL1Runner)
import HydraAuctionUtils.Monads (submitAndAwaitTx)
import HydraAuctionUtils.Monads.Actors
import HydraAuctionUtils.Time (currentPlutusPOSIXTime)
import HydraAuctionUtils.Tx.Common

import POCRE.OnChain.Types
import POCRE.Tx.Dispute

actorVk :: Actor -> IO _
actorVk actor = fst <$> keysFor actor

actorVkBytes :: Actor -> IO BuiltinByteString
actorVkBytes actor = do
  vk <- actorVk actor
  return $ toBuiltin $ serialiseToRawBytes vk

-- FIXME: to Tx and utils
initActor :: Actor -> L1Runner ()
initActor actor =
  void $ withActor Faucet $ transferAda actor Normal 100_000_000

spec :: Spec
spec = do
  -- Common data
  let
    disputeAuthor = Alice
    juryDefault = [Bob, Carol]
    delegates = [Oscar, Patricia, Rupert]
    headId = CurrencySymbol emptyByteString

  disputeAuthorVk <- liftIO $ actorVkBytes disputeAuthor
  juryVks <- liftIO $ mapM actorVkBytes juryDefault

  let mkTerms = do
        (POSIXTime currentTimeMilliseconds) <-
          liftIO currentPlutusPOSIXTime
        return $
          MkDisputeTerms
            { debugCheckSignatures = False
            , hydraHeadId = headId
            , claimFor = "Test"
            , claimer = disputeAuthorVk
            , voteInterval =
                ( POSIXTime $ currentTimeMilliseconds + 1_000
                , POSIXTime $ currentTimeMilliseconds + 10_000
                )
            , jury = juryVks
            }

  describe "L1 scenarios" $ do
    it "Scenario - settle with all votes" $ executeTestL1Runner $ do
      -- Preparation
      mapM_ initActor (disputeAuthor : juryDefault <> delegates)

      -- Create
      terms <- mkTerms
      _ <- withActor Oscar $ submitAndAwaitTx =<< createInitialUtxo terms

      -- Vote

      _ <-
        withActor Oscar $
          changeUtxo $
            Vote (juryVks !! 0) emptyByteString Yes
      _ <-
        withActor Carol $
          changeUtxo $
            Vote (juryVks !! 1) emptyByteString No

      -- Settle

      _ <- withActor Rupert $ changeUtxo $ Settle AllVotesCasted

      return ()

    it "Scenario - withdraw" $ executeTestL1Runner $ do
      -- Preparation
      mapM_ initActor (disputeAuthor : juryDefault <> delegates)

      -- Create
      terms <- mkTerms
      _ <- withActor disputeAuthor $ submitAndAwaitTx =<< createInitialUtxo terms

      -- Vote

      _ <-
        withActor Oscar $
          changeUtxo $
            Vote (juryVks !! 0) emptyByteString Yes
      _ <-
        withActor Carol $
          changeUtxo $
            Vote (juryVks !! 1) emptyByteString No

      -- Withdraw

      _ <- withActor Rupert $ changeUtxo $ Settle AllVotesCasted

      return ()
