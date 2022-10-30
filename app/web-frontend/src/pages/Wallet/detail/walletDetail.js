/* eslint-disable indent */
import React, { useEffect, useState } from 'react';
import profileImg from '../../../assets/svgs/profile.svg';
import WalletDetailEdit from './walletDetailEdit';
import WalletDisplay from './walletDisplay';
import CameraIcon from '../../../assets/svgs/cameraIcon.svg';
import useWalletStore from '../../../hooks/userWalletService';

const userId = '43704731-d816-4f1f-a599-eb290f67c3f4';

function WalletDetail() {
  const [isDetailEdit, setDetailEdit] = useState(false);
  const getUserById = useWalletStore((state) => state.getUserById);
  const userData = useWalletStore((state) => state.userData);
  useEffect(() => {
    getUserById(userId);
  }, []);

  console.log('detail', userData);

  return (
    <div className="wallet-detail-container">
      <div className="wallete-detail-left-container">
        <div className="front-face-photo">
          <img src={profileImg} alt="alt" />
          {isDetailEdit && (
            <div className="edit-camera">
              <img src={CameraIcon} alt="camera" />
            </div>
          )}
        </div>

        <span className="author-collection">Author of 10 collections</span>
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
