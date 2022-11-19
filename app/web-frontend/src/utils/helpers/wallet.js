import { Address } from '@emurgo/cardano-serialization-lib-asmjs';
// eslint-disable-next-line import/no-unresolved, unicorn/prefer-module
const { Buffer } = require('buffer/');

const getAvailableWallets = () => {
  const keys = [];

  for (const key in window.cardano) {
    if (window.cardano[key].enable) {
      keys.push(key);
    }
  }

  return keys;
};

const getWalletAddress = async (walletName) => {
  try {
    const API = await window.cardano[walletName].enable();
    const raw = await API.getUsedAddresses();
    const rawFirst = raw[0];
    return Address.from_bytes(Buffer.from(rawFirst, 'hex')).to_bech32();
  } catch {
    return null;
  }
};

export { getAvailableWallets, getWalletAddress };
