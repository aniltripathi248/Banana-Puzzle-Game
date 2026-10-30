// App.js — Main application component
// Controls which page is shown based on login state and navigation
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GamePage from './pages/GamePage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';

// Components
import Navbar from './components/Navbar';

// ── Inner App: Reads auth state and renders the correct page ──────────────────
const AppContent = () => {
  const { user, loading } = useAuth();

  // Which page to display: 'game' | 'leaderboard' | 'profile'
  const [currentPage, setCurrentPage] = useState('game');

  // Which auth form to show: 'login' | 'register'
  const [authPage, setAuthPage] = useState('login');

  // While checking localStorage for a saved session, show a spinner
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          flexDirection: 'column',
          gap: '1rem',
          color: '#a09fbe',
        }}
      >
        <div style={{ fontSize: '4rem' }}>🍌</div>
        <div className="spinner"></div>
        <p>Loading Banana Puzzle...</p>
      </div>
    );
  }

  // If user is NOT logged in — show auth pages
  if (!user) {
    return authPage === 'login' ? (
      <LoginPage onSwitchToRegister={() => setAuthPage('register')} />
    ) : (
      <RegisterPage onSwitchToLogin={() => setAuthPage('login')} />
    );
  }

  // User IS logged in — show main app
  const renderPage = () => {
    switch (currentPage) {
      case 'game':        return <GamePage />;
      case 'leaderboard': return <LeaderboardPage />;
      case 'profile':     return <ProfilePage />;
      default:            return <GamePage />;
    }
  };

  return (
    <>
      {/* Navigation bar — shown on all pages when logged in */}
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Main page content */}
      <main>
        {renderPage()}
      </main>
    </>
  );
};

// ── Root App: Wraps everything in the AuthProvider ────────────────────────────
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
