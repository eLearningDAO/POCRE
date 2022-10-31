import { Logout } from '@mui/icons-material';
import Button from '@mui/material/Button';
import React from 'react';
import { FaUser } from 'react-icons/fa';
import useUserInfo from '../../../hooks/user/userInfo';

function LoginButton() {
  const setUser = useUserInfo((s) => s.setUser);
  const login = useUserInfo((s) => s.login);

  function handleUserAuth(pram) {
    setUser((previousS) => ({ user: pram ? { ...previousS } : null, login: pram }));
    // if (pram === false) {
    window.location.reload();
    // }
  }
  return (
    <Button
      variant="contained"
      onClick={() => (login ? handleUserAuth(false) : handleUserAuth(true))}
      endIcon={login ? <Logout fontSize=".5rem" /> : <FaUser />}
      style={{
        flexShrink: '0',
        width: login ? '80px' : '100px',
        fontSize: login ? '.7rem' : '1rem',
        background: login ? '#F19141' : '#F9A381',
        color: 'white',
        marginLeft: 'auto',
      }}
    >
      {login ? 'Logout' : 'Login'}
    </Button>
  );
}

export default LoginButton;
