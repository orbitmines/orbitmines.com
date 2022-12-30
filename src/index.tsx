import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.scss';
import App from './App';


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // TODO: Resize & some blueprint things don't work in strict mode
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);
