import { Box, Button, Grid } from '@mui/material';
import Tile from 'components/tile';
import Form from 'components/uicore/Form';
import Input from 'components/uicore/Input';
import Loader from 'components/uicore/Loader';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authUser from 'utils/helpers/authUser';
import WalletProfile from '../common/components/profile';
import UserAvatar from '../common/components/userAvatar';
import './index.css';
import useSelf from './useSelf';
import { updateProfileValidation } from './validation';

function WalletSelf() {
  const navigate = useNavigate();

  const handleViewCreattion = () => navigate('/creations');
  const handleCreateCreattion = () => navigate('/creations/create');

  const [isEditMode, setEditMode] = useState(false);
  const [user, setUser] = useState(authUser.getUser());
  const [avatarImageFile, setAvatarImageFile] = useState();

  const {
    isUpdatingUserProfile,
    updateUserProfile,
    updateUserProfileStatus,
    resetUserProfileStatus,
  } = useSelf();

  useEffect(() => {
    if (updateUserProfileStatus.success) {
      setUser(authUser.getUser());
      setEditMode(false);
    }
  }, [updateUserProfileStatus.success]);

  return (
    <div className="wallet-container">
      {isEditMode
        ? (
          <Form
            className="wallet-update-form"
            onSubmit={async (values) => {
              await updateUserProfile({ ...values, avatarImageFile });
              setTimeout(() => {
                setEditMode(false);
                resetUserProfileStatus();
              }, 1000);
            }}
            validationSchema={updateProfileValidation}
            initialValues={{
              user_name: user?.user_name,
              email_address: user?.email_address,
              phone: user?.phone,
              user_bio: user?.user_bio,
            }}
          >
            <h4 className="h4">Update Profile</h4>

            <div className="wallet-update-form-fields-grid">
              <UserAvatar
                editable
                imageUrl={user?.image_url || `https://i.pravatar.cc/250?img=${Math.random()}`}
                onAvatarFilePicked={(file) => setAvatarImageFile(file)}
              />
              <div className="wallet-update-form-input">
                <Input variant="dark" placeholder="Name" name="user_name" hookToForm />
                <Input variant="dark" placeholder="Email Address" name="email_address" hookToForm />
                <Input variant="dark" placeholder="Phone" name="phone" hookToForm />
                <Input variant="dark" placeholder="Bio" multiline hookToForm name="user_bio" minRows={3} />
              </div>
            </div>

            {(updateUserProfileStatus.error || updateUserProfileStatus.success)
              && (
                <Box width="100%" className={`${updateUserProfileStatus.success ? 'bg-green' : 'bg-red'} color-white`} padding="16px" borderRadius="12px" fontSize="16px">
                  {updateUserProfileStatus.success ? 'Profile updated successfully!' : updateUserProfileStatus.error}
                </Box>
              )}

            <div className="wallet-update-form-action-btns">
              <Button type="button" className="saveDraftButton" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
              <Button type="submit" className="nextCollectionButton">
                {isUpdatingUserProfile ? <Loader /> : 'Update'}
              </Button>
            </div>
          </Form>
        )
        : (
          <>
            <WalletProfile
              name={user?.user_name}
              bio={user?.user_bio}
              phone={user?.phone}
              email={user?.email_address}
              image={user?.image_url}
              onEditProfile={() => setEditMode(true)}
            />
            <Grid container className="wallet-collection-container">
              <Grid item md={12} sm={12} xs={12} className="wallet-collection-right">
                <Tile
                  icon="gallery"
                  onClick={handleViewCreattion}
                  label="View my creations"
                  variant="filled"
                />
                <Tile
                  icon="pencil"
                  onClick={handleCreateCreattion}
                  label="New creation"
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </>
        )}
    </div>
  );
}

export default WalletSelf;
