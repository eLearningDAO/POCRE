import React from 'react';
import Button from '@mui/material/Button';
import { FaUser } from 'react-icons/fa';
import useUserInfo from '../../../hooks/user/userInfo';

function LoginButton() {
  const setUser = useUserInfo((s) => s.setUser);
  return (
    <Button
      variant="contained"
      onClick={() => setUser((previousS) => ({ ...previousS, login: true }))}
      endIcon={<FaUser />}
      style={{ background: '#F9A381', color: 'white', marginLeft: 'auto' }}
    >
      Login
    </Button>
  );
}

export default LoginButton;
