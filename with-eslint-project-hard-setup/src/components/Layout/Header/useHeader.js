import Cookies from "js-cookie";
import { useCallback, useState } from "react";
import { API_BASE_URL } from "../../../config";
import useUserInfo from "../../../hooks/user/userInfo";

// get auth user
const authUser = JSON.parse(Cookies.get("activeUser") || "{}");

const useHeader = () => {
  const setUserContext = useUserInfo((s) => s.setUser);
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
        method: "GET",
      }).then((data) => data.json());

      // adding avatar temporarily (on frontend)
      const usersWithAvatar = response.results.map((x) => ({
        ...x,
        avatar: `https://i.pravatar.cc/50?img=${Math.random()}`,
      }));
      setUsers(usersWithAvatar);

      const temporaryUser =
        Object.keys(authUser).length > 0 ? authUser : usersWithAvatar?.[0];
      setActiveUser(temporaryUser);
      Cookies.set("activeUser", JSON.stringify(temporaryUser));
      setUserContext(() => temporaryUser);
      setFetchUserStatus({
        success: true,
        error: null,
      });
    } catch {
      setFetchUserStatus({
        success: false,
        error: "Failed to fetch users",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const onUserSelect = (event) => {
    const temporaryUser = users.find(
      (user) => user.user_id === event.target.value,
    );
    setActiveUser(temporaryUser);
    Cookies.set("activeUser", JSON.stringify(temporaryUser));

    //set User gollably at our app
    setUserContext(() => temporaryUser);
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
