module POCRE.OnChain.TotalMap (
  TotalMap,
  createTotalMap,
  lookup,
  insert,
  allValues,
  BoundedEnum (..),
) where

-- Prelude imports
import PlutusTx.Prelude

-- Plutus imports

import PlutusTx qualified
import PlutusTx.AssocMap qualified as Map
import PlutusTx.Deriving qualified as PlutusTx

-- Datatype

-- | Plutus does not have Bounded, so creating ours
class Eq x => BoundedEnum x where
  enumerateValues :: [x]

newtype TotalMap from to = UnsafeMkTotalMap (Map.Map from to)
PlutusTx.unstableMakeIsData ''TotalMap
PlutusTx.deriveEq ''TotalMap

instance Functor (TotalMap from) where
  fmap f (UnsafeMkTotalMap realMap) = UnsafeMkTotalMap $ fmap f realMap

{-# INLINEABLE createTotalMap #-}
createTotalMap :: BoundedEnum from => to -> TotalMap from to
createTotalMap initialValue =
  UnsafeMkTotalMap $
    Map.fromList $
      [(key, initialValue) | key <- enumerateValues]

{-# INLINEABLE lookup #-}
lookup :: BoundedEnum k => k -> TotalMap k v -> v
lookup key (UnsafeMkTotalMap realMap) =
  fromMaybe (traceError "Impossible") $ Map.lookup key realMap

{-# INLINEABLE insert #-}
insert :: BoundedEnum k => k -> v -> TotalMap k v -> TotalMap k v
insert key value (UnsafeMkTotalMap realMap) =
  UnsafeMkTotalMap $ Map.insert key value realMap

{-# INLINEABLE allValues #-}
allValues :: BoundedEnum k => TotalMap k v -> [v]
allValues totalMap = fmap (`lookup` totalMap) enumerateValues
