import { useState } from 'react';
import LoginModal from 'components/LoginModal';
import Input from 'components/uicore/Input';
import { useNavigate } from 'react-router-dom';
import useExplore from '../common/hooks/useExplore';
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

  const { walletSuggestions, handleWalletInputChange } = useExplore();

  return (
    <div className="wallet-container-public-user">
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
          placeholder="Search for other users"
          name="creation"
          onInput={(event_) => handleWalletInputChange(event_)}
          autoComplete
        />
      </div>
      {walletSuggestions
      && walletSuggestions.slice(0, 5).map((wallet) => UserSuggestions({ wallet, onWalletSelect }))}
    </div>
  );
}

export default WalletExplore;
