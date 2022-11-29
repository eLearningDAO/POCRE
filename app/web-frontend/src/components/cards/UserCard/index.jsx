import { Button, Chip, Typography } from '@mui/material';
import PlaceholderImage from 'assets/images/top-learner-user.png';
import FingerPrintIcon from 'assets/svgs/fingerprint.svg';
import './index.css';

function UserCard({
  variant = 'secondary  ',
  userProfileId = '',
  username = 'Andrzej Smith',
  role = 'User experience designer',
  imageUrl = PlaceholderImage,
  totalCreationsAuthored = 10,
}) {
  return (
    <div className={`user-card user-card-${variant}`}>
      <a href={`wallet/${userProfileId}`}>
        <img
          alt=""
          src={imageUrl}
          className="profile-pic profile-pic-small profile-pic-rounded"
        />
      </a>

      <div className="user-card-details">
        <div className="user-card-header">
          {username
          && (
          <Typography variant="h6">
            <a href={`wallet/${userProfileId}`}>
              {username}
            </a>
          </Typography>
          )}
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
