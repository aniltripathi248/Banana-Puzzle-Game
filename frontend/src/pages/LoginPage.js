// LoginPage.js — Handles user login
// Event-driven: login form submission triggers API call and updates app state
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/api';
import './AuthPages.css';

const LoginPage = ({ onSwitchToRegister }) => {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  // Event: form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    setError(''); // Clear previous errors

    const cleanEmail = email.trim();

    // Basic frontend validation
    if (!cleanEmail || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      // Call the backend login API
      const userData = await loginUser(cleanEmail, password);
      login(userData); // Update global auth state — user is now logged in
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card animate-fadeIn">
        {/* Logo */}
        <div className="auth-logo animate-float">🍌</div>
        <h1 className="auth-title">Welcome Back!</h1>
        <p className="auth-subtitle">Log in to continue your puzzle adventure</p>

        {/* Error message */}
        {error && (
          <div className="alert alert-error animate-shake">
            ⚠️ {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            id="login-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner spinner-sm"></span>
                Logging in...
              </>
            ) : (
              '🍌 Login'
            )}
          </button>
        </form>

        {/* Switch to register */}
        <p className="auth-switch">
          Don't have an account?{' '}
          <button
            className="auth-link"
            onClick={onSwitchToRegister}
            id="switch-to-register-btn"
            type="button"
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
