import { Navigate } from 'react-router-dom';
import authUser from 'utils/helpers/authUser';

function ProtectedRoute({ children }) {
  // if user is not authenticated
  if (!(authUser.getUser() && authUser.getJWTToken())) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;
