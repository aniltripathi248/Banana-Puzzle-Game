// LeaderboardPage.js — Displays the top 10 players ranked by score
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchLeaderboard } from '../services/api';
import './LeaderboardPage.css';

const LeaderboardPage = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch leaderboard data from the backend when component mounts
  const loadLeaderboard = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchLeaderboard();
      setLeaderboard(data);
    } catch (err) {
      setError(err.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  // Map rank to display icon/medal
  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  // Find the current user's position in the leaderboard
  const currentUserRank = leaderboard.findIndex(
    (entry) => entry.username === user?.username
  );

  if (loading) {
    return (
      <div className="leaderboard-page">
        <div className="leaderboard-loading">
          <div className="spinner"></div>
          <p>Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-container">

        {/* Page Header */}
        <div className="leaderboard-header animate-fadeIn">
          <h1 className="leaderboard-title">🏆 Leaderboard</h1>
          <p className="leaderboard-subtitle">Top 10 Banana Puzzle Champions</p>
          {currentUserRank >= 0 && (
            <div className="my-rank-badge">
              Your rank: <strong>#{currentUserRank + 1}</strong>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error animate-shake" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>⚠️ {error}</span>
            <button className="btn btn-sm btn-primary" onClick={loadLeaderboard}>
              🔄 Retry
            </button>
          </div>
        )}

        {/* Leaderboard Table */}
        {leaderboard.length === 0 && !error ? (
          <div className="no-data card animate-fadeIn">
            <p>🍌 No players yet. Be the first to score!</p>
          </div>
        ) : (
          <div className="leaderboard-list animate-fadeIn">
            {leaderboard.map((entry, index) => {
              const isCurrentUser = entry.username === user?.username;
              const isTop3 = entry.rank <= 3;
              const avatarLetter = (entry.username || '?').charAt(0).toUpperCase();

              return (
                <div
                  key={entry.username || index}
                  className={`leaderboard-row ${isCurrentUser ? 'is-current-user' : ''} ${isTop3 ? `top-${entry.rank}` : ''}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Rank */}
                  <div className="lb-rank">
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* Avatar */}
                  <div className={`lb-avatar rank-${entry.rank <= 3 ? entry.rank : 'other'}`}>
                    {avatarLetter}
                  </div>

                  {/* Username */}
                  <div className="lb-user">
                    <div className="lb-username">
                      {entry.username || 'Anonymous'}
                      {isCurrentUser && <span className="you-badge">You</span>}
                    </div>
                    <div className="lb-stats-small">
                      {entry.correctAnswers ?? 0} correct / {entry.totalAttempts ?? 0} attempts
                    </div>
                  </div>

                  {/* Accuracy */}
                  <div className="lb-accuracy">
                    <div className="lb-accuracy-value">{entry.accuracy ?? 0}%</div>
                    <div className="lb-accuracy-label">accuracy</div>
                  </div>

                  {/* Score */}
                  <div className="lb-score">
                    <div className="lb-score-value">{entry.totalScore ?? 0}</div>
                    <div className="lb-score-label">pts</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Note about leaderboard */}
        <p className="leaderboard-note animate-fadeIn">
          🍌 Scores update after every puzzle submission. Keep playing to climb the ranks!
        </p>

      </div>
    </div>
  );
};

export default LeaderboardPage;
