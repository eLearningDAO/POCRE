import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useVerify from './useVerify';

function VerifyEmail() {
  const navigate = useNavigate();
  const {
    confirmUserEmail,
    confirmationEmailStatus,
  } = useVerify();
  const parameters = new URLSearchParams(window.location.search);
  const token = parameters.get('id');
  // console.log("THis is the email verifciation link", token)
  useEffect(async () => {
    await confirmUserEmail(token);
  }, []);
  useEffect(() => {
    if (confirmationEmailStatus.success) {
      navigate('/wallet');
    }
  }, [confirmationEmailStatus.success]);
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
        Verify Your Email
      </h4>
      <p style={{ fontSize: '18px', textAlign: 'center' }}>
        This is a special link for email verification on pocre
      </p>
    </div>
  );
}

export default VerifyEmail;
