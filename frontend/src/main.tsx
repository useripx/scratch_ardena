import React from 'react';
import ReactDOM from 'react-dom/client';
import { ViewRouter } from './router/ViewRouter';
import './styles/design-tokens.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ViewRouter />
    </React.StrictMode>
  );
} else {
  console.error('[Ardena Playground] Root element "#root" tidak ditemukan di DOM.');
}

