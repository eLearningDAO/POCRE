import { BrowserWallet, Transaction } from '@meshsdk/core';
import { Address, BaseAddress } from '@emurgo/cardano-serialization-lib-browser';
import { POCRE_WALLET_ADDRESS, POCRE_NETWORKS } from 'config';

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

    const netId = await wallet.getNetworkId();

    // get used address in wallet
    const usedAddresses = await wallet.getUsedAddresses();
    const realAddresses = usedAddresses.filter(() => process.env.REACT_APP_HOST_TYPE !== 'production' && netId !== POCRE_NETWORKS.MAINNET);

    if (realAddresses.length === 0) throw new Error('no wallet address');

    return realAddresses[0];
  } catch {
    return null;
  }
};

const transactADAToPOCRE = async ({
  amountADA = 0,
  walletName = '',
  metaData = {},
}) => {
  try {
    // connect to the wallet
    const wallet = await BrowserWallet.enable(walletName);

    // build transaction
    const tx = new Transaction({ initiator: wallet });

    // set amount
    tx.sendLovelace(POCRE_WALLET_ADDRESS.PREVIEW, `${amountADA * 1_000_000}`); // convert ada to lovelace

    // set metadata
    tx.setMetadata(0, {
      pocre_version: '0.1', // beta
      ...metaData,
    });

    // sign the transaction
    const unsignedTx = await tx.build();
    const signedTx = await wallet.signTx(unsignedTx);

    // submit transaction
    return await wallet.submitTx(signedTx);
  } catch (error) {
    const errorMessage = error?.message?.toLowerCase();

    if (error === 'null not allowed in metadata') {
      throw new Error('Invalid transaction details');
    }

    if (errorMessage.includes('an error occurred during build: utxo balance insufficient')) {
      throw new Error('Insufficient balance');
    }

    if (errorMessage.includes('"code":-3')) {
      throw new Error('Refused to make transaction');
    }

    throw new Error('Failed to make transaction');
  }
};

/**
 * @param {*} address Hex encoded CIP-30 Address
 * @returns Hex-encoded public key hash
 */
const addressHexToPkh = async (address) => BaseAddress.from_address(
  Address.from_bytes(Buffer.from(address, 'hex')),
)
  .payment_cred()
  .to_keyhash()
  .to_hex();

/**
 * @param {*} address Bech32 encoded CIP-30 Address
 * @returns Hex-encoded public key hash
 */
const addressBech32ToPkh = async (address) => BaseAddress.from_address(
  Address.from_bech32(address),
)
  .payment_cred()
  .to_keyhash()
  .to_hex();

export {
  getAvailableWallets, getWalletAddress, transactADAToPOCRE, addressHexToPkh, addressBech32ToPkh,
};
