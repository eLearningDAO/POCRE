import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';
import Home from './components/Home';
import Creations from './components/Creations';
import CreateCreation from './components/Creations/Create';
import Invitation from './components/Invitation';
import Litigation from './components/Litigation';
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
        <Route path="/litigation" element={<Layout displaySidebar><Litigation /></Layout>} />
        <Route path="/litigation/closed" element={<Layout displaySidebar><LitigationClosed /></Layout>} />
        <Route path="/wallet" element={<Layout displaySidebar><Wallet /></Layout>} />
        <Route path="/credit" element={<Layout displaySidebar><Credit /></Layout>} />
        <Route path="/scenario-2/create-collection" element={<Layout displaySidebar><CreateCollection2 /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
