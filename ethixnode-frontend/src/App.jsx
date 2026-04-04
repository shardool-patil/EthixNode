import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import './App.css';

// CRITICAL: Tells Axios to send the JSESSIONID cookie to Spring Boot
axios.defaults.withCredentials = true;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/auth/user');
        setUser(response.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    setUser(null);
    window.location.href = 'http://localhost:8080/api/auth/logout'; 
  };

  if (loading) {
    return (
      <div className="fullscreen-loader">
        <div className="loader-logo-container">
          <span className="pulsing-icon" ><i>e</i></span>
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