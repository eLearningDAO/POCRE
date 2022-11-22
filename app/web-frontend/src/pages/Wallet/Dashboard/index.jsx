import React from 'react';
import { useParams } from 'react-router-dom';
import WalletDetail from '../common/components/walletDetail';
import WalletCollections from '../common/components/walletCollections';

function Dashboard() {
  const { id } = useParams();
  return (
    <div className="wallet-container">
      <WalletDetail displayOnlyId={id} />
      <WalletCollections />
    </div>
  );
}

export default Dashboard;
