import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CreationsHome from '../components/Creations/Home';
import CreateCreation from '../components/Creations/Create';
import UpdateCreation from '../components/Creations/Update';
import CreationDetails from '../components/Creations/Details';
import InvitationHome from '../components/Invitation/Home';
import LitigationHome from '../components/Litigation/Home';
import LitigationCreate from '../components/Litigation/Create';
import LitigationDetails from '../components/Litigation/Details';
import WalletHome from '../components/Wallet/Home';
import Layout from '../components/Layout';
import CreditHome from '../components/Credit/Home';
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
          path="/litigation"
          element={(
            <Protected>
              <Layout displaySidebar>
                <LitigationHome />
              </Layout>
            </Protected>
          )}
        />
        <Route
          path="/litigation/create"
          element={(
            <Protected>
              <Layout displaySidebar>
                <LitigationCreate />
              </Layout>
            </Protected>
          )}
        />
        <Route
          path="/litigation/:id"
          element={(
            <Protected>
              <Layout displaySidebar>
                <LitigationDetails />
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
          path="/credit"
          element={(
            <Layout displaySidebar>
              <CreditHome />
            </Layout>
          )}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
