import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from "./context/authContext";
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

import './index.css';
import App from './App';
import LoginPage from './views/loginpage';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
  //   <App />
  // </React.StrictMode>
  <AuthProvider>
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<App />} />
        <Route path="/" element={<LoginPage />} /> {/* Optional: Default route */}
      </Routes>
    </Router>
  </AuthProvider>
);
