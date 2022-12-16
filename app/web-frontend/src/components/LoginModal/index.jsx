import LoginForm from 'components/LoginForm';
import Modal from '../Modal';
import './index.css';

function LoginModal({
  onClose = () => {},
  onLoggedIn = () => {},
}) {
  return (
    <Modal
      onClose={onClose}
      className="login-modal"
      title="Login - Select your wallet"
    >
      <LoginForm onLoggedIn={onLoggedIn} />
    </Modal>
  );
}

export default LoginModal;
