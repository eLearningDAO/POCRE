module POCRE.OnChain.Types (
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
import PlutusLedgerApi.V2 (PubKeyHash (..))
import PlutusTx qualified
import PlutusTx.Deriving qualified as PlutusTx

-- POCRE imports
import POCRE.OnChain.TotalMap

data StateTokenRedeemer = MintToken
PlutusTx.unstableMakeIsData ''StateTokenRedeemer

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
data DisputeNonHydraRedeemer = Vote Decision | Settle SettleReason
data SettleReason = AllVotesCasted | Timeout

PlutusTx.unstableMakeIsData ''SettleReason
PlutusTx.unstableMakeIsData ''DisputeNonHydraRedeemer
PlutusTx.unstableMakeIsData ''DisputeRedeemer

data DisputeState = InProgress | Settled Decision
PlutusTx.unstableMakeIsData ''DisputeState
PlutusTx.deriveEq ''DisputeState

type JuryID = PubKeyHash

-- | Static part of Dispute state
data DisputeTerms = MkDisputeTerms
  { hydraHeadId :: CurrencySymbol
  , -- FIXME
    -- claim :: (Creation, AssumedCreator)
    voteInterval :: (POSIXTime, POSIXTime)
  , jury :: [JuryID]
  }

PlutusTx.unstableMakeIsData ''DisputeTerms
PlutusTx.deriveEq ''DisputeTerms

data DisputeDatum = MkDisputeDatum
  { terms :: DisputeTerms
  , votesCastedFor :: TotalMap Decision [JuryID]
  , state :: DisputeState
  }

PlutusTx.unstableMakeIsData ''DisputeDatum
PlutusTx.deriveEq ''DisputeDatum

allCastedVotes :: DisputeDatum -> [JuryID]
allCastedVotes datum =
  fold $ allValues $ votesCastedFor datum

juryLeft :: DisputeDatum -> [JuryID]
juryLeft datum =
  filter notCasted $ jury $ terms datum
  where
    notCasted x = not $ elem x (allCastedVotes datum)
