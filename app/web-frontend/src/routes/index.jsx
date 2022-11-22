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
// wallet pages
import WalletSelf from 'pages/Wallet/Self';
import WalletPublic from 'pages/Wallet/Public';
// other pages
import CreditsHome from 'pages/Credits/Home';
import Home from 'pages/Home';
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
          path="/creations/create"
          element={(
            <Layout displaySidebar>
              <CreateCreation />
            </Layout>
          )}
        />
        <Route
          path="/creations/:id/update"
          element={(
            <Layout displaySidebar>
              <UpdateCreation />
            </Layout>
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
          path="/wallet"
          element={(
            <Layout displaySidebar>
              <WalletSelf />
            </Layout>
          )}
        />
        <Route
          path="/user/:id"
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
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
