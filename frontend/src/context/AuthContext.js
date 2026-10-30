// AuthContext.js — Manages the logged-in user's state across the whole app
// This is React's Context API — a way to share data without passing props everywhere

import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context object
const AuthContext = createContext(null);

// AuthProvider wraps the whole app and provides user data to all components
export const AuthProvider = ({ children }) => {
  // State: the currently logged-in user (or null if not logged in)
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking localStorage

  // On app start, check if there's a saved user session in localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('bananaPuzzleUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('bananaPuzzleUser');
      }
    }
    setLoading(false);
  }, []);

  // Login: saves user data and JWT token to state and localStorage
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('bananaPuzzleUser', JSON.stringify(userData));
  };

  // Logout: clears the user from state and localStorage
  const logout = () => {
    setUser(null);
    localStorage.removeItem('bananaPuzzleUser');
  };

  // Update user data in state and localStorage (e.g. after earning points)
  const updateUser = (updatedData) => {
    setUser((prevUser) => {
      const newUser = { ...prevUser, ...updatedData };
      localStorage.setItem('bananaPuzzleUser', JSON.stringify(newUser));
      return newUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook — makes it easy to use the auth context in any component
// Usage: const { user, login, logout } = useAuth();
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};

export default AuthContext;
