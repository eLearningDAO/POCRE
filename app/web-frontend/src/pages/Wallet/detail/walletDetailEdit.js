import React, { useState } from 'react';
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

function WalletDetailEdit() {
  const [ratingValue, setRatingValue] = useState(3);
  return (
    <div className="wallet-detail-right-container-edit">
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
          <select className="wallet-select">
            <option className="wallete-option" value="1">Wallet 1</option>
            <option value="2">Wallet 3</option>
            <option value="3">Wallet 4</option>
          </select>
        </div>
        <div className="edit-available-wallet">
          <span>Wallet Address</span>
          <input />
        </div>
      </div>
      <div className="wallet-detail-right-container-right-edit">
        <Input
          className="wallet-edit-input"
          placeholder="Name"
          startAdornment={(
            <InputAdornment position="start">
              <PersonOutlineIcon />
            </InputAdornment>
          )}
        />
        <Input
          className="wallet-edit-input"
          placeholder="Email Address"
          startAdornment={(
            <InputAdornment position="start">
              <MailOutlineIcon />
            </InputAdornment>
          )}
        />
        <Input
          className="wallet-edit-input"
          placeholder="Phone"
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
          maxRows={4}
          startAdornment={(
            <InputAdornment position="start">
              <BorderColorOutlinedIcon />
            </InputAdornment>
          )}
        />
        <Button className="edit-submit">Save</Button>
      </div>
    </div>
  );
}

export default WalletDetailEdit;
