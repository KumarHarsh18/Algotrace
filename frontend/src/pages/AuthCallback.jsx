// src/pages/AuthCallback.jsx
// After GitHub OAuth, the backend redirects here with the access token in the URL.
// This page extracts the token, stores it in memory, fetches user data, then
// redirects to the dashboard. The user sees this page for < 1 second.

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setAccessToken, authAPI } from '../api/client';
import { useAuth } from '../hooks/useAuth';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      navigate('/login?error=auth_failed');
      return;
    }

    // Store the token in memory (not localStorage)
    setAccessToken(token);

    // Clean the token from the URL immediately (security hygiene)
    window.history.replaceState({}, document.title, '/auth/callback');

    // Fetch user profile and go to dashboard
    authAPI.getMe()
      .then((res) => {
        setUser(res.data);
        navigate('/dashboard');
      })
      .catch(() => {
        navigate('/login?error=fetch_failed');
      });
  }, []);

  return (
    <div className="loading-screen">
      <div className="spinner" />
      <p>Logging you in...</p>
    </div>
  );
}
