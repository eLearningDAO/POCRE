import authUser from 'utils/helpers/authUser';
import WalletExplore from '../Explore';
import WalletSelf from '../Self';

function WalletHome() {
  const isLoggedIn = authUser.getUser() && authUser.getJWTToken();
  return isLoggedIn ? <WalletSelf /> : <WalletExplore />;
}

export default WalletHome;
