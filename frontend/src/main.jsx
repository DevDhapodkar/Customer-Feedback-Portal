import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './index.css';

// Initialize theme before React renders to avoid FOUC
(() => {
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') {
      document.body.classList.add('dark');
      document.documentElement.classList.add('dark');
    } else if (stored === 'light') {
      document.body.classList.remove('dark');
      document.documentElement.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.body.classList.add('dark');
        document.documentElement.classList.add('dark');
      }
    }
  } catch (_) {
    // ignore
  }
})();

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

