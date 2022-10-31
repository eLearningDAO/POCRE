import React, { useReducer, useState } from 'react';
import Rating from '@mui/material/Rating';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import { Button } from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import BorderColorOutlinedIcon from '@mui/icons-material/BorderColorOutlined';
import { formReducer } from '../../../utils/helpers/formReducer';
import useWalletStore from '../../../hooks/userWalletService';
import Loader from '../../../components/uicore/Loader';

function WalletDetailEdit({
  setDetailEdit,
  user,
  userId,
  imageUrl,
}) {
  const [ratingValue, setRatingValue] = useState(3);
  const [formState, dispatch] = useReducer(formReducer, user);
  const updateUser = useWalletStore((state) => state.updateUser);
  const getUserById = useWalletStore((state) => state.getUserById);
  const isUserDataUpdating = useWalletStore((state) => state.isUserDataUpdating);

  const handleWalletData = async (event) => {
    event.stopPropagation();
    await updateUser(
      formState,
      userId,
      imageUrl,
    );
    getUserById(userId);
    setDetailEdit(false);
  };

  const handleTextChange = (event) => {
    dispatch({
      type: 'HANDLE INPUT TEXT',
      field: event.target.name,
      payload: event.target.value,
    });
  };

  return (
    <form className="wallet-detail-right-container-edit">
      <div className="wallet-detail-right-container-left-edit">
        <div className="wallet-detail-status-edit">
          <span className="wallet-rating-title">Wallet Rating</span>
          <Rating
            name="simple-controlled"
            color="red"
            readOnly
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
        <div className="edit-available-wallet">
          <span>Available Wallet</span>
          <select
            className="wallet-select"
            name="walletType"
            value={formState.walletType}
            onChange={(event) => handleTextChange(event)}
          >
            <option className="wallete-option" value="1">Wallet 1</option>
            <option value="2">Wallet 3</option>
            <option value="3">Wallet 4</option>
          </select>
        </div>
        <div className="edit-available-wallet">
          <span>Wallet Address</span>
          <input
            name="walletAddress"
            value={formState.walletAddress}
            onChange={(event) => handleTextChange(event)}
          />
        </div>
      </div>
      <div className="wallet-detail-right-container-right-edit">
        <Input
          className="wallet-edit-input"
          placeholder="Name"
          name="name"
          startAdornment={(
            <InputAdornment position="start">
              <PersonOutlineIcon />
            </InputAdornment>
          )}
          value={formState.name}
          onChange={(event) => handleTextChange(event)}
        />
        <Input
          className="wallet-edit-input"
          placeholder="Email Address"
          name="email"
          startAdornment={(
            <InputAdornment position="start">
              <MailOutlineIcon />
            </InputAdornment>
          )}
          value={formState.email}
          onChange={(event) => handleTextChange(event)}
        />
        <Input
          className="wallet-edit-input"
          placeholder="Phone"
          name="phone"
          startAdornment={(
            <InputAdornment position="start">
              <LocalPhoneOutlinedIcon />
            </InputAdornment>
          )}
          value={formState.phone}
          onChange={(event) => handleTextChange(event)}
        />
        <Input
          className="wallet-edit-input-area"
          placeholder="Bio"
          multiline
          name="bio"
          maxRows={4}
          startAdornment={(
            <InputAdornment position="start">
              <BorderColorOutlinedIcon />
            </InputAdornment>
          )}
          value={formState.bio}
          onChange={(event) => handleTextChange(event)}
        />
        <Button onClick={handleWalletData} className="edit-submit" disabled={isUserDataUpdating}>
          {isUserDataUpdating && <Loader />}
          {!isUserDataUpdating && ' Save'}
        </Button>
      </div>
    </form>
  );
}

export default WalletDetailEdit;
