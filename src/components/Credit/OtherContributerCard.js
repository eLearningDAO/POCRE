import { Typography } from '@mui/material';
import React from 'react';
import UserImage1 from '../../assets/top-learner-user.png';

export default function OtherContributerCard({ name, jobs, profileUrl }) {
  return (
    <div className="otherContributorCard">
      <a href={profileUrl} style={{ textDecoration: 'none' }}>
        <div className="otherContributorCardImage">
          <img alt="credit-user" src={UserImage1} />
        </div>

        <div className="otherContributorCardDetials">
          <Typography variant="h5">
            { name }
          </Typography>

          <Typography variant="h6">
            {jobs }
          </Typography>
        </div>
      </a>
    </div>
  );
}
