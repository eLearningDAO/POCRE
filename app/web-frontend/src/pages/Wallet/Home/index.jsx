import React from 'react';
import './Wallet.css';
import WalletCollections from '../walletCollections';
import WalletDetail from '../detail/walletDetail';

function Wallet() {
  return (
    <div className="wallet-container">
      <WalletDetail />
      <WalletCollections />
    </div>
  );
}

export default Wallet;
