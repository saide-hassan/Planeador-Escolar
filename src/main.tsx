import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { DownloadProvider } from './contexts/DownloadContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DownloadProvider>
      <App />
    </DownloadProvider>
  </StrictMode>,
);
