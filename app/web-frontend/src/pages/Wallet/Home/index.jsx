import WalletCollections from '../common/components/walletCollections';
import WalletDetail from '../common/components/walletDetail';
import './index.css';

function Wallet() {
  return (
    <div className="wallet-container">
      <WalletDetail />
      <WalletCollections />
    </div>
  );
}

export default Wallet;
