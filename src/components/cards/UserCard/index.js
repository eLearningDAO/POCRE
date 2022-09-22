import { Chip, Typography, Button } from '@mui/material';
import React from 'react';
import PlaceholderImage from '../../../assets/top-learner-user.png';
import './index.css';
import FingerPrintIcon from '../../../assets/svgs/fingerprint.svg';

function UserCard({
  variant = 'secondary  ',
  username = 'Andrzej Smith',
  role = 'User experience designer',
  imageUrl = PlaceholderImage,
  totalCreationsAuthored = 10,
}) {
  return (
    <div className={`user-card user-card-${variant}`}>
      <img className="user-card-image" alt="" src={imageUrl} />

      <div className="user-card-details">
        <div className="user-card-header">
          {username && <Typography variant="h6">{username}</Typography>}
          <Button className={`user-card-action-btn user-card-action-btn-${variant}`}>
            <img src={FingerPrintIcon} alt="" />
          </Button>
        </div>
        {role && <Typography variant="span">{role}</Typography>}

        <div className="user-card-labels">
          {totalCreationsAuthored > 0 && <Chip className={`label label-${variant}`} label={`Author of ${totalCreationsAuthored} Creation${totalCreationsAuthored > 1 ? 's' : ''}`} />}
        </div>
      </div>
    </div>
  );
}

export default UserCard;
