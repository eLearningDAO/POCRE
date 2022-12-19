import Loader from 'components/uicore/Loader';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import WalletProfile from '../common/components/profile';
import usePublic from './usePublic';

function WalletPublic() {
  const { id: userId } = useParams();

  const {
    getPublicProfile,
    publicProfile,
    isFetchingPublicProfile,
    fetchPublicProfileStatus
  } = usePublic();

  useEffect(() => {
    if (userId) getPublicProfile(userId)
  }, [userId])

  return (
    <div className="wallet-container">
      {isFetchingPublicProfile && <Loader />} 
      {fetchPublicProfileStatus.error && <h4 className='h4'>{fetchPublicProfileStatus.error}</h4>}
      {fetchPublicProfileStatus.success && publicProfile && <WalletProfile
        name={publicProfile?.user_name}
        bio={publicProfile?.user_bio}
        phone={publicProfile?.phone}
        email={publicProfile?.email_address}
        image={publicProfile?.image_url || require('assets/images/profile-placeholder.png')}
        isInvited={publicProfile?.is_invited}
        stars={publicProfile?.reputation_stars || 0}
      />}
    </div>
  );
}

export default WalletPublic;
