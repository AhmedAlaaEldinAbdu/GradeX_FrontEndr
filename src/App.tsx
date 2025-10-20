import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import './i18n';

import RoleBasedRouter from './routes/RoleBasedRouter';
import AuthInitializer from './components/AuthInitializer';
import { useDevRoleMockInitializer } from './hooks/useDevRoleMockInitializer';
import { ToastProvider } from './shared/context/ToastContext';

function App() {
  useDevRoleMockInitializer();
  return (
    <Router>
      <ToastProvider>
        <AuthInitializer>
          <RoleBasedRouter />
        </AuthInitializer>
      </ToastProvider>
    </Router>
  );
}

export default App;
