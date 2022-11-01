import React from 'react';
import EditIcon from '@mui/icons-material/Edit';
import Rating from '@mui/material/Rating';
import { Button } from '@mui/material';
import framImg from 'assets/svgs/frame.svg';
import nameIcon from 'assets/svgs/nameIcon.svg';
import phoneIcon from 'assets/svgs/phoneIcon.svg';
import emailicon from 'assets/svgs/emailIcon.svg';

function WalletDisplay({ setDetailEdit, user }) {
  return (
    <div className="wallet-detail-right-container">
      <div className="wallet-detail-right-container-left">
        <div className="wallet-detail-status">
          <span className="wallet-rating-title">Wallet Rating</span>
          <div className="wallet-mobile-screen-only">
            <span className="wallet-rating-title-mobile-screen-title">Wallet Rating</span>
            <Button
              className="wallet-edit-btn-mobile-screen"
              startIcon={<EditIcon />}
              onClick={() => setDetailEdit(true)}
            >
              Edit
            </Button>
          </div>
          <Rating
            name="simple-controlled"
            color="red"
            readOnly
            value={user && user.reputationStars ? user.reputationStars : 0}
          />
          <div className="wallet-detail-info">
            <img src={framImg} alt="alt" />
          </div>
        </div>
        <div className="wallet-detail-address">
          <span>Wallet Address</span>
          <span>{user && user.walletAddress}</span>
        </div>
      </div>
      <div className="wallet-detail-right-container-right">
        <Button
          className="wallet-edit-btn"
          startIcon={<EditIcon />}
          onClick={() => setDetailEdit(true)}
        >
          Edit
        </Button>
        <div className="detail-info-container">
          <div className="info-name">
            <img src={nameIcon} alt="name" />
            <span>{user && user.name}</span>
          </div>
          <div className="info-email">
            <img src={emailicon} alt="name" />
            <span>{user && user.email}</span>
          </div>
          <div className="info-phone">
            <img src={phoneIcon} alt="name" />
            <span>{user && user.phone}</span>
          </div>
        </div>
        <div className="biograph-conainter">
          <h2>Biography</h2>
          <p>
            {user && user.bio}
          </p>
        </div>
      </div>
    </div>
  );
}

export default WalletDisplay;
