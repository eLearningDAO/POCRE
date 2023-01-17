import { BrowserWallet } from '@meshsdk/core';

const getAvailableWallets = async () => {
  try {
    const wallets = await BrowserWallet.getInstalledWallets();

    return wallets.map((x) => x?.name);
  } catch {
    return null;
  }
};

const getWalletAddress = async (walletName) => {
  try {
    // connect to the wallet
    const wallet = await BrowserWallet.enable(walletName);

    // get used address in wallet
    const usedAddresses = await wallet.getUsedAddresses();

    if (usedAddresses.length === 0) throw new Error('no wallet address');

    return usedAddresses[0];
  } catch {
    return null;
  }
};

export { getAvailableWallets, getWalletAddress };
