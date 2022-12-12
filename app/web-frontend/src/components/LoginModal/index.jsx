import { Box, Button } from '@mui/material';
import Form from 'components/uicore/Form';
import Loader from 'components/uicore/Loader';
import Select from 'components/uicore/Select';
import { useEffect } from 'react';
import Modal from '../Modal';
import './index.css';
import useLoginModal from './useLoginModal';
import { loginValidation } from './validation';

function LoginModal({
  onClose = () => {},
  onLoggedIn = () => {},
}) {
  const {
    availableWallets,
    getWalletsList,
    loginWithWallet,
    loginStatus,
    getSelectedWalletAddress,
    loadingWalletAddress,
    selectedWalletAddressHashed,
    walletAddressError,
    isLoggingIn,
  } = useLoginModal();

  useEffect(() => {
    getWalletsList();
  }, []);

  useEffect(() => {
    if (loginStatus.success && onLoggedIn) onLoggedIn();
  }, [loginStatus.success]);

  return (
    <Modal
      onClose={onClose}
      className="login-modal"
      title="Login - Select your wallet"
    >
      <Form
        onSubmit={loginWithWallet}
        validationSchema={loginValidation}
        className="login-container"
      >
        <Select
          placeholder="Select your wallet"
          name="wallet"
          hookToForm
          options={availableWallets.map((x) => ({ value: x, label: x }))}
          onChange={async (event) => await getSelectedWalletAddress(event.target.value)}
        />
        {(loadingWalletAddress || isLoggingIn) && (
          <div className="m-auto mt-24 mb-24">
            <Loader />
          </div>
        )}
        {selectedWalletAddressHashed
          && (
            <div className="mt-24 mb-24">
              {selectedWalletAddressHashed}
            </div>
          )}
        {(loginStatus.error || loginStatus.success || walletAddressError)
          && (
            <Box width="100%" className={`${loginStatus.success ? 'bg-green' : 'bg-red'} color-white`} padding="16px" borderRadius="12px" fontSize="16px" style={{ margin: 'auto', marginTop: '18px', marginBottom: '18px' }}>
              {walletAddressError}
              {loginStatus.success ? 'Logged in successfully!' : loginStatus.error}
            </Box>
          )}
        <Button
          type="submit"
          disabled={loadingWalletAddress || walletAddressError}
          style={{ padding: '12px 16px' }}
          className={`bg-orange-dark color-white ${(loadingWalletAddress || isLoggingIn) && 'hidden'}`}
        >
          Login
        </Button>
      </Form>
    </Modal>
  );
}

export default LoginModal;
