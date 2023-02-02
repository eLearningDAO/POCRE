import Loader from 'components/uicore/Loader';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import WalletProfile from '../common/components/profile';
import usePublic from './usePublic';

function WalletPublic() {
  const { id: userId } = useParams();
  const [creationCount , setCreationCount] = useState()

  const {
    creations,
    getPublicProfile,
    publicProfile,
    isFetchingPublicProfile,
    fetchPublicProfileStatus
  } = usePublic();

  useEffect(() => {
    if (userId) getPublicProfile(userId)
  }, [userId])
  useEffect(() => {
    if (creations) setCreationCount(creations.total_results)
  }, [creations])

  return (
    <div className="wallet-container">
      {isFetchingPublicProfile && <Loader />} 
      {fetchPublicProfileStatus.error && <h4 className='h4'>{fetchPublicProfileStatus.error}</h4>}
      {fetchPublicProfileStatus.success && publicProfile && creations && <WalletProfile
        name={publicProfile?.user_name}
        bio={publicProfile?.user_bio}
        id= {publicProfile?.user_id}
        phone={'Private Info'}
        creationCount={creationCount}
        email={publicProfile?.email_verified?'Email Verified':'Private Info'}
        image={publicProfile?.image_url || require('assets/images/profile-placeholder.png')}
        isInvited={publicProfile?.is_invited}
        emailVerified={publicProfile?.email_verified || false}
        stars={publicProfile?.reputation_stars || 0}
      />}
    </div>
  );
}

export default WalletPublic;
