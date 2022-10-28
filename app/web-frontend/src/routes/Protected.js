import { Navigate } from 'react-router-dom';
import useUserInfo from 'hooks/user/userInfo';

function ProtectedRoute({ children }) {
  const login = useUserInfo((s) => s.login);
  if (!login) {
    // user is not authenticated
    return <Navigate to="/" />;
  }
  return children;
}

export default ProtectedRoute;
