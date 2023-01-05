import { Button } from '@mui/material';
import { useState } from 'react';
import LoginModal from 'components/LoginModal';
import Input from 'components/uicore/Input';
import { useNavigate } from 'react-router-dom';
import useExplore from './useExplore';
import UserSuggestions from '../common/components/userSuggestions';

// const getSuggestions = (suggestions) => {
//   if (suggestions) {
//     return suggestions.map((x) => ({ label: x.user_name, id: x.user_id }));
//   }
//   return [];
// };

function WalletExplore() {
  const navigate = useNavigate();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const onWalletSelect = (value) => {
    if (value?.user_id) {
      navigate(`/wallet/${value?.user_id}`);
    }
  };

  const { userWalletSuggestions, handleUserWalletInputChange } = useExplore();

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
        <Input
          variant="dark"
          placeholder="Search User Wallets!"
          name="creation"
          onInput={(event_) => handleUserWalletInputChange(event_)}
          autoComplete
        />
        <Button onClick={() => setShowLoginForm(true)} className="bg-black color-white">
          Login with your wallet
        </Button>
      </div>
      {userWalletSuggestions
      && userWalletSuggestions.slice(0, 5).map((user) => UserSuggestions({ user, onWalletSelect }))}
    </div>
  );
}

export default WalletExplore;
