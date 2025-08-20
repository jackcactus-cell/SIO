import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupErrorHandling } from './utils/logger';
import { OracleConnectionProvider } from './context/OracleConnectionContext';

// Initialisation du système de logging frontend
setupErrorHandling();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OracleConnectionProvider>
      <App />
    </OracleConnectionProvider>
  </StrictMode>
);
