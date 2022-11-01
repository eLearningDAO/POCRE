import React, { useEffect, useState, useRef, useReducer } from 'react';
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
import { Address } from '@emurgo/cardano-serialization-lib-asmjs';
import useUserInfo from '../../../hooks/user/userInfo';
import { formReducer } from 'utils/helpers/formReducer';
import useWalletStore from 'hooks/userWalletService';
// eslint-disable-next-line import/no-unresolved, unicorn/prefer-module
const { Buffer } = require('buffer/');
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
  const { login, flag } = useUserInfo();
  const [wallets, setWallets] = useState([]);
  const [walletAddress, setWalletAddress] = useState('');
  const [selectKey, setSelectKey] = useState(0);
  const selectElement = useRef();

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

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const getUsedAddress = async (walletKey) => {
    try {
      const API = await window.cardano[walletKey].enable();
      const raw = await API.getUsedAddresses();
      const rawFirst = raw[0];
      return Address.from_bytes(Buffer.from(rawFirst, 'hex')).to_bech32();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
      return 0;
    }
  };

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const handleWallectSelect = async (event) => {
    event.preventDefault();
    selectElement.current.style.display = 'none';
    const walletKey = event.target.value;
    let usedAddress = await getUsedAddress(walletKey);
    usedAddress = `${usedAddress.slice(0, 10)}.....${usedAddress.slice(93, 103)}`;
    setWalletAddress(usedAddress);
  };

  const pollWallets = () => {
    if (login) {
      const keys = [];
      for (const key in window.cardano) {
        if (window.cardano[key].enable) {
          keys.push(key);
        }
      }
      setWallets(keys);
    }
  };

  useEffect(() => {
    pollWallets();
  }, []);

  useEffect(() => {
    setSelectKey((previous) => (previous + 1));
    setWalletAddress('');
  }, [flag]);

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
          <span>
            Available Wallet
            {flag}
          </span>
          <select
            className="wallet-select"
            onChange={(event) => handleWallectSelect(event)}
            key={selectKey}
          >
            <option value="" ref={selectElement}>
              Select Wallet
            </option>
            {
              wallets.map((wallet, index) => (
                <option value={wallet} key={index}>
                  {wallet}
                </option>
              ))
            }
          </select>
        </div>
        <div className="edit-available-wallet">
          <span>Wallet Address</span>
          <input
            name="walletAddress"
            value={formState.walletAddress}
            onChange={(event) => handleTextChange(event)}
          />
          <input value={walletAddress} id="walletAddr" />
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
