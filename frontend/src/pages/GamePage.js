// GamePage.js — The main puzzle game interface
// This is where users see banana puzzles and submit answers
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchPuzzle, submitAnswer } from '../services/api';
import './GamePage.css';

const GamePage = () => {
  const { user, updateUser } = useAuth();

  // Game state
  const [puzzle, setPuzzle] = useState(null);           // Current puzzle data
  const [puzzleToken, setPuzzleToken] = useState('');   // Server token for answer checking
  const [answer, setAnswer] = useState('');             // User's typed answer
  const [feedback, setFeedback] = useState(null);       // Result of answer submission
  const [loading, setLoading] = useState(false);        // Loading states
  const [submitting, setSubmitting] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState('');
  const [answered, setAnswered] = useState(false);      // Whether current puzzle was answered

  // Event: Load a new puzzle from the backend
  const loadPuzzle = useCallback(async () => {
    setLoading(true);
    setError('');
    setFeedback(null);
    setAnswer('');
    setAnswered(false);
    setImageLoaded(false);

    try {
      const data = await fetchPuzzle();
      setPuzzle(data.question);         // The puzzle image URL
      setPuzzleToken(data.puzzleToken); // The encrypted token (solution stays on backend)
    } catch (err) {
      setError(err.message || 'Failed to load puzzle. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load the first puzzle when the component mounts
  useEffect(() => {
    loadPuzzle();
  }, [loadPuzzle]);

  // Event: User submits their answer
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that the answer is a valid single digit (0-9)
    const numAnswer = parseInt(answer, 10);
    if (isNaN(numAnswer) || answer.trim() === '' || numAnswer < 0 || numAnswer > 9) {
      setError('Please enter a single digit from 0 to 9.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Send answer to backend for verification — score is updated on backend
      const result = await submitAnswer(numAnswer, puzzleToken);
      setFeedback(result);
      setAnswered(true);

      // Update the user's score displayed across the app
      updateUser({
        totalScore: result.totalScore,
        totalAttempts: result.totalAttempts,
        correctAnswers: result.correctAnswers,
      });
    } catch (err) {
      setError(err.message || 'Failed to submit answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate the user's accuracy percentage
  const accuracy = user?.totalAttempts > 0
    ? Math.round((user.correctAnswers / user.totalAttempts) * 100)
    : 0;

  return (
    <div className="game-page">
      <div className="game-container">

        {/* Stats Bar */}
        <div className="stats-bar animate-fadeIn">
          <div className="stat-item">
            <span className="stat-icon">⭐</span>
            <div>
              <div className="stat-value">{user?.totalScore || 0}</div>
              <div className="stat-label">Total Score</div>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🎯</span>
            <div>
              <div className="stat-value">{accuracy}%</div>
              <div className="stat-label">Accuracy</div>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">✅</span>
            <div>
              <div className="stat-value">{user?.correctAnswers || 0}</div>
              <div className="stat-label">Correct</div>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">📊</span>
            <div>
              <div className="stat-value">{user?.totalAttempts || 0}</div>
              <div className="stat-label">Attempts</div>
            </div>
          </div>
        </div>

        {/* Puzzle Card */}
        <div className="puzzle-card card animate-fadeIn">
          <div className="puzzle-header">
            <h2 className="puzzle-title">🍌 What number is missing?</h2>
            <p className="puzzle-instruction">
              Look at the banana equation and find the missing digit (0–9)
            </p>
          </div>

          {/* Error display */}
          {error && (
            <div className="alert alert-error animate-shake" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>⚠️ {error}</span>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={loadPuzzle}
                style={{ marginLeft: '1rem', flexShrink: 0 }}
              >
                🔄 Retry
              </button>
            </div>
          )}

          {/* Puzzle Image Area */}
          <div className="puzzle-image-wrapper">
            {loading ? (
              <div className="puzzle-loading">
                <div className="spinner"></div>
                <p>Loading puzzle...</p>
              </div>
            ) : puzzle ? (
              <>
                {!imageLoaded && (
                  <div className="puzzle-loading">
                    <div className="spinner"></div>
                    <p>Loading image...</p>
                  </div>
                )}
                <img
                  src={puzzle}
                  alt="Banana puzzle — find the missing number"
                  className={`puzzle-image ${imageLoaded ? 'visible' : 'hidden'}`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => {
                    setImageLoaded(true);
                    setError('Failed to load puzzle image. Try loading a new puzzle.');
                  }}
                />
              </>
            ) : (
              <div className="puzzle-loading">
                <p className="text-muted">No puzzle loaded yet.</p>
                <button className="btn btn-primary btn-sm" onClick={loadPuzzle} style={{ marginTop: '0.75rem' }}>
                  Load Puzzle
                </button>
              </div>
            )}
          </div>

          {/* Feedback message after answering */}
          {feedback && (
            <div
              className={`feedback-box ${feedback.correct ? 'feedback-correct' : 'feedback-wrong'} animate-bounceIn`}
            >
              <div className="feedback-message">{feedback.message}</div>
              {feedback.correct && (
                <div className="feedback-points">+10 points! 🌟</div>
              )}
            </div>
          )}

          {/* Answer Form */}
          {!answered ? (
            <form onSubmit={handleSubmit} className="answer-form">
              <div className="answer-input-wrapper">
                <input
                  id="answer-input"
                  type="number"
                  className="answer-input"
                  placeholder="Enter 0–9"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  min="0"
                  max="9"
                  disabled={submitting || loading || !puzzle}
                  autoFocus
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  id="submit-answer-btn"
                  disabled={submitting || loading || !puzzle || answer.trim() === ''}
                >
                  {submitting ? (
                    <>
                      <span className="spinner spinner-sm"></span>
                      Checking...
                    </>
                  ) : (
                    '✅ Submit'
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* After answering, show button to load next puzzle */
            <div className="next-puzzle-wrapper">
              <button
                id="next-puzzle-btn"
                className="btn btn-primary btn-lg"
                onClick={loadPuzzle}
              >
                🍌 Next Puzzle
              </button>
            </div>
          )}
        </div>

        {/* How to Play */}
        <div className="how-to-play card animate-fadeIn">
          <h3>📖 How to Play</h3>
          <ul>
            <li>🔍 Look at the banana image carefully</li>
            <li>🔢 Find the single missing digit (0–9)</li>
            <li>✏️ Type your answer in the box</li>
            <li>⭐ Earn 10 points for each correct answer!</li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default GamePage;
