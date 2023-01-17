import { BrowserWallet, Transaction } from '@meshsdk/core';
import { POCRE_WALLET_ADDRESS } from 'config';

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

const transactADAToPOCRE = async ({
  amountADA = 0,
  purposeDesc = '',
  metaData = {},
  walletName = '',
}) => {
  try {
    // connect to the wallet
    const wallet = await BrowserWallet.enable(walletName);

    // build transaction
    const tx = new Transaction({ initiator: wallet });

    // set amount
    tx.sendLovelace(POCRE_WALLET_ADDRESS, `${amountADA * 1_000_000}`); // convert ada to lovelace

    // set metadata
    tx.setMetadata(0, {
      amount: { lovelace: amountADA * 1_000_000, ada: amountADA },
      pocreVersion: '0.1', // beta
      purposeDesc,
      ...metaData,
    });

    // sign the transaction
    const unsignedTx = await tx.build();
    const signedTx = await wallet.signTx(unsignedTx);

    // submit transaction
    return await wallet.submitTx(signedTx);
  } catch (error) {
    const errorMessage = error?.message;

    if (error === 'null not allowed in metadata') {
      throw new Error('Invalid transaction details');
    }

    if (errorMessage.includes('"code":-3')) {
      throw new Error('Refused to make transaction');
    }

    throw new Error('Failed to make transaction');
  }
};

export { getAvailableWallets, getWalletAddress, transactADAToPOCRE };
