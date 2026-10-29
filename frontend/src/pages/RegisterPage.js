// RegisterPage.js — Handles new user registration
// Event-driven: form submission triggers API call to create a new account
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../services/api';
import './AuthPages.css';

const RegisterPage = ({ onSwitchToLogin }) => {
  // Form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  // Event: form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    // Frontend validation
    if (!cleanUsername || !cleanEmail || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (cleanUsername.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }

    if (cleanUsername.length > 20) {
      setError('Username cannot exceed 20 characters.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      // Call the backend register API
      const userData = await registerUser(cleanUsername, cleanEmail, password);
      login(userData); // Auto-login after successful registration
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card animate-fadeIn">
        {/* Logo */}
        <div className="auth-logo animate-float">🍌</div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join the Banana Puzzle Challenge!</p>

        {/* Error message */}
        {error && (
          <div className="alert alert-error animate-shake">
            ⚠️ {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="reg-username">Username</label>
            <input
              id="reg-username"
              type="text"
              className="form-input"
              placeholder="e.g. banana_master"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              maxLength={20}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              className="form-input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              className="form-input"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm-password">Confirm Password</label>
            <input
              id="reg-confirm-password"
              type="password"
              className="form-input"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            id="register-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner spinner-sm"></span>
                Creating account...
              </>
            ) : (
              '🍌 Create Account'
            )}
          </button>
        </form>

        {/* Switch to login */}
        <p className="auth-switch">
          Already have an account?{' '}
          <button
            className="auth-link"
            onClick={onSwitchToLogin}
            id="switch-to-login-btn"
            type="button"
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
