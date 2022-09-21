import { Typography } from '@mui/material';
import React from 'react';
import LinkedinIcon from '../../assets/linkedin.png';
import TwitterIcon from '../../assets/twitter.png';
import UserImage1 from '../../assets/user-image-3.png';

export default function CreditCard() {
  return (
    <div className="creditCard">
      <div className="creditCardImage">
        <img alt="credit-user" src={UserImage1} />
      </div>

      <div className="creditCardDetials">
        <Typography variant="h5">
          John Smith
        </Typography>

        <Typography variant="h6">
          e-Learning DAO member
        </Typography>

        <Typography variant="span">
          Short bio and role in Pocre
        </Typography>

        <div className="creditCardIcons">
          <img src={TwitterIcon} alt="" />
          <img src={LinkedinIcon} alt="" />
        </div>
      </div>
    </div>
  );
}
