/* eslint-disable indent */
import Loader from 'components/uicore/Loader';
import { useEffect, useState } from 'react';
import authUser from 'utils/helpers/authUser';
import CameraIcon from 'assets/svgs/cameraIcon.svg';
import profileImg from 'assets/svgs/profile.svg';
import useWallet from '../hooks/useWallet';
import WalletProfileEdit from './profileEdit';
import WalletProfileInfo from './profileInfo';

let userId = '43704731-d816-4f1f-a599-eb290f67c3f4';

function WalletProfile({
  publicUserId = null, // when public user id is present we only show public information of user
}) {
  const [initialValues, setInitialValues] = useState({});
  const [isEditMode, setDetailEdit] = useState(false);
  const [isDisplayOnly, setIsDisplayOnly] = useState(false);
  const {
    userData,
    fetchUserDetailsById,
    userCollectionCount,
    uploadUserImage,
    userProfileImageUrl,
    isImageUploaded,
  } = useWallet();

  function handleUploadImage(event) {
    const file = event.target.files[0];
    uploadUserImage(file);
  }
  useEffect(() => {
    const user = authUser.getUser();
    if (user && user.user_id) {
      userId = user.user_id;
      fetchUserDetailsById(userId);
    }
  }, [publicUserId]);

  useEffect(() => {
    if (publicUserId) {
      fetchUserDetailsById(publicUserId);
      setIsDisplayOnly(true);
    }
  }, [publicUserId]);

  const getProfileImage = () => {
    if (userData && userData.imageUrl) {
      return userData.imageUrl;
    }
    if (userProfileImageUrl) {
      return userProfileImageUrl;
    }
    return profileImg;
  };

  useEffect(() => {
    // eslint-disable-next-line  no-param-reassign
    if (userData) {
      const init = { ...userData };
      delete init.walletAddress;
      delete init.walletType;
      delete init.reputationStars;
      delete init.imageUrl;
      setInitialValues(init);
    }
  }, [userData]);

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
          collections
        </span>
      </div>
      {isEditMode ? (
        <WalletProfileEdit
          setDetailEdit={setDetailEdit}
          initialValues={initialValues}
          userId={userId}
          imageUrl={userProfileImageUrl}
        />
      ) : (
        <WalletProfileInfo
          onEdit={() => setDetailEdit(true)}
          profileInfo={{
            name: userData?.name,
            email: userData?.email,
            phone: userData?.phone,
            bio: userData?.bio,
          }}
          isDisplayOnly={isDisplayOnly}
        />
      )}
    </div>
  );
}
export default WalletProfile;
