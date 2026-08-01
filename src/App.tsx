import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import './i18n';

import RoleBasedRouter from './routes/RoleBasedRouter';
import AuthInitializer from './components/AuthInitializer';
import { useDevRoleMockInitializer } from './hooks/useDevRoleMockInitializer';
import { ToastProvider } from './shared/context/ToastContext';
import { RoleAccessProvider } from './shared/context/RoleAccessContext';

function App() {
  useDevRoleMockInitializer();
  return (
    <Router>
      <ToastProvider>
        <AuthInitializer>
          <RoleAccessProvider>
            <RoleBasedRouter />
          </RoleAccessProvider>
        </AuthInitializer>
      </ToastProvider>
    </Router>
  );
}

export default App;
