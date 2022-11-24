/* eslint-disable indent */
import CameraIcon from 'assets/svgs/cameraIcon.svg';
import profileImg from 'assets/svgs/profile.svg';
import Loader from 'components/uicore/Loader';
import { useEffect, useState } from 'react';
import authUser from 'utils/helpers/authUser';
import useWallet from '../hooks/useWallet';
// import WalletProfileEdit from './profileEdit';
import WalletProfileInfo from './profileInfo';

function WalletProfile({
  onEditProfile = () => {},
  publicUserId = null, // when public user id is present we only show public information of user
}) {
  const [isEditMode] = useState(false);
  const [userDataToDisplay, setUserDataToDisplay] = useState({});
  const {
    userProfile,
    fetchUserProfile,
    userCollectionCount,
    uploadUserImage,
    userProfileImageUrl,
    isImageUploaded,
  } = useWallet();

  useEffect(() => {
    setUserDataToDisplay(userProfile);
  }, [userProfile]);

  function handleUploadImage(event) {
    const file = event.target.files[0];
    uploadUserImage(file);
  }

  useEffect(() => {
    if (publicUserId) fetchUserProfile(publicUserId);
    else fetchUserProfile(authUser.getUser().user_id);
  }, [publicUserId]);

  const getProfileImage = () => {
    if (userProfile && userProfile.imageUrl) {
      return userProfile.imageUrl;
    }
    if (userProfileImageUrl) {
      return userProfileImageUrl;
    }
    return profileImg;
  };

  return (
    <div className="wallet-detail-container">
      <div className="wallete-detail-left-container">
        <div className="front-face-photo">
          <img src={getProfileImage()} alt="alt" loading="lazy" />
          {isEditMode && (
            <div className="edit-camera">

              <label htmlFor="file-input">
                {
                  isImageUploaded ? <Loader />
                    : (
                      <>
                        <img src={CameraIcon} alt="camera" loading="lazy" />
                        <input />
                      </>
                    )
                }
              </label>
              <input type="file" id="file-input" inputProps={{ accept: 'image/*' }} onChange={(file) => handleUploadImage(file)} />
            </div>
          )}
        </div>
        <span className="author-collection">
          Author of
          <span style={{ marginLeft: '4px', marginRight: '4px' }}>{userCollectionCount}</span>
          creations
        </span>
      </div>
      {isEditMode ? (
        <hey />
        // <WalletProfileEdit
        //   key={isEditMode}
        //   initialValues={{
        //     name: userDataToDisplay?.name,
        //     email: userDataToDisplay?.email,
        //     phone: userDataToDisplay?.phone,
        //     bio: userDataToDisplay?.bio,
        //   }}
        //   userId={userId}
        //   imageUrl={userProfileImageUrl}
        //   onUpdate={(data) => setUserDataToDisplay(data)}
        //   onEditCancel={() => setDetailEdit(false)}
        // />
      ) : (
        <WalletProfileInfo
          onEdit={onEditProfile}
          profileInfo={{
            name: userDataToDisplay?.name,
            email: userDataToDisplay?.email,
            phone: userDataToDisplay?.phone,
            bio: userDataToDisplay?.bio,
          }}
          canEdit={publicUserId}
        />
      )}
    </div>
  );
}
export default WalletProfile;
