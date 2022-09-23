import { Typography } from '@mui/material';
import React from 'react';
import LinkedinIcon from '../../assets/linkedin.png';
import TwitterIcon from '../../assets/twitter.png';
import UserImage1 from '../../assets/user-image-3.png';
import './CreditCard.css';

export default function CreditCard(
  {
    name,
    jobs,
    bio,
    linkedIn,
    twitter,
  },
) {
  return (
    <div className="creditCard">
      <div className="creditCardImage">
        <img alt="credit-user" src={UserImage1} />
      </div>

      <div className="creditCardDetials">
        <Typography variant="h5">
          { name }
        </Typography>

        <Typography variant="h6" className="jobs">
          {jobs}
        </Typography>
        <Typography variant="span" className="bio">
          {bio}
        </Typography>
        <div className="creditCardIcons">
          <a href={linkedIn}>
            <img src={TwitterIcon} alt="" href={linkedIn} />
          </a>
          <a href={twitter}>
            <img src={LinkedinIcon} alt="" href={twitter} />
          </a>
        </div>
      </div>
    </div>
  );
}
