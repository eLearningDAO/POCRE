import LoginForm from 'components/LoginForm';
import useAppKeys from 'hooks/useAppKeys';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authUser from 'utils/helpers/authUser';

const handleLogout = () => {
  authUser.removeJWTToken();
  authUser.removeUser();
};

let isAppUpdated = false;

function Signup() {
  const navigate = useNavigate();
  const { updateAppKey } = useAppKeys();

  // get token from url
  const parameters = new URLSearchParams(window.location.search);
  const token = parameters.get('token');

  const handleLogin = () => {
    navigate('/wallet');
    updateAppKey();
  };

  useEffect(() => {
    handleLogout();
    if (!isAppUpdated) { updateAppKey(); isAppUpdated = true; }
  }, []);

  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: '16px',
        maxWidth: '600px',
        margin: 'auto',
      }}
    >
      <h4 style={{ fontSize: '28px', fontWeight: 'bold' }}>
        Signup with your cardano wallet.
      </h4>
      <p style={{ fontSize: '18px', textAlign: 'center' }}>
        This is a special invite link for signup. If you have already signed up with a
        wallet address and you select the same wallet address for signup here we will
        merge your invited account into your existing account.
      </p>
      <LoginForm inviteToken={token} buttonLabel="Signup" onLoggedIn={handleLogin} />
    </div>
  );
}

export default Signup;
