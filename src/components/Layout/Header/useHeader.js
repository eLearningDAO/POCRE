import { useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../../../config';

const useHeader = () => {
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

      const temporaryUser = response.results?.[0];
      setActiveUser(temporaryUser);
      Cookies.set('activeUser', JSON.stringify(temporaryUser));

      setUsers(response.results);

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

  const onUserSelect = (event) => {
    const temporaryUser = users.find((user) => user.user_id === event.target.value);
    setActiveUser(temporaryUser);
    Cookies.set('activeUser', JSON.stringify(temporaryUser));
  };

  return {
    users,
    activeUser,
    loading,
    fetchUserStatus,
    fetchUsers,
    onUserSelect,
  };
};

export default useHeader;
