import React, {
  useEffect,
  useState,
  useRef,
} from 'react';
import Rating from '@mui/material/Rating';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputAdornment from '@mui/material/InputAdornment';
import { Button } from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import BorderColorOutlinedIcon from '@mui/icons-material/BorderColorOutlined';
import { Address } from '@emurgo/cardano-serialization-lib-asmjs';
import useWalletStore from 'hooks/userWalletService';
import Loader from 'components/uicore/Loader';
import Form from 'components/uicore/Form';
import Input from 'components/uicore/Input';
import { useFormContext } from 'react-hook-form';
import useUserInfo from '../../../hooks/user/userInfo';
import { walletValidation } from './validation';
// eslint-disable-next-line import/no-unresolved, unicorn/prefer-module
const { Buffer } = require('buffer/');

function WalletDetailEdit({
  setDetailEdit,
  initialValues,
  userId,
  imageUrl,
}) {
  const formContext = useFormContext();
  const [ratingValue, setRatingValue] = useState(3);
  const updateUser = useWalletStore((state) => state.updateUser);
  const getUserById = useWalletStore((state) => state.getUserById);
  const isUserDataUpdating = useWalletStore((state) => state.isUserDataUpdating);
  const { login, flag } = useUserInfo();
  const [wallets, setWallets] = useState([]);
  const [walletAddress, setWalletAddress] = useState('');
  const [selectKey, setSelectKey] = useState(0);
  const selectElement = useRef();

  const handleSubmit = async (values) => {
    const userData = { ...values, wallet_address: walletAddress, image_url: imageUrl };
    await updateUser(
      userData,
      userId,
    );
    getUserById(userId);
    setDetailEdit(false);
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
    formContext.setValue('walletAddress', usedAddress);
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
        <div className="edit-available-wallet">
          <span>
            Available Wallet
            {flag}
          </span>
          <select
            className="wallet-select"
            name="walletType"
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
          <Input
            name="walletAddress"
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

export default WalletDetailEdit;
