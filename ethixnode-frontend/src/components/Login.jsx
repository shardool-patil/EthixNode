import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Send credentials and CATCH the response
      const loginResponse = await axios.post('http://localhost:8080/api/auth/login', { email, password });
      
      // 2. Extract and SAVE the token to local storage
      if (loginResponse.data.token) {
          localStorage.setItem('jwt_token', loginResponse.data.token);
      }

      // 3. Now when we fetch the user, the Axios Interceptor in App.jsx will automatically attach it!
      const userResponse = await axios.get('http://localhost:8080/api/auth/user');
      onLogin(userResponse.data);
      
    } catch (err) {
      console.error("Login Error:", err);
      setError('Please check your email and password once again, or sign up if you are unregistered.');
      
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      
      {/* FLOATING TOAST POPUP */}
      {error && (
        <div className="toast-popup">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {error}
        </div>
      )}

      <h2>Sign in</h2>
      
      <a href="http://localhost:8080/oauth2/authorization/github" className="oauth-btn" style={{ textDecoration: 'none' }}>
        <svg height="18" width="18" viewBox="0 0 16 16" fill="currentColor" style={{ marginRight: '8px' }}>
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
        </svg>
        Sign in with GitHub
      </a>

      <div className="divider">OR</div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        
        <button type="submit" className="primary-btn w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="auth-toggle">
        Don't have an account? <Link to="/signup">Sign up</Link>
      </div>
    </div>
  );
};

export default Login;