import { Typography } from '@mui/material';
import React from 'react';


export default function OtherContributerCard({
  name, jobs, profileUrl, image,
}) {

export default function OtherContributerCard({ name, job, profileUrl, image, }) {

  return (
    <div className="otherContributorCard">
      <a href={profileUrl} style={{ textDecoration: 'none' }}>
        <div className="otherContributorCardImage">
          <img alt="credit-user" src={image} />
        </div>

        <div className="otherContributorCardDetials">
          <Typography variant="h5">
            { name }
          </Typography>

          <Typography variant="h6">
            {job }
          </Typography>
        </div>
      </a>
    </div>
  );
}
