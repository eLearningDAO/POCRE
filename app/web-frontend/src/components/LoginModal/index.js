import { Button, Box } from '@mui/material';
import Form from 'components/uicore/Form';
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
  } = useLoginModal();

  useEffect(() => {
    getWalletsList();
  }, []);

  useEffect(() => {
    if (loginStatus.success && onLoggedIn) onLoggedIn();
  }, [loginStatus.success]);

  return (
    <Modal
      title="Login - Select your wallet"
      onClose={onClose}
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
        />
        {(loginStatus.error || loginStatus.success)
          && (
          <Box width="100%" className={`${loginStatus.success ? 'bg-green' : 'bg-red'} color-white`} padding="16px" borderRadius="12px" fontSize="16px" style={{ margin: 'auto', marginTop: '18px', marginBottom: '18px' }}>
            {loginStatus.success ? 'Logged in successfully!' : loginStatus.error}
          </Box>
          )}
        <Button type="submit" className="bg-orange-dark color-white" style={{ padding: '12px 16px' }}>
          Login
        </Button>
      </Form>
    </Modal>
  );
}

export default LoginModal;
