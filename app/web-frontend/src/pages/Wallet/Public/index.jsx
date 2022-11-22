import React from 'react';
import { useParams } from 'react-router-dom';
import WalletProfile from '../common/components/profile';

function WalletPublic() {
  const { id: userId } = useParams();
  
  return (
    <div className="wallet-container">
      <WalletProfile publicUserId={userId} />
    </div>
  );
}

export default WalletPublic;
