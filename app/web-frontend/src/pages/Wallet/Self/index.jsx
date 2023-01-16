import { Grid } from '@mui/material';
import Tile from 'components/tile';
import { useNavigate } from 'react-router-dom';
import Input from 'components/uicore/Input';
import authUser from 'utils/helpers/authUser';
import WalletProfile from '../common/components/profile';
import useExplore from '../common/hooks/useExplore';
import UserSuggestions from '../common/components/userSuggestions';
import './index.css';

function WalletSelf() {
  const navigate = useNavigate();
  const { walletSuggestions, handleWalletInputChange } = useExplore();
  const onWalletSelect = (value) => {
    if (value?.user_id) {
      navigate(`/wallet/${value?.user_id}`);
    }
  };

  const handleViewCreattion = () => navigate('/creations');
  const handleCreateCreattion = () => navigate('/creations/create');

  const user = authUser.getUser();

  return (
    <div className="wallet-explore-root">
      <div className="wallet-explore-header">
        <Input
          variant="dark"
          placeholder="Search User Wallets!"
          name="creation"
          onInput={(event_) => handleWalletInputChange(event_)}
          autoComplete
        />
      </div>
      {walletSuggestions
      && walletSuggestions.slice(0, 5).map((wallet) => UserSuggestions({ wallet, onWalletSelect }))}
      <div className="wallet-container">
        <WalletProfile
          name={user?.user_name}
          bio={user?.user_bio}
          phone={user?.phone}
          email={user?.email_address}
          image={user?.image_url}
          stars={user?.reputation_stars || 0}
          totalCreationsAuthored={user?.creation_count || 0}
          hashedWalletAddress={user?.hashedWalletAddress}
          canEdit
        />
        <Grid container className="wallet-collection-container">
          <Grid item md={12} sm={12} xs={12} className="wallet-collection-right">
            <Tile
              icon="gallery"
              onClick={handleViewCreattion}
              label="View my creations"
              variant="filled"
            />
            <Tile
              icon="pencil"
              onClick={handleCreateCreattion}
              label="New creation"
              variant="outlined"
            />
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

export default WalletSelf;
