import React from 'react';
import EditIcon from '@mui/icons-material/Edit';
import Rating from '@mui/material/Rating';
import { Button } from '@mui/material';
import framImg from 'assets/svgs/frame.svg';
import nameIcon from 'assets/svgs/nameIcon.svg';
import phoneIcon from 'assets/svgs/phoneIcon.svg';
import emailicon from 'assets/svgs/emailIcon.svg';

function WalletProfileInfo({
  onEdit,
  profileInfo = {
    name: '', email: '', phone: '', bio: '',
  },
  isDisplayOnly,
}) {
  return (
    <div className="wallet-detail-right-container">
      <div className="wallet-detail-right-container-left">
        <div className="wallet-detail-status">
          <span className="wallet-rating-title">Wallet Rating</span>
          <div className="wallet-mobile-screen-only">
            <span className="wallet-rating-title-mobile-screen-title">Wallet Rating</span>
            {
                !isDisplayOnly ? (
                  <Button
                    className="wallet-edit-btn-mobile-screen"
                    startIcon={<EditIcon />}
                    onClick={onEdit}
                  >
                    Edit
                  </Button>
                ) : null
            }
          </div>
          <Rating
            name="simple-controlled"
            color="red"
            readOnly
            value={profileInfo && profileInfo.reputationStars ? profileInfo.reputationStars : 0}
          />
          <div className="wallet-detail-info">
            <img src={framImg} alt="alt" />
          </div>
        </div>
      </div>
      <div className="wallet-detail-right-container-right">
        {
            !isDisplayOnly ? (
              <Button
                className="wallet-edit-btn"
                startIcon={<EditIcon />}
                onClick={onEdit}
              >
                Edit
              </Button>
            ) : null
        }
        {profileInfo
        && (
        <>
          <div className="detail-info-container">
            <div className="info-name">
              <img src={nameIcon} alt="name" />
              <span>{profileInfo.name}</span>
            </div>
            <div className="info-email">
              <img src={emailicon} alt="name" />
              <span>{profileInfo.email}</span>
            </div>
            <div className="info-phone">
              <img src={phoneIcon} alt="name" />
              <span>{profileInfo.phone}</span>
            </div>
          </div>
          <div className="biograph-conainter">
            <h2>Biography</h2>
            <p>{profileInfo.bio}</p>
          </div>
        </>
        )}
      </div>
    </div>
  );
}

export default WalletProfileInfo;
