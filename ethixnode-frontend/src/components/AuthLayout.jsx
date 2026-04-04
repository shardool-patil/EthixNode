import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';

const AuthLayout = ({ isOpen, onClose, onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);

  if (!isOpen) return null;

  const handleLoginSuccess = (userData) => {
    onLogin(userData);
    onClose();
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
        <button className="close-auth-btn" onClick={onClose} title="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        {isSignUp ? (
          <Signup onLogin={handleLoginSuccess} onSwitchToLogin={() => setIsSignUp(false)} />
        ) : (
          <Login onLogin={handleLoginSuccess} onSwitchToSignup={() => setIsSignUp(true)} />
        )}
      </div>
    </div>
  );
};

export default AuthLayout;