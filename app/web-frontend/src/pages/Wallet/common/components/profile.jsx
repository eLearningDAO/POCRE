import EditIcon from '@mui/icons-material/Edit';
import { Button } from '@mui/material';
import Rating from '@mui/material/Rating';
import EmailIcon from 'assets/svgs/emailIcon.svg';
import FrameSVG from 'assets/svgs/frame.svg';
import FrameUnverified from 'assets/images/user-not-verified.png';
import NameIcon from 'assets/svgs/nameIcon.svg';
import PhoneIcon from 'assets/svgs/phoneIcon.svg';
import Form from 'components/uicore/Form';
import Input from 'components/uicore/Input';
import Loader from 'components/uicore/Loader';
import useAppKeys from 'hooks/useAppKeys';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useProfile from './useProfile';
import UserAvatar from './userAvatar';
import { updateProfileValidation } from './validation';

function WalletProfile({
  bio = '',
  name = '',
  image = '',
  email = '',
  phone = '',
  stars = 0,
  isInvited = false,
  id = null,
  creationCount = 0,
  hashedWalletAddress = '',
  canEdit = false,
  emailVerified = false,
}) {
  const { updateAppKey } = useAppKeys();
  const navigate = useNavigate();
  const [isEditMode, setEditMode] = useState(false);
  const [avatarImageFile, setAvatarImageFile] = useState();
  const handleViewCreattion = () => {
    if (id) {
      navigate(`/creations/user/${id}`);
    } else {
      navigate('/creations');
    }
  };
  const {
    creations,
    isUpdatingUserProfile,
    updateUserProfile,
    sendVerificationEmail,
    updateUserProfileStatus,
    resetUserProfileStatus,
  } = useProfile();
  useEffect(() => {
    if (updateUserProfileStatus.success) {
      updateAppKey();
      setEditMode(false);
    }
  }, [updateUserProfileStatus.success]);

  return (
    <Form
      className={`wallet-profile-container ${!canEdit && 'wallet-profile-container-full-rounded'}`}
      onSubmit={async (values) => {
        await updateUserProfile({ ...values, avatarImageFile });
        setTimeout(() => {
          setEditMode(false);
          resetUserProfileStatus();
        }, 1000);
      }}
      validationSchema={updateProfileValidation}
      initialValues={{
        user_name: name,
        email_address: email,
        phone,
        user_bio: bio,
      }}
    >
      <div className="wallet-profile-info-left">
        {isInvited && (
          <h4 className="h4 invited-user-header">
            Invited User
          </h4>
        )}
        <UserAvatar
          editable={isEditMode}
          imageUrl={image}
          onAvatarFilePicked={(file) => setAvatarImageFile(file)}
        />
        {isEditMode && (
          <div className="mt-24">
            <h4>Wallet Address</h4>
            <p>
              {hashedWalletAddress}
            </p>
          </div>
        )}
        {!isEditMode && (
          <p className="wallet-profile-creations-count">
            <Button onClick={handleViewCreattion} style={{ color: 'black' }}>
              Author of
              <span style={{ marginLeft: '4px', marginRight: '4px' }}>{creationCount || creations?.total_results}</span>
              creations
            </Button>
          </p>
        )}
      </div>

      <div className="wallet-profile-info-right">
        <div className="wallet-profile-info-right-header">
          <h4 className="h4">Wallet Rating</h4>
          {
            canEdit && !isEditMode && (
              <Button
                className="nextCollectionButton border-white"
                startIcon={<EditIcon />}
                onClick={() => setEditMode(true)}
                style={{
                  marginLeft: 'auto',
                }}
              >
                Edit
              </Button>
            )
          }
          {canEdit
            && isEditMode
            && (
              <div className="wallet-update-form-action-btns">
                <Button type="button" className="saveDraftButton border-white" onClick={() => setEditMode(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="nextCollectionButton border-white">
                  {isUpdatingUserProfile ? <Loader /> : 'Update'}
                </Button>
              </div>
            )}
        </div>
        {!isEditMode && (
          <div className="wallet-profile-info-right-details-wrapper">
            <div>
              <Rating
                key={stars}
                name="simple-controlled"
                color="red"
                className="rating-color"
                readOnly
                value={stars}
              />
              {!emailVerified ? (
                <img src={FrameUnverified} alt="" />
              ) : (
                <img src={FrameSVG} alt="" />
              )}
            </div>
            <div className="wallet-profile-form-container">
              <div className="wallet-profile-form-wrapper">
                <img className="profile-info-right-icon" src={NameIcon} alt="" />
                <p>{name}</p>
                {!emailVerified && (
                  canEdit ? (
                    <Button
                      onClick={async () => {
                        await sendVerificationEmail();
                      }}
                      className="nextCollectionButton border-white"
                    >
                      Pending Verification
                    </Button>
                  ) : (
                    <p className="pendingVerificationText">Pending Verification</p>
                  )
                )}
                {!emailVerified && (
                  <p />
                )}
                {emailVerified && (
                  <img className="profile-info-right-icon" src={EmailIcon} alt="" />
                )}
                {emailVerified && (
                  <p>{email}</p>
                )}
                <img className="profile-info-right-icon" src={PhoneIcon} alt="" />
                <p>{phone}</p>
              </div>
              <div>
                <h4 className="h4">
                  Biography
                </h4>
                <p>{bio}</p>
              </div>
            </div>
          </div>
        )}
        {isEditMode && (
          <div className="wallet-profile-info-right-form-wrapper">
            <h4 className="h4">Name</h4>
            <Input variant="dark" placeholder="Name" name="user_name" hookToForm />
            <h4 className="h4">Email</h4>
            <Input variant="dark" placeholder="Email Address" name="email_address" hookToForm />
            <h4 className="h4">Phone</h4>
            <Input variant="dark" placeholder="Phone" name="phone" hookToForm />
            <h4 className="h4">Bio</h4>
            <Input variant="dark" placeholder="Bio" multiline hookToForm name="user_bio" minRows={3} />
          </div>
        )}
      </div>
    </Form>
  );
}
export default WalletProfile;
