import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import './i18n';

import RoleBasedRouter from './routes/RoleBasedRouter';
import { useDevRoleMockInitializer } from './hooks/useDevRoleMockInitializer';

function App() {
  useDevRoleMockInitializer();
  return (
    <Router>
      <RoleBasedRouter />
    </Router>
  );
}

export default App;
