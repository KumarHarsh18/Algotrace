// src/hooks/useAuth.js
// Custom hook that manages the user's authentication state.
// Any component that needs to know "is the user logged in?" uses this hook.

import { useState, useEffect, createContext, useContext } from 'react';
import { authAPI } from '../api/client';
import { setAccessToken } from '../api/client';

// Create a Context — this lets us share auth state without prop drilling
const AuthContext = createContext(null);

// AuthProvider wraps the entire app (see main.jsx)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);      // null = not logged in
  const [loading, setLoading] = useState(true); // true while we check session

  useEffect(() => {
    // On app load, check if there's a valid session (refresh cookie)
    checkSession();
  }, []);

  async function checkSession() {
    try {
      // Try to get a new access token using the httpOnly refresh cookie
      const res = await authAPI.refresh();
      setAccessToken(res.data.accessToken);

      // Now fetch the user's info
      const userRes = await authAPI.getMe();
      setUser(userRes.data);
    } catch {
      // No valid session — user needs to log in
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await authAPI.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
}

// useAuth hook — use this in any component
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
