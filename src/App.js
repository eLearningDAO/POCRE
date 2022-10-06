import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Creations from './components/Creations';
import CreateCreation from './components/Creations/Create';
import UpdateCreation from './components/Creations/Update';
import Invitation from './components/Invitation';
import LitigationDashboard from './components/Litigation';
import LitigationHome from './components/Litigation/LitigationHome';
import LitigationCreate from './components/Litigation/Create';
import LitigationClosed from './components/Litigation/Closed';
import Wallet from './components/Wallet';
import Layout from './components/Layout';
import CreateCollection2 from './components/Creations/Scenario2/CreateCollection';
import Credit from './components/Credit';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={(
            <Layout displayNav>
              <Creations />
            </Layout>
          )}
        />
        <Route
          path="/creations"
          element={(
            <Layout displaySidebar>
              <Creations />
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
          path="/invitation"
          element={(
            <Layout displaySidebar>
              <Invitation />
            </Layout>
          )}
        />
        <Route
          path="/litigation"
          element={(
            <ProtectedRoute>
              <Layout displaySidebar>
                <LitigationHome />
              </Layout>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/litigation/create"
          element={(
            <ProtectedRoute>
              <Layout displaySidebar>
                <LitigationCreate />
              </Layout>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/litigation/dashboard"
          element={(
            <ProtectedRoute>
              <Layout displaySidebar>
                <LitigationDashboard />
              </Layout>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/litigation/closed"
          element={(
            <ProtectedRoute>
              <Layout displaySidebar>
                <LitigationClosed />
              </Layout>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/wallet"
          element={(

            <Layout displaySidebar>
              <Wallet />
            </Layout>

          )}
        />
        <Route
          path="/credit"
          element={(
            <Layout displaySidebar>
              <Credit />
            </Layout>
          )}
        />
        <Route
          path="/scenario-2/create-collection"
          element={(
            <ProtectedRoute>
              <Layout displaySidebar>
                <CreateCollection2 />
              </Layout>
            </ProtectedRoute>
          )}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
