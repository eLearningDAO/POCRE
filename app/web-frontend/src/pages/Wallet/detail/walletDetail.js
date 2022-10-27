/* eslint-disable indent */
import React, { useState } from 'react';
import profileImg from '../../../assets/svgs/profile.svg';
import WalletDetailEdit from './walletDetailEdit';
import WalletDisplay from './walletDisplay';
import CameraIcon from '../../../assets/svgs/cameraIcon.svg';

function WalletDetail() {
  const [isDetailEdit, setDetailEdit] = useState(false);

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
        <WalletDetailEdit />
      ) : (
        <WalletDisplay setDetailEdit={setDetailEdit} />
      )}
    </div>
  );
}
export default WalletDetail;
