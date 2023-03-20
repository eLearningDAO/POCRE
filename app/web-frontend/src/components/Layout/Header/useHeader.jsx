import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import authUser from 'utils/helpers/authUser';
import '../responsive-menu-transition.css';
import './Header.css';
import { useQueryClient } from '@tanstack/react-query';
import useAppKeys from 'hooks/useAppKeys';

const useHeader = () => {
  const { updateAppKey } = useAppKeys();
  const queryClient = useQueryClient();

  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const user = authUser.getUser();
    const token = authUser.getJWTToken();

    setLoggedInUser(user && token ? user : null);
  }, []);

  const location = useLocation();

  const handleLogout = () => {
    setLoggedInUser(null);
    authUser.removeJWTToken();
    authUser.removeUser();
    queryClient.cancelQueries();
    queryClient.invalidateQueries();
    updateAppKey();
  };

  const handleLogin = () => {
    setLoggedInUser(authUser.getUser());
    queryClient.cancelQueries();
    queryClient.invalidateQueries();
    updateAppKey();
  };

  const [displayResponsiveMenu, setDisplayResponsiveMenu] = React.useState(false);

  return {
    displayResponsiveMenu,
    setDisplayResponsiveMenu,
    handleLogin,
    handleLogout,
    location,
    showLoginForm,
    setShowLoginForm,
    loggedInUser,
    setLoggedInUser,
  };
};

export default useHeader;
