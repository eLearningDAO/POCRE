module POCRE.OnChain.Types (
  checkUserSign,
  UserID,
  Signature,
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

-- Plutus imports

import PlutusLedgerApi.V1.Time (POSIXTime)
import PlutusLedgerApi.V1.Value (CurrencySymbol (..))
import PlutusTx qualified
import PlutusTx.Deriving qualified as PlutusTx

-- POCRE imports
import POCRE.OnChain.TotalMap

type Signature = BuiltinByteString

-- This is PubKeyHash, but Plutus does not have separate type for that
type UserID = BuiltinByteString
type ClaimID = BuiltinByteString

data StateTokenRedeemer = MintToken
PlutusTx.makeIsDataIndexed ''StateTokenRedeemer [('MintToken, 0)]

data Decision = Yes | No | Abstain

PlutusTx.unstableMakeIsData ''Decision
PlutusTx.deriveEq ''Decision

instance BoundedEnum Decision where
  enumerateValues = [Yes, No, Abstain]

otherDecisions :: Decision -> [Decision]
otherDecisions Yes = [No, Abstain]
otherDecisions No = [Yes, Abstain]
otherDecisions Abstain = [Yes, No]

data DisputeRedeemer = MoveToHydra | NonHydra DisputeNonHydraRedeemer
data DisputeNonHydraRedeemer
  = Vote UserID Signature Decision
  | Settle SettleReason
data SettleReason = AllVotesCasted | Timeout

PlutusTx.unstableMakeIsData ''SettleReason
PlutusTx.unstableMakeIsData ''DisputeNonHydraRedeemer
PlutusTx.unstableMakeIsData ''DisputeRedeemer

data DisputeState = InProgress | Settled Decision
PlutusTx.unstableMakeIsData ''DisputeState
PlutusTx.deriveEq ''DisputeState

-- | Static part of Dispute state
data DisputeTerms = MkDisputeTerms
  { debugCheckSignatures :: Bool
  , hydraHeadId :: CurrencySymbol
  , claim :: (ClaimID, UserID)
  , voteInterval :: (POSIXTime, POSIXTime)
  , jury :: [UserID]
  }

PlutusTx.unstableMakeIsData ''DisputeTerms
PlutusTx.deriveEq ''DisputeTerms

data DisputeDatum = MkDisputeDatum
  { terms :: DisputeTerms
  , votesCastedFor :: TotalMap Decision [UserID]
  , state :: DisputeState
  }

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
