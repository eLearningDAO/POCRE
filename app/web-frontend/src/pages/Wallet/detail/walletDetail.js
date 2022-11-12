/* eslint-disable indent */
import React, { useEffect, useState } from 'react';
import Loader from 'components/uicore/Loader';
import profileImg from '../../../assets/svgs/profile.svg';
import WalletDetailEdit from './walletDetailEdit';
import WalletDisplay from './walletDisplay';
import CameraIcon from '../../../assets/svgs/cameraIcon.svg';
import useUserInfo from '../../../hooks/user/userInfo';
import useWallet from '../useWallet';

let userId = '43704731-d816-4f1f-a599-eb290f67c3f4';

function WalletDetail({ displayOnlyId }) {
  const [initialValues, setInitialValues] = useState({});
  const [isDetailEdit, setDetailEdit] = useState(false);
  const [isDisplayOnly, setIsDisplayOnly] = useState(false);
  const {
    userData,
    fetchUserDetialById,
    userCollectionCount,
    uploadUserImage,
    userProfileImageUrl,
    isImageUploaded,
  } = useWallet();
  const user = useUserInfo((state) => state.user);
  function handleUploadImage(event) {
    const file = event.target.files[0];
    uploadUserImage(file);
  }
  useEffect(() => {
    if (user && user.user_id) {
      userId = user.user_id;
      fetchUserDetialById(userId);
    }
  }, [user, displayOnlyId]);

  useEffect(() => {
    if (displayOnlyId) {
      fetchUserDetialById(displayOnlyId);
      setIsDisplayOnly(true);
    }
  }, [displayOnlyId]);

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
          {isDetailEdit && (
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
      {isDetailEdit ? (
        <WalletDetailEdit
          setDetailEdit={setDetailEdit}
          initialValues={initialValues}
          userId={userId}
          imageUrl={userProfileImageUrl}
        />
      ) : (
        <WalletDisplay
          setDetailEdit={setDetailEdit}
          user={userData}
          isDisplayOnly={isDisplayOnly}
        />
      )}
    </div>
  );
}
export default WalletDetail;
