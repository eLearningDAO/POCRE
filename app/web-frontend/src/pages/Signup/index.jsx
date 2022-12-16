import LoginForm from 'components/LoginForm';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const navigate = useNavigate();

  // get token from url
  const parameters = new URLSearchParams(window.location.search);
  const token = parameters.get('token');

  return (
    <div style={{
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
      <LoginForm inviteToken={token} buttonLabel="Signup" onLoggedIn={() => navigate('/wallet')} />
    </div>
  );
}

export default Signup;
