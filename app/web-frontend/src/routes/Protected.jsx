import authUser from 'utils/helpers/authUser';
import Page404 from 'pages/404';
import Layout from 'components/Layout';

function ProtectedRoute({ children }) {
  // if user is not authenticated
  if (!(authUser.getUser() && authUser.getJWTToken())) {
    return (
      <Layout>
        <Page404 />
      </Layout>
    );
  }

  return children;
}

export default ProtectedRoute;
