// ĐIỂM BẮT ĐẦU FRONTEND
// Nhiệm vụ: import React, App và CSS toàn cục; render App vào phần tử root.
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);