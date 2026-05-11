// src/api/client.js
// Single Axios instance used by the entire frontend.
// Key feature: request interceptor automatically attaches JWT to every request.
// If JWT expires (401), it silently tries to refresh — transparent to the user.

import axios from 'axios';

// In-memory storage for the access token — NEVER store JWT in localStorage
// (localStorage is vulnerable to XSS attacks)
let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

// Create the Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
  withCredentials: true, // send cookies (refresh token) with every request
});

// REQUEST interceptor — runs before every API call
// Attaches the current access token to the Authorization header
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// RESPONSE interceptor — runs after every API response
// If we get a 401 "Token expired", try to silently refresh and retry
let isRefreshing = false; // prevent multiple simultaneous refresh calls
let failedQueue = []; // queue requests that came in while refreshing

api.interceptors.response.use(
  (response) => response, // success — pass through unchanged
  async (error) => {
    const originalRequest = error.config;

    // If token expired and we haven't already retried this request
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Another refresh is in progress — queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        // Call refresh endpoint — server reads httpOnly cookie
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/auth/refresh`,
          { withCredentials: true }
        );
        const newToken = res.data.accessToken;
        setAccessToken(newToken);

        // Retry all queued requests with the new token
        failedQueue.forEach(({ resolve }) => resolve(newToken));
        failedQueue = [];

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        // Refresh failed — user needs to log in again
        failedQueue.forEach(({ reject }) => reject(refreshErr));
        failedQueue = [];
        setAccessToken(null);
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── API Functions ────────────────────────────────────────────────────────────
// These are the actual functions your components call.
// Keeping them here means you only change the URL in one place if the API changes.

export const authAPI = {
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.get('/auth/refresh'),
};

export const profilesAPI = {
  getAll: () => api.get('/profiles'),
  link: (platform, username) => api.post('/profiles', { platform, username }),
  sync: (profileId) => api.post('/profiles/sync', profileId ? { profileId } : {}),
  unlink: (id) => api.delete(`/profiles/${id}`),
};

export const statsAPI = {
  overview: () => api.get('/stats/overview'),
  contests: (platform) => api.get('/stats/contests', { params: platform ? { platform } : {} }),
  topics: () => api.get('/stats/topics'),
  heatmap: () => api.get('/stats/heatmap'),
};

export default api;
