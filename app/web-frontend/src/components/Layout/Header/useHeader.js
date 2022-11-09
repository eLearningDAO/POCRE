import React, { useCallback, useState } from 'react';
import { API_BASE_URL } from 'config';
import useUserInfo from 'hooks/user/userInfo';
import authUser from 'utils/helpers/authUser';

const user = authUser.get();

const useHeader = () => {
  const { setUser: setUserContext, login, setFlag } = useUserInfo();
  const userId = 0;

  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const [fetchUserStatus, setFetchUserStatus] = useState({
    success: false,
    error: null,
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/users?limit=100`, {
        method: 'GET',
      }).then((data) => data.json());

      // adding avatar temporarily (on frontend)
      const usersWithAvatar = response.results.map((x) => ({
        ...x,
        avatar: `https://i.pravatar.cc/50?img=${Math.random()}`,
      }));
      setUsers(usersWithAvatar);

      const temporaryUser = Object.keys(user).length > 0 ? user : usersWithAvatar?.[0];
      setActiveUser(temporaryUser);
      authUser.set(temporaryUser);
      setUserContext((previousS) => ({ ...previousS, user: temporaryUser }));
      setFetchUserStatus({
        success: true,
        error: null,
      });
    } catch {
      setFetchUserStatus({
        success: false,
        error: 'Failed to fetch users',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const onUserSelect = (event, id) => {
    const temporaryUser = users.find((x) => x.user_id === (event?.target?.value || id));
    setActiveUser(temporaryUser);
    authUser.set(temporaryUser);

    // set User gollably at our app
    setUserContext((previousS) => ({ ...previousS, user: temporaryUser }));
    setFlag();
  };

  React.useEffect(() => {
    fetchUsers();
    onUserSelect({}, userId);
  }, []);

  return {
    login,
    users,
    activeUser,
    loading,
    fetchUserStatus,
    fetchUsers,
    onUserSelect,
  };
};

export default useHeader;
