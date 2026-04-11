import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Login from '../components/Login';
import Signup from '../components/Signup';
import '../styles/Auth.css';

const AuthPage = ({ type, onLogin }) => {
  const navigate = useNavigate();
  const isSignUp = type === 'signup';

  const handleLoginSuccess = (userData) => {
    onLogin(userData);
    navigate('/'); // Send user back to dashboard after login
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-left">
        <div className="nav-logo">
          <span className="logo-icon">e</span>
          <span className="logo-text">ethixnode</span>
        </div>
        <div className="abstract-glow-container">
          <div className="glow-orb-1"></div>
          <div className="glow-orb-2"></div>
          <div className="abstract-swoop"></div>
        </div>
        <div className="auth-left-content">
          <h1>
            {isSignUp ? 'Join the global network' : 'Welcome back to EthixNode'}<span>_</span>
          </h1>
        </div>
      </div>
      <div className="auth-right">
        {/* THE FIX: Use navigate to ensure App.jsx logic doesn't trap you */}
        <button 
          onClick={() => navigate('/')} 
          className="close-auth-btn" 
          title="Close"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        {isSignUp ? (
          <Signup onLogin={handleLoginSuccess} />
        ) : (
          <Login onLogin={handleLoginSuccess} />
        )}
      </div>
    </div>
  );
};

export default AuthPage;