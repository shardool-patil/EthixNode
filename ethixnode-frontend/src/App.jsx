import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import './App.css';

// Axios Interceptor for JWT
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // 1. Check for GitHub Token in URL
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token');
      
      if (urlToken) {
        localStorage.setItem('jwt_token', urlToken);
        window.history.replaceState({}, document.title, "/");
      }

      const token = localStorage.getItem('jwt_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // 2. Add a timeout so it NEVER hangs infinitely
        const response = await axios.get('http://localhost:8080/api/auth/user', { timeout: 5000 });
        setUser(response.data);
      } catch (error) {
        console.error("Auth check failed or Token invalid:", error);
        localStorage.removeItem('jwt_token'); // Purge the ghost token!
        setUser(null);
      } finally {
        setLoading(false); // ALWAYS remove the loading screen
      }
    };
    
    initAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    setUser(null);
  };

  // YOUR ORIGINAL, BEAUTIFUL LOADER IS BACK
  if (loading) {
    return (
      <div className="fullscreen-loader">
        <div className="loader-logo-container">
          <span className="pulsing-icon"><i>e</i></span>
          <span className="loader-text">ethixnode</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill"></div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home user={user} onLogout={handleLogout} />} />
        
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" /> : <AuthPage type="login" onLogin={setUser} />} 
        />
        
        <Route 
          path="/signup" 
          element={user ? <Navigate to="/" /> : <AuthPage type="signup" onLogin={setUser} />} 
        />
      </Routes>
    </Router>
  );
}

export default App;