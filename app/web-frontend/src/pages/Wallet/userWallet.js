import React from 'react';
import { useParams } from 'react-router-dom';
import WalletDetail from './detail/walletDetail';
import WalletCollections from './walletCollections';

function UserWallet() {
  const { id } = useParams();
  return (
    <div className="wallet-container">
      <WalletDetail displayOnlyId={id} />
      <WalletCollections />
    </div>
  );
}

export default UserWallet;
