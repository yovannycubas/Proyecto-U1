import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Global error catcher for mobile debugging
window.onerror = function (msg, url, lineNo, columnNo, error) {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 20px; color: red; background: #fff; font-family: sans-serif;">
        <h1 style="font-size: 1.2rem;">❌ App Crash</h1>
        <p style="font-size: 0.8rem;">${msg}</p>
        <p style="font-size: 0.7rem; color: #666;">${url}:${lineNo}</p>
        <button onclick="location.reload()" style="padding: 10px; margin-top: 10px;">Reintentar</button>
      </div>
    `;
  }
  return false;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
