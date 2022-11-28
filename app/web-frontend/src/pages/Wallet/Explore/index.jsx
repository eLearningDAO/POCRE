import { Button } from '@mui/material';
import { useState } from 'react';
import LoginModal from 'components/LoginModal';
import Input from 'components/uicore/Input';

function WalletExplore() {
  const [showLoginForm, setShowLoginForm] = useState(false);

  return (
    <div className="wallet-container">
      {showLoginForm && (
      <LoginModal
        onClose={() => setShowLoginForm(false)}
        onLoggedIn={() => {
          // eslint-disable-next-line no-self-assign
          window.location = window.location;
        }}
      />
      )}
      <div className="wallet-explore-header">
        <Input variant="dark" placeholder="Search Public Wallets [coming soon]" />
        <Button onClick={() => setShowLoginForm(true)} className="bg-black color-white">
          Login with your wallet
        </Button>
      </div>
      <div className="color-black h4 m-auto mt-24 text-center">
        Search Results will be displayed here
      </div>
    </div>
  );
}

export default WalletExplore;
