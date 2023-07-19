{-# LANGUAGE ApplicativeDo #-}

module Config (DelegateServerConfig (..), delegateConfigParser) where

-- Prelude imports
import HydraAuctionUtils.Prelude

-- Haskell imports
import Options.Applicative (Parser)
import Options.Applicative.Builder (help, long, metavar, option)

-- Hydra imports
import Hydra.Network (Host)

-- Cardano node imports
import CardanoNode (RunningNode (..))

-- Hydra auction imports

import HydraAuctionUtils.Fixture (Actor)
import HydraAuctionUtils.Parsers (
  cardanoRunningNodeParser,
  parseActor,
  parseHost,
 )

-- | The config for the delegate server
data DelegateServerConfig = DelegateServerConfig
  { websocketsHost :: Host
  , cardanoNode :: RunningNode
  , hydraNodeHost :: Host
  , l1Actor :: Actor
  -- ^ should match Hydra node acto
  , tick :: Int
  -- ^ the amount of milliseconds, the event polling threads should wait
  , ping :: Int
  -- ^ the amount of seconds between pings for the client thread
  }

delegateConfigParser :: Parser DelegateServerConfig
delegateConfigParser = do
  l1Actor <- actorParser
  cardanoNode <- cardanoRunningNodeParser
  websocketsHost <- websocketsHostParser
  hydraNodeHost <- hydraNodeParser
  return
    DelegateServerConfig
      { websocketsHost
      , cardanoNode
      , hydraNodeHost
      , l1Actor
      , tick = tick
      , ping = ping
      }
  where
    tick :: Int
    tick = 1_000
    ping :: Int
    ping = 30

actorParser :: Parser Actor
actorParser =
  option
    parseActor
    ( long "actor"
        <> metavar "ACTOR"
        <> help "Actor matching Hydra Node we working with"
    )

hydraNodeParser :: Parser Host
hydraNodeParser =
  option
    (parseHost Nothing)
    ( long "hydra-node"
        <> metavar "HYDRA_NODE"
        <> help "Host and port of Hydra node to work with"
    )

websocketsHostParser :: Parser Host
websocketsHostParser =
  option
    (parseHost Nothing)
    ( long "websockets-host"
        <> metavar "WEBSOCKETS_HOST"
        <> help "Host and port to use for serving Websocket server"
    )
