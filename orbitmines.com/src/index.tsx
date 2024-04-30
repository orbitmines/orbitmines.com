import React from 'react';
import ReactDOM from 'react-dom/client';
import './lib/index.scss';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // TODO: Resize & some blueprint things don't work in strict mode
  // <React.StrictMode>
    <BrowserRouter>
        <App />
    </BrowserRouter>
  // </React.StrictMode>
);
