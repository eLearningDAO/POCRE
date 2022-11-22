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
import {
  useEffect, useRef, useState,
} from 'react';
import { getAvailableWallets, getWalletAddress } from 'utils/helpers/wallet';
import useWallet from '../hooks/useWallet';
import { walletValidation } from './validation';

function WalletProfileEdit({
  setDetailEdit,
  initialValues,
  userId,
  imageUrl,
}) {
  const [ratingValue, setRatingValue] = useState(3);
  const {
    updateUser,
    isUserDataUpdating,
  } = useWallet();
  const [wallets, setWallets] = useState([]);
  const [walletAddress, setWalletAddress] = useState('');
  const selectElement = useRef();

  const handleSubmit = (values) => {
    const userData = {
      ...values,
      user_Id: userId,
      wallet_address: walletAddress,
      image_url: imageUrl,
    };
    updateUser(userData);
    setDetailEdit(false);
  };

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const handleWallectSelect = async (event) => {
    event.preventDefault();
    selectElement.current.style.display = 'none';
    const walletKey = event.target.value;
    let usedAddress = await getWalletAddress(walletKey);
    usedAddress = `${usedAddress.slice(0, 10)}.....${usedAddress.slice(93, 103)}`;
    setWalletAddress(usedAddress);
  };

  const pollWallets = () => {
    const availableWallets = getAvailableWallets();
    setWallets(availableWallets);
  };

  useEffect(() => {
    pollWallets();
  }, []);

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
          </span>
          <select
            className="wallet-select"
            name="walletType"
            onChange={(event) => handleWallectSelect(event)}
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
