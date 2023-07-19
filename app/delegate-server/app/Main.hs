module Main where

import HydraAuctionUtils.Prelude

import Control.Concurrent.Async (mapConcurrently_)
import Control.Concurrent.STM (
  dupTChan,
  newTChan,
  newTQueue,
  readTChan,
  writeTQueue,
 )

import PlutusLedgerApi.V1.Time (POSIXTime (..))

import Hydra.Network (Host (..))
import HydraAuctionUtils.Delegate.Interface
import HydraAuctionUtils.Delegate.Server
import HydraAuctionUtils.Hydra.Interface (
  HydraConnectionConfig (..),
  HydraProtocol,
 )
import HydraAuctionUtils.Hydra.Runner (executeHydraRunnerFakingParams)
import HydraAuctionUtils.L1.Runner (executeL1RunnerWithNodeAs)
import HydraAuctionUtils.Parsers (execParserForCliArgs)
import HydraAuctionUtils.Time (currentPlutusPOSIXTime)
import HydraAuctionUtils.WebSockets.Client (newFakeClient, withProtocolClient)
import HydraAuctionUtils.WebSockets.ClientId (ClientResponseScope (..))
import HydraAuctionUtils.WebSockets.Protocol.Void (VoidProtocolImplementation)
import HydraAuctionUtils.WebSockets.Server

import POCRE.Delegate
import POCRE.OnChain.Types

import Config

data ThreadSort
  = WebsocketThread
  | DelegateLogicStepsThread
  | QueueHydraEventsThread
  | QueueCustomEventsThread
  deriving stock (Eq, Ord, Show)

-- | run a delegate server
runDelegateServer ::
  HasCallStack =>
  -- | the configuration of the delegate server
  DelegateServerConfig ->
  IO ()
runDelegateServer conf = do
  eventQueue <- liftIO . atomically $ do
    q <- newTQueue
    writeTQueue q Start
    pure q
  frontendRequestQueue <- liftIO . atomically $ newTQueue
  toClientsChannel <- liftIO . atomically $ newTChan

  let workerAction threadSort =
        case threadSort of
          WebsocketThread ->
            let queues =
                  MkServerQueues
                    { clientInputs = frontendRequestQueue
                    , serverOutputs = toClientsChannel
                    }
             in liftIO $
                  runWebsocketsServer @POCREDelegateProtocol
                    (websocketsHost conf)
                    queues
          DelegateLogicStepsThread -> do
            voidClient <- newFakeClient @VoidProtocolImplementation
            void $
              liftIO $ do
                executeHydraRunnerForConfig $ do
                  runDelegateLogicSteps @POCREDelegateProtocol
                    (tick conf)
                    voidClient
                    eventQueue
                    frontendRequestQueue
                    toClientsChannel
          QueueHydraEventsThread ->
            liftIO $
              executeHydraRunnerForConfig $
                queueHydraEvents eventQueue
          QueueCustomEventsThread -> queueCustomEventsThread eventQueue toClientsChannel

  liftIO $
    mapConcurrently_
      workerAction
      [ WebsocketThread
      , QueueHydraEventsThread
      , QueueCustomEventsThread
      , DelegateLogicStepsThread
      ]
  where
    executeHydraRunnerForConfig action = do
      withProtocolClient (hydraNodeHost conf) clientConfig $ \hydraClient -> do
        putStrLn "1"
        executeL1RunnerWithNodeAs (cardanoNode conf) (l1Actor conf) $ do
          putStrLn "2"
          executeHydraRunnerFakingParams hydraClient action
    clientConfig = MkHydraConnectionConfig {retrieveHistory = True}

queueCustomEventsThread delegateEvents toClientsChannel = do
  terms <-
    liftIO $
      awaitForTerms =<< atomically (dupTChan toClientsChannel)
  putStrLn $ "Terms set " <> show terms
  waitForVotingEnd terms
  putStrLn "Voting ended"
  atomically $ writeTQueue delegateEvents $ CustomEvent VotingEnded
  where
    tick = 1_000
    awaitForTerms chan =
      atomically (readTChan chan) >>= \case
        (Broadcast, CustomEventHappened (VotingTermsSet terms)) -> pure terms
        _ -> do
          threadDelay tick
          awaitForTerms chan

    waitForVotingEnd terms = do
      -- Wait for voting end
      let POSIXTime votingEndTime = snd $ voteInterval terms
      POSIXTime currentPosixTime <- currentPlutusPOSIXTime
      let milliSecsToWait = votingEndTime - currentPosixTime
      when (milliSecsToWait > 0) $
        threadDelay $
          fromInteger $
            milliSecsToWait * 1000

main :: HasCallStack => IO ()
main = do
  --- XXX: this prevents logging issues in Docker
  hSetBuffering stdout LineBuffering
  hSetBuffering stderr LineBuffering
  conf <- execParserForCliArgs delegateConfigParser
  runDelegateServer conf
