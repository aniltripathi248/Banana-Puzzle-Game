// ProfilePage.js — Shows the logged-in user's stats and profile info
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile } from '../services/api';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch fresh profile data from the backend when the page loads
  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const freshData = await getProfile();
      updateUser(freshData);
    } catch (err) {
      setError(err.message || 'Failed to refresh profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate accuracy
  const accuracy = user?.totalAttempts > 0
    ? Math.round((user.correctAnswers / user.totalAttempts) * 100)
    : 0;

  // Determine rank badge based on score
  const getRankInfo = (score) => {
    if (score >= 500) return { title: 'Banana Legend', icon: '👑', color: '#ffd600' };
    if (score >= 200) return { title: 'Banana Master', icon: '🏆', color: '#c0c0c0' };
    if (score >= 100) return { title: 'Banana Pro', icon: '🥉', color: '#cd7f32' };
    if (score >= 50) return { title: 'Banana Player', icon: '🍌', color: '#4ade80' };
    return { title: 'Banana Beginner', icon: '🌱', color: '#a09fbe' };
  };

  const rank = getRankInfo(user?.totalScore || 0);
  const avatarLetter = (user?.username || '?').charAt(0).toUpperCase();

  if (loading && !user?.username) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* Profile Header Card */}
        <div className="profile-header-card card animate-fadeIn">
          <div className="profile-avatar">
            {avatarLetter}
          </div>
          <div className="profile-info">
            <h1 className="profile-username">@{user?.username || 'Player'}</h1>
            <p className="profile-email">{user?.email}</p>
            <div className="profile-rank" style={{ color: rank.color }}>
              <span>{rank.icon}</span>
              <span>{rank.title}</span>
            </div>
          </div>
          <div className="profile-score-big">
            <div className="score-number">{user?.totalScore || 0}</div>
            <div className="score-text">Total Points</div>
          </div>
        </div>

        {error && (
          <div className="alert alert-error animate-shake" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>⚠️ {error}</span>
            <button className="btn btn-sm btn-primary" onClick={loadProfile}>
              🔄 Retry
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="profile-stats-grid animate-fadeIn">
          <div className="profile-stat-card">
            <div className="pstat-icon">🎯</div>
            <div className="pstat-value">{accuracy}%</div>
            <div className="pstat-label">Accuracy</div>
            <div className="pstat-bar">
              <div
                className="pstat-bar-fill"
                style={{ width: `${accuracy}%` }}
              ></div>
            </div>
          </div>

          <div className="profile-stat-card">
            <div className="pstat-icon">✅</div>
            <div className="pstat-value">{user?.correctAnswers || 0}</div>
            <div className="pstat-label">Correct Answers</div>
          </div>

          <div className="profile-stat-card">
            <div className="pstat-icon">📊</div>
            <div className="pstat-value">{user?.totalAttempts || 0}</div>
            <div className="pstat-label">Total Attempts</div>
          </div>

          <div className="profile-stat-card">
            <div className="pstat-icon">❌</div>
            <div className="pstat-value">
              {Math.max(0, (user?.totalAttempts || 0) - (user?.correctAnswers || 0))}
            </div>
            <div className="pstat-label">Wrong Answers</div>
          </div>
        </div>

        {/* Rank progression */}
        <div className="rank-progression card animate-fadeIn">
          <h3>🏅 Rank Progression</h3>
          <div className="rank-list">
            {[
              { min: 0, title: 'Banana Beginner', icon: '🌱' },
              { min: 50, title: 'Banana Player', icon: '🍌' },
              { min: 100, title: 'Banana Pro', icon: '🥉' },
              { min: 200, title: 'Banana Master', icon: '🏆' },
              { min: 500, title: 'Banana Legend', icon: '👑' },
            ].map((r) => (
              <div
                key={r.min}
                className={`rank-item ${(user?.totalScore || 0) >= r.min ? 'rank-achieved' : 'rank-locked'}`}
              >
                <span className="rank-item-icon">{r.icon}</span>
                <span className="rank-item-title">{r.title}</span>
                <span className="rank-item-req">{r.min}+ pts</span>
                {(user?.totalScore || 0) >= r.min && (
                  <span className="rank-check">✓</span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
