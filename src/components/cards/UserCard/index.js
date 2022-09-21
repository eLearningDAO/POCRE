import { Chip, Typography } from '@mui/material';
import React from 'react';
import PlaceholderImage from '../../../assets/top-learner-user.png';
import './index.css';

function UserCard({
  variant = 'primary',
  username = 'Andrzej Smith',
  role = 'User experience designer',
  imageUrl = PlaceholderImage,
  totalCreationsAuthored = 10,
}) {
  return (
    <div className={`user-card user-card-${variant}`}>
      <img className="user-card-image" alt="" src={imageUrl} />

      <div className="user-card-details">
        {username && <Typography variant="h6">{username}</Typography>}
        {role && <Typography variant="span">{role}</Typography>}

        <div className="user-card-labels">
          {totalCreationsAuthored > 0 && <Chip className={`label label-${variant}`} label={`Author of ${totalCreationsAuthored} Creation${totalCreationsAuthored > 1 ? 's' : ''}`} />}
        </div>
      </div>
    </div>
  );
}

export default UserCard;
