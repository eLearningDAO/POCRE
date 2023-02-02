import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from 'components/uicore/Input';
import { Button, Box } from '@mui/material';
import useVerify from './useVerify';

function VerifyEmail() {
  const navigate = useNavigate();
  const {
    confirmUserEmail,
    confirmationEmailStatus,
  } = useVerify();
  const [otpCode, setOtpCode] = useState();
  const handleProfileVerfication = async () => {
    const parameters = new URLSearchParams(window.location.search);
    const token = parameters.get('id');
    await confirmUserEmail([token, otpCode]);
  };
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
      {(confirmationEmailStatus.error)
        && (
          <Box width="100%" className="bg-red color-white" padding="16px" borderRadius="12px" fontSize="16px" style={{ margin: 'auto', marginTop: '18px', marginBottom: '18px' }}>
            {confirmationEmailStatus.error}
          </Box>
        )}
      <h4 style={{ fontSize: '28px', fontWeight: 'bold' }}>
        Verify Your Email
      </h4>
      <p style={{ fontSize: '18px', textAlign: 'center' }}>
        Please enter the OTP code sent to your email to verify!
      </p>
      <Input variant="dark" placeholder="OTP Code" name="user_name" onChange={(event_) => setOtpCode(event_.target.value)} />
      <Button
        onClick={async () => {
          await handleProfileVerfication();
        }}
        className="nextCollectionButton border-white"
      >
        Verify
      </Button>
    </div>
  );
}

export default VerifyEmail;
