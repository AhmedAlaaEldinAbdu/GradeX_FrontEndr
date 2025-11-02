import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './redux/store/store';
import './index.css';
import App from './App.tsx';

const isDevelopment = import.meta.env.DEV;

const rootElement = (
  <Provider store={store}>
    <App />
  </Provider>
);

createRoot(document.getElementById('root')!).render(
  isDevelopment ? <StrictMode>{rootElement}</StrictMode> : rootElement
);
