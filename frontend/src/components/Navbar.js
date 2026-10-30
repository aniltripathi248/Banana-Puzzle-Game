// Navbar.js — Top navigation bar shown on all pages when logged in
import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = ({ currentPage, setCurrentPage }) => {
  // Get the logged-in user and logout function from context
  const { user, logout } = useAuth();

  // Event: user clicks logout button
  const handleLogout = () => {
    logout(); // Clears user from state and localStorage
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo / Brand */}
        <div
          className="navbar-brand"
          onClick={() => setCurrentPage('game')}
          style={{ cursor: 'pointer' }}
        >
          <span className="navbar-logo">🍌</span>
          <span className="navbar-title">Banana Puzzle</span>
        </div>

        {/* Navigation Links */}
        <div className="navbar-links">
          <button
            className={`nav-link ${currentPage === 'game' ? 'active' : ''}`}
            onClick={() => setCurrentPage('game')}
          >
            🎮 Game
          </button>
          <button
            className={`nav-link ${currentPage === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setCurrentPage('leaderboard')}
          >
            🏆 Leaderboard
          </button>
          <button
            className={`nav-link ${currentPage === 'profile' ? 'active' : ''}`}
            onClick={() => setCurrentPage('profile')}
          >
            👤 Profile
          </button>
        </div>

        {/* User Info + Logout */}
        <div className="navbar-user">
          <div className="navbar-score">
            <span className="score-icon">⭐</span>
            <span className="score-value">{user?.totalScore || 0}</span>
          </div>
          <div className="navbar-username">@{user?.username}</div>
          <button className="btn btn-danger btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
