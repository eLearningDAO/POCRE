import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Creations from './components/Creations';
import CreateCreation from './components/Creations/Create';
import UpdateCreation from './components/Creations/Update';
import Invitation from './components/Invitation';
import LitigationHome from './components/Litigation/Home';
import LitigationDashboard from './components/Litigation/Dashboard';
import LitigationCreate from './components/Litigation/Create';
import LitigationDetails from './components/Litigation/Details';
import Wallet from './components/Wallet';
import Layout from './components/Layout';
import CreateCollection2 from './components/Creations/Scenario2/CreateCollection';
import Credit from './components/Credit';
import ProtectedRoute from './routes/ProtectedRoute';
import Home from './components/Home';

function App() {
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
          path="/litigation/:id"
          element={(
            <ProtectedRoute>
              <Layout displaySidebar>
                <LitigationDetails />
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
