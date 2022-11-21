import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CreationsHome from 'pages/Creations/Home';
import CreateCreation from 'pages/Creations/Create';
import UpdateCreation from 'pages/Creations/Update';
import CreationDetails from 'pages/Creations/Details';
import RecognitionsHome from 'pages/Recognitions/Home';
import RecognitionsDetails from 'pages/Recognitions/Details';
import LitigationsHome from 'pages/Litigations/Home';
import LitigationsCreate from 'pages/Litigations/Create';
import LitigationsDetails from 'pages/Litigations/Details';
import WalletHome from 'pages/Wallet/Home';
import Layout from 'components/Layout';
import CreditsHome from 'pages/Credits/Home';
import Home from 'pages/Home';
import Dashboard from 'pages/Wallet/dashboard';
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
              <WalletHome />
            </Layout>
          )}
        />
        <Route
          path="/user/:id"
          element={(
            <Layout displaySidebar>
              <Dashboard />
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
