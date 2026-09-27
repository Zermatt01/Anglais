import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './ui/theme.css';
import './ui/components.css';
import './app/shell.css';
import { App } from './app/App.tsx';
import { requestPersistentStorage } from './services/storage/persistence.ts';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root is missing from index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Ask the browser not to evict IndexedDB, the source of truth (D-019). Chrome
// decides silently, without prompting; the result is shown in the settings.
void requestPersistentStorage();
