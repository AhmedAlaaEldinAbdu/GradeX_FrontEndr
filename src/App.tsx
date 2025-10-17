import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import './i18n';

import RoleBasedRouter from './routes/RoleBasedRouter';
import AuthInitializer from './components/AuthInitializer';
import { useDevRoleMockInitializer } from './hooks/useDevRoleMockInitializer';

function App() {
  useDevRoleMockInitializer();
  return (
    <Router>
      <AuthInitializer>
        <RoleBasedRouter />
      </AuthInitializer>
    </Router>
  );
}

export default App;
