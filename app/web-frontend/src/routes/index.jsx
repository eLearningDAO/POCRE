import Layout from 'components/Layout';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
// creation pages
import CreateCreation from 'pages/Creations/Create';
import CreationDetails from 'pages/Creations/Details';
import CreationsHome from 'pages/Creations/Home';
import UpdateCreation from 'pages/Creations/Update';
// recognition pages
import RecognitionsDetails from 'pages/Recognitions/Details';
import RecognitionsHome from 'pages/Recognitions/Home';
// litigation pages
import LitigationsCreate from 'pages/Litigations/Create';
import LitigationsDetails from 'pages/Litigations/Details';
import LitigationsHome from 'pages/Litigations/Home';
import UpdateLitigation from 'pages/Litigations/Update';
// wallet pages
import WalletHome from 'pages/Wallet/Home';
import WalletPublic from 'pages/Wallet/Public';
// other pages
import CreditsHome from 'pages/Credits/Home';
import Home from 'pages/Home';
import Notifications from 'pages/Notifications';
import Signup from 'pages/Signup';
import VerifyEmail from 'pages/VerifyEmail';
import Page404 from 'pages/404';
import Protected from './Protected';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/home"
          element={(
            <Layout displayNav>
              <Home />
            </Layout>
          )}
        />
        <Route
          path="/notifications"
          element={(
            <Layout displaySidebar>
              <Notifications />
            </Layout>
          )}
        />
        <Route
          path="/signup"
          element={(
            <Layout>
              <Signup />
            </Layout>
          )}
        />
        <Route
          path="/verify"
          element={(
            <Layout>
              <VerifyEmail />
            </Layout>
          )}
        />
        <Route
          path="/"
          element={(
            <Layout displayNav>
              <Home />
            </Layout>
          )}
        />
        <Route
          path="/creations"
          element={(
            <Layout displaySidebar>
              <CreationsHome />
            </Layout>
          )}
        />
        <Route
          path="/creations/user/:userId"
          element={(
            <Layout displaySidebar>
              <CreationsHome />
            </Layout>
          )}
        />
        <Route
          path="/creations/create"
          element={(
            <Protected>
              <Layout displaySidebar>
                <CreateCreation />
              </Layout>
            </Protected>
          )}
        />
        <Route
          path="/creations/:id/update"
          element={(
            <Protected>
              <Layout displaySidebar>
                <UpdateCreation />
              </Layout>
            </Protected>
          )}
        />
        <Route
          path="/creations/:id"
          element={(
            <Layout displaySidebar>
              <CreationDetails />
            </Layout>
          )}
        />
        <Route
          path="/recognitions"
          element={(
            <Layout displaySidebar>
              <RecognitionsHome />
            </Layout>
          )}
        />
        <Route
          path="/recognitions/:id"
          element={(
            <Layout displaySidebar>
              <RecognitionsDetails />
            </Layout>
          )}
        />
        <Route
          path="/litigations"
          element={(
            <Protected>
              <Layout displaySidebar>
                <LitigationsHome />
              </Layout>
            </Protected>
          )}
        />
        <Route
          path="/litigations/create"
          element={(
            <Protected>
              <Layout displaySidebar>
                <LitigationsCreate />
              </Layout>
            </Protected>
          )}
        />
        <Route
          path="/litigations/:id"
          element={(
            <Protected>
              <Layout displaySidebar>
                <LitigationsDetails />
              </Layout>
            </Protected>
          )}
        />
        <Route
          path="/litigations/:id/update"
          element={(
            <Protected>
              <Layout displaySidebar>
                <UpdateLitigation />
              </Layout>
            </Protected>
          )}
        />
        <Route
          path="/wallet"
          element={(
            <Layout displaySidebar>
              <WalletHome />
            </Layout>
          )}
        />
        <Route
          path="/wallet/:id"
          element={(
            <Layout displaySidebar>
              <WalletPublic />
            </Layout>
          )}
        />
        <Route
          path="/credits"
          element={(
            <Layout displaySidebar>
              <CreditsHome />
            </Layout>
          )}
        />
        <Route
          path="*"
          element={(
            <Layout>
              <Page404 />
            </Layout>
          )}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
