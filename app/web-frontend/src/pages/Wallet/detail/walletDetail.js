/* eslint-disable indent */
import React, { useEffect, useState } from 'react';
import profileImg from '../../../assets/svgs/profile.svg';
import WalletDetailEdit from './walletDetailEdit';
import WalletDisplay from './walletDisplay';
import CameraIcon from '../../../assets/svgs/cameraIcon.svg';
import useWalletStore from '../../../hooks/userWalletService';
import useUserInfo from '../../../hooks/user/userInfo';

let userId = '43704731-d816-4f1f-a599-eb290f67c3f4';

function WalletDetail() {
  const [isDetailEdit, setDetailEdit] = useState(false);
  const getUserById = useWalletStore((state) => state.getUserById);
  const userData = useWalletStore((state) => state.userData);
  const user = useUserInfo((state) => state.user);
  const getUserCollectionCount = useWalletStore((state) => state.getUserCollectionCount);
  const userCollectionCount = useWalletStore((state) => state.userCollectionCount);

  useEffect(() => {
    if (user && user.user_id) {
      userId = user.user_id;
      getUserById(userId);
      getUserCollectionCount(userId);
    }
  }, [user]);
  return (
    <div className="wallet-detail-container">
      <div className="wallete-detail-left-container">
        <div className="front-face-photo">
          <img src={profileImg} alt="alt" loading="lazy" />
          {isDetailEdit && (
            <div className="edit-camera">
              <img src={CameraIcon} alt="camera" loading="lazy" />
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
        <WalletDetailEdit setDetailEdit={setDetailEdit} user={userData} userId={userId} />
      ) : (
        <WalletDisplay setDetailEdit={setDetailEdit} user={userData} />
      )}
    </div>
  );
}
export default WalletDetail;
