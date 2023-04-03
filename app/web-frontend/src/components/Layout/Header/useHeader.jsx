import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import authUser from 'utils/helpers/authUser';
import '../responsive-menu-transition.css';
import './Header.css';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import useAppKeys from 'hooks/useAppKeys';
import { Notifications } from 'api/requests';

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

  const auth = authUser.getUser();
  const user = auth?.user_id;
  const queryKey = `notifications-count-${user}`;
  const {
    data: notificationCount,
    isLoading: isNotificationListFetched,
  } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      let createResponse = Notifications.getAll(
        `page=${1}&limit=5&descend_fields[]=created_at&query=${user}&search_fields[]=notification_for&status=unread`,
      );
      createResponse = await createResponse;
      return createResponse.total_results;
    },
    staleTime: 60_000, // cache for 60 seconds
  });
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
    notificationCount,
    isNotificationListFetched,
  };
};

export default useHeader;
