import { Button, Chip, Typography } from '@mui/material';
import PlaceholderImage from 'assets/images/top-learner-user.png';
import FingerPrintIcon from 'assets/svgs/fingerprint.svg';
import './index.css';
import { Link } from 'react-router-dom';

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
      <Link to={`/wallet/${userProfileId}`}>
        <img
          alt=""
          src={imageUrl}
          className="profile-pic profile-pic-small profile-pic-rounded"
        />
      </Link>

      <div className="user-card-details">
        <div className="user-card-header">
          {username
          && (
          <Typography variant="h6">
            <Link to={`/wallet/${userProfileId}`}>
              {username}
            </Link>
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
