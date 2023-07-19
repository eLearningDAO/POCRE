module POCRE.OnChain.Types (
  checkUserSign,
  UserID,
  Signature,
  isFinal,
  Decision (..),
  DisputeDatum (..),
  DisputeRedeemer (..),
  StateTokenRedeemer (..),
  otherDecisions,
  DisputeNonHydraRedeemer (..),
  SettleReason (..),
  DisputeTerms (..),
  allCastedVotes,
  juryLeft,
  DisputeState (..),
)
where

-- Prelude imports
import PlutusTx.Prelude
import Prelude qualified

-- Haskell imports
import Data.Aeson (FromJSON, ToJSON)
import GHC.Generics (Generic)

-- Plutus imports

import PlutusLedgerApi.V1.Time (POSIXTime)
import PlutusLedgerApi.V1.Value (CurrencySymbol (..))
import PlutusTx qualified
import PlutusTx.Deriving qualified as PlutusTx

-- HydraAuctionUtils imports
import HydraAuctionUtils.Extras.PlutusOrphans ()

-- POCRE imports
import POCRE.OnChain.TotalMap

type Signature = BuiltinByteString

-- This is PubKeyHash, but Plutus does not have separate type for that
type UserID = BuiltinByteString
type ClaimID = BuiltinByteString

data StateTokenRedeemer = MintToken
PlutusTx.makeIsDataIndexed ''StateTokenRedeemer [('MintToken, 0)]

data Decision = Yes | No | Abstain
  deriving stock (Prelude.Eq, Prelude.Show, Generic)
  deriving anyclass (FromJSON, ToJSON)

PlutusTx.unstableMakeIsData ''Decision
PlutusTx.deriveEq ''Decision

instance BoundedEnum Decision where
  enumerateValues = [Yes, No, Abstain]

otherDecisions :: Decision -> [Decision]
otherDecisions Yes = [No, Abstain]
otherDecisions No = [Yes, Abstain]
otherDecisions Abstain = [Yes, No]

data DisputeRedeemer = MoveToHydra | NonHydra DisputeNonHydraRedeemer
  deriving stock (Prelude.Eq, Prelude.Show, Generic)
  deriving anyclass (FromJSON, ToJSON)

data DisputeNonHydraRedeemer
  = -- | Can be called by jury, once
    Vote UserID Signature Decision
  | -- | Can be called by claimer, if they change mind about Dispute
    -- TODO: Cancel?
    Withdraw Signature
  | Settle SettleReason
  deriving stock (Prelude.Eq, Prelude.Show, Generic)
  deriving anyclass (FromJSON, ToJSON)

data SettleReason = AllVotesCasted | Timeout
  deriving stock (Prelude.Eq, Prelude.Show, Generic)
  deriving anyclass (FromJSON, ToJSON)

PlutusTx.unstableMakeIsData ''SettleReason
PlutusTx.unstableMakeIsData ''DisputeNonHydraRedeemer
PlutusTx.unstableMakeIsData ''DisputeRedeemer

data DisputeState = InProgress | Settled Decision | Withdrawed
  deriving stock (Prelude.Eq, Prelude.Show, Generic)
  deriving anyclass (FromJSON, ToJSON)

isFinal :: DisputeState -> Bool
isFinal state = case state of
  InProgress -> False
  Settled {} -> True
  Withdrawed -> True

PlutusTx.unstableMakeIsData ''DisputeState
PlutusTx.deriveEq ''DisputeState

-- | Static part of Dispute state
data DisputeTerms = MkDisputeTerms
  { debugCheckSignatures :: Bool
  , hydraHeadId :: CurrencySymbol
  , claimFor :: ClaimID
  , claimer :: UserID
  , voteInterval :: (POSIXTime, POSIXTime)
  , jury :: [UserID]
  }
  deriving stock (Prelude.Eq, Prelude.Show, Generic)
  deriving anyclass (FromJSON, ToJSON)

PlutusTx.unstableMakeIsData ''DisputeTerms
PlutusTx.deriveEq ''DisputeTerms

data DisputeDatum = MkDisputeDatum
  { terms :: DisputeTerms
  , votesCastedFor :: TotalMap Decision [UserID]
  , state :: DisputeState
  }
  deriving stock (Prelude.Eq, Prelude.Show, Generic)
  deriving anyclass (FromJSON, ToJSON)

PlutusTx.unstableMakeIsData ''DisputeDatum
PlutusTx.deriveEq ''DisputeDatum

-- Common data logic

allCastedVotes :: DisputeDatum -> [UserID]
allCastedVotes datum =
  fold $ allValues $ votesCastedFor datum

juryLeft :: DisputeDatum -> [UserID]
juryLeft datum =
  filter notCasted $ jury $ terms datum
  where
    notCasted x = not $ elem x (allCastedVotes datum)

checkUserSign :: DisputeTerms -> UserID -> Signature -> Bool
checkUserSign
  (MkDisputeTerms {debugCheckSignatures, hydraHeadId})
  user
  signature =
    {- HLINT ignore "Redundant if" -}
    if debugCheckSignatures
      then verifyEd25519Signature user headCurrencySymbol signature
      else True
    where
      CurrencySymbol headCurrencySymbol = hydraHeadId
