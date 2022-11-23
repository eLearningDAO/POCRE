import BorderColorOutlinedIcon from '@mui/icons-material/BorderColorOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { Button } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputAdornment from '@mui/material/InputAdornment';
import Rating from '@mui/material/Rating';
import Switch from '@mui/material/Switch';
import Form from 'components/uicore/Form';
import Input from 'components/uicore/Input';
import Loader from 'components/uicore/Loader';
import { useState } from 'react';
import useWallet from '../hooks/useWallet';
import { walletValidation } from './validation';

function WalletProfileEdit({
  setDetailEdit,
  initialValues,
  userId,
  imageUrl,
  onUpdate,
}) {
  const [ratingValue, setRatingValue] = useState(3);
  const {
    updateUser,
    isUserDataUpdating,
  } = useWallet();

  const handleSubmit = async (values) => {
    const userData = {
      image_url: imageUrl,
      user_name: values?.name?.trim(),
      user_bio: values?.bio?.trim(),
      email_address: values?.email?.trim(),
      phone: values?.phone?.trim(),
    };
    setDetailEdit(false);
    onUpdate(values);
    await updateUser({ id: userId, updateBody: userData });
  };

  return (
    <Form
      id="walletForm"
      className="wallet-detail-right-container-edit"
      onSubmit={handleSubmit}
      validationSchema={walletValidation}
      initialValues={initialValues}
      preventSubmitOnEnter
    >
      <div className="wallet-detail-right-container-left-edit">
        <div className="wallet-detail-status-edit">
          <span className="wallet-rating-title">Wallet Rating</span>
          <Rating
            color="red"
            readOnly
            name="reputationStars"
            value={ratingValue}
            onChange={(newValue) => {
              setRatingValue(newValue);
            }}
          />
        </div>
        <div className="edit-identy">
          <FormControlLabel
            value="start"
            control={<Switch />}
            label="Verified Identy"
            labelPlacement="start"
          />
        </div>
      </div>
      <div className="wallet-detail-right-container-right-edit">
        <Input
          className="wallet-edit-input"
          placeholder="Name"
          name="name"
          hookToForm
          startAdornment={(
            <InputAdornment position="start">
              <PersonOutlineIcon />
            </InputAdornment>
          )}
        />
        <Input
          className="wallet-edit-input"
          placeholder="Email Address"
          name="email"
          hookToForm
          startAdornment={(
            <InputAdornment position="start">
              <MailOutlineIcon />
            </InputAdornment>
          )}
        />
        <Input
          className="wallet-edit-input"
          placeholder="Phone"
          name="phone"
          hookToForm
          startAdornment={(
            <InputAdornment position="start">
              <LocalPhoneOutlinedIcon />
            </InputAdornment>
          )}
        />
        <Input
          className="wallet-edit-input-area"
          placeholder="Bio"
          multiline
          hookToForm
          name="bio"
          minRows={3}
          startAdornment={(
            <InputAdornment position="start">
              <BorderColorOutlinedIcon />
            </InputAdornment>
          )}
        />
        <Button
          type="submit"
          form="walletForm"
          className="edit-submit"
        >
          {isUserDataUpdating && <Loader />}
          {!isUserDataUpdating && ' Save'}
        </Button>
      </div>
    </Form>
  );
}

export default WalletProfileEdit;
