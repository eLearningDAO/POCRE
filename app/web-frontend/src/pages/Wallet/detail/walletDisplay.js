import React, { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import Rating from '@mui/material/Rating';
import { Button } from '@mui/material';
import framImg from '../../../assets/svgs/frame.svg';
import nameIcon from '../../../assets/svgs/nameIcon.svg';
import phoneIcon from '../../../assets/svgs/phoneIcon.svg';
import emailicon from '../../../assets/svgs/emailIcon.svg';

function WalletDisplay({ setDetailEdit }) {
  const [ratingValue, setRatingValue] = useState(3);
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
            value={ratingValue}
            onChange={(newValue) => {
              setRatingValue(newValue);
            }}
          />
          <div className="wallet-detail-info">
            <img src={framImg} alt="alt" />
          </div>
        </div>
        <div className="wallet-detail-address">
          <span>Wallet Address</span>
          <span>9495qwertyeyioswitchwalletmollitnon</span>
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
            <span>Mithun Ray</span>
          </div>
          <div className="info-email">
            <img src={emailicon} alt="name" />
            <span>mithunrayy@gmail.com</span>
          </div>
          <div className="info-phone">
            <img src={phoneIcon} alt="name" />
            <span>+8801632534125</span>
          </div>
        </div>
        <div className="biograph-conainter">
          <h2>Biography</h2>
          <p>
            Deliver real-time metrics for actionalble results.
            Amet mollit non deseruntmetrics for actionalble results
          </p>
        </div>
      </div>
    </div>
  );
}

export default WalletDisplay;
