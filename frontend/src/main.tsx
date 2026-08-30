// main.tsx — Ponto de entrada do aplicativo React
// O React DOM renderiza o componente <App /> dentro do elemento #root do HTML
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// ReactDOM.createRoot cria uma raiz React para o elemento DOM com id="root"
// É o padrão moderno do React 18+
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
