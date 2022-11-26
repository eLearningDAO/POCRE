import EditIcon from '@mui/icons-material/Edit';
import { Button } from '@mui/material';
import Rating from '@mui/material/Rating';
import UserAvatar from './userAvatar';

function WalletProfile({
  bio = '',
  name = '',
  image = '',
  email = '',
  phone = '',
  stars = 0,
  totalCreationsAuthored = 0,
  onEditProfile = () => {},
  canEdit = false,
}) {
  return (
    <>
      <h4 className="h4">User Profile</h4>
      <div className="wallet-profile-container">
        <div className="wallet-profile-info">
          <UserAvatar imageUrl={image} />
          <Rating
            key={stars}
            name="simple-controlled"
            color="red"
            readOnly
            value={stars}
          />
          <p className="wallet-profile-creations-count">
            Author of
            <span style={{ marginLeft: '4px', marginRight: '4px' }}>{totalCreationsAuthored}</span>
            creations
          </p>
        </div>

        <div className="wallet-profile-info wallet-profile-info-right">
          <div>
            <h4 className="h4">Name</h4>
            <p>{name}</p>
          </div>
          <div>
            <h4 className="h4">Email</h4>
            <p>{email}</p>
          </div>
          <div>
            <h4 className="h4">phone</h4>
            <p>{phone}</p>
          </div>
          <div>
            <h4 className="h4">Biography</h4>
            <p>{bio}</p>
          </div>
          {
            !canEdit && (
              <Button
                className="nextCollectionButton"
                startIcon={<EditIcon />}
                onClick={onEditProfile}
                style={{
                  marginLeft: 'auto',
                }}
              >
                Edit
              </Button>
            )
          }
        </div>
      </div>
    </>
  );
}
export default WalletProfile;
