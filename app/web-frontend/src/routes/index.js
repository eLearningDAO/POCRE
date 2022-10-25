import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CreationsHome from '../components/Creations/Home';
import CreateCreation from '../components/Creations/Create';
import UpdateCreation from '../components/Creations/Update';
import CreationDetails from '../components/Creations/Details';
import InvitationHome from '../components/Invitation/Home';
import LitigationsHome from '../components/Litigations/Home';
import LitigationsCreate from '../components/Litigations/Create';
import LitigationsDetails from '../components/Litigations/Details';
import WalletHome from '../components/Wallet/Home';
import Layout from '../components/Layout';
import CreditsHome from '../components/Credits/Home';
import Protected from './Protected';
import Home from '../components/Home';

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
          path="/invitation"
          element={(
            <Layout displaySidebar>
              <InvitationHome />
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
