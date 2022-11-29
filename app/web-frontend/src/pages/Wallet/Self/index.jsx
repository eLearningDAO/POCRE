import { Grid } from '@mui/material';
import Tile from 'components/tile';
import { useNavigate } from 'react-router-dom';
import authUser from 'utils/helpers/authUser';
import WalletProfile from '../common/components/profile';
import './index.css';

function WalletSelf() {
  const navigate = useNavigate();

  const handleViewCreattion = () => navigate('/creations');
  const handleCreateCreattion = () => navigate('/creations/create');

  const user = authUser.getUser();

  return (
    <div className="wallet-container">
      <WalletProfile
        name={user?.user_name}
        bio={user?.user_bio}
        phone={user?.phone}
        email={user?.email_address}
        image={user?.image_url}
        stars={user?.reputation_stars || 0}
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
  );
}

export default WalletSelf;
