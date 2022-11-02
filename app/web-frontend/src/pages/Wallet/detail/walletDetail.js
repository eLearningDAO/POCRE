/* eslint-disable indent */
import React, { useEffect, useState } from 'react';
import { Alert } from '@mui/material';
import profileImg from '../../../assets/svgs/profile.svg';
import WalletDetailEdit from './walletDetailEdit';
import WalletDisplay from './walletDisplay';
import CameraIcon from '../../../assets/svgs/cameraIcon.svg';
import useWalletStore from '../../../hooks/userWalletService';
import useUserInfo from '../../../hooks/user/userInfo';

let userId = '43704731-d816-4f1f-a599-eb290f67c3f4';

function WalletDetail() {
  const [initialValues, setInitialValues] = useState({});
  const [isDetailEdit, setDetailEdit] = useState(false);
  const getUserById = useWalletStore((state) => state.getUserById);
  const userData = useWalletStore((state) => state.userData);
  const user = useUserInfo((state) => state.user);
  const getUserCollectionCount = useWalletStore((state) => state.getUserCollectionCount);
  const userCollectionCount = useWalletStore((state) => state.userCollectionCount);
  const uploadUserImage = useWalletStore((state) => state.uploadUserImage);
  const userProfileImageUrl = useWalletStore((state) => state.userProfileImageUrl);
  const userUpdateError = useWalletStore((state) => state.userUpdateError);
  async function handleUploadImage(event) {
    const file = event.target.files[0];
    await uploadUserImage(file);
  }
  useEffect(() => {
    if (user && user.user_id) {
      userId = user.user_id;
      getUserById(userId);
      getUserCollectionCount(userId);
    }
  }, [user]);
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
      // delete init.walletAddress;
      delete init.walletType;
      delete init.reputationStars;
      setInitialValues(init);
    }
  }, [userData]);

  return (
    <>
      <div className="wallet-detail-container">
        <div className="wallete-detail-left-container">
          <div className="front-face-photo">
            <img src={getProfileImage()} alt="alt" loading="lazy" />
            {isDetailEdit && (
              <div className="edit-camera">
                <label htmlFor="file-input">
                  <img src={CameraIcon} alt="camera" loading="lazy" />
                  <input />
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
          <WalletDisplay setDetailEdit={setDetailEdit} user={userData} />
        )}
      </div>
      {userUpdateError && userUpdateError.error
        && (
          <Alert
            severity="error"
            sx={{ width: '50%' }}
          >
            {userUpdateError.message}
          </Alert>
        )}
    </>
  );
}
export default WalletDetail;
