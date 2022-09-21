import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';
import Creations from './components/Creations';
import CreateCreation from './components/Creations/Create';
import Invitation from './components/Invitation';
import LitigationDetails from './components/Litigation';
import LitigationHome from './components/Litigation/LitigationHome';
import LitigationCreate from './components/Litigation/Create';
import LitigationClosed from './components/Litigation/LitigationClosed';
import Wallet from './components/Wallet';
import Layout from './components/Layout';
import CreateCollection2 from './components/Creations/Scenario2/CreateCollection';
import Credit from './components/Credit';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout displayNav><Creations /></Layout>} />
        <Route path="/creations" element={<Layout displaySidebar><Creations /></Layout>} />
        <Route path="/creations/create" element={<Layout displaySidebar><CreateCreation /></Layout>} />
        <Route path="/invitation" element={<Layout displaySidebar><Invitation /></Layout>} />
        <Route path="/litigation" element={<Layout displaySidebar><LitigationHome /></Layout>} />
        <Route path="/litigation/create" element={<Layout displaySidebar><LitigationCreate /></Layout>} />
        <Route path="/litigation/details" element={<Layout displaySidebar><LitigationDetails /></Layout>} />
        <Route path="/litigation/closed" element={<Layout displaySidebar><LitigationClosed /></Layout>} />
        <Route path="/wallet" element={<Layout displaySidebar><Wallet /></Layout>} />
        <Route path="/credit" element={<Layout displaySidebar><Credit /></Layout>} />
        <Route path="/scenario-2/create-collection" element={<Layout displaySidebar><CreateCollection2 /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
