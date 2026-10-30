// api.js — Centralized API helper functions
// All requests to the backend go through this file
// This keeps API logic separate from UI components

const BASE_URL = 'http://localhost:5000/api';

// Helper: get the JWT token from localStorage (via saved user object)
const getToken = () => {
  const user = JSON.parse(localStorage.getItem('bananaPuzzleUser') || 'null');
  return user?.token || null;
};

// Helper: build request headers (with optional Authorization for protected routes)
const buildHeaders = (includeAuth = true) => {
  const headers = { 'Content-Type': 'application/json' };
  if (includeAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Helper: handles fetch response — throws an error if the status is not OK
const handleResponse = async (response) => {
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Server returned status ${response.status} (${response.statusText || 'Unknown error'})`);
  }
  if (!response.ok) {
    throw new Error(data?.message || 'Something went wrong');
  }
  return data;
};

// Helper: safely executes fetch and provides a helpful message if the server is offline
const apiRequest = async (url, options = {}) => {
  let response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    throw new Error('Cannot connect to backend server. Make sure the backend is running on http://localhost:5000');
  }
  return handleResponse(response);
};

// ─── Auth API ──────────────────────────────────────────────────────────────

// Register a new user
export const registerUser = async (username, email, password) => {
  return apiRequest(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: buildHeaders(false),
    body: JSON.stringify({ username, email, password }),
  });
};

// Login with email and password
export const loginUser = async (email, password) => {
  return apiRequest(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: buildHeaders(false),
    body: JSON.stringify({ email, password }),
  });
};

// Get the logged-in user's profile (protected)
export const getProfile = async () => {
  return apiRequest(`${BASE_URL}/auth/profile`, {
    headers: buildHeaders(),
  });
};

// ─── Game API ──────────────────────────────────────────────────────────────

// Fetch a new puzzle from the backend (which proxies the Banana API)
export const fetchPuzzle = async () => {
  return apiRequest(`${BASE_URL}/game/puzzle`, {
    headers: buildHeaders(),
  });
};

// Submit an answer for checking
export const submitAnswer = async (answer, puzzleToken) => {
  return apiRequest(`${BASE_URL}/game/submit`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ answer, puzzleToken }),
  });
};

// ─── Leaderboard API ───────────────────────────────────────────────────────

// Fetch the top 10 players
export const fetchLeaderboard = async () => {
  return apiRequest(`${BASE_URL}/leaderboard`, {
    headers: buildHeaders(),
  });
};
