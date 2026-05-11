// routes/auth.js
// Handles all authentication endpoints

const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/verifyToken');

// Step 1: Redirect user to GitHub login page
router.get('/github', passport.authenticate('github', { session: false }));

// Step 2: GitHub redirects back here with a code
// Passport exchanges the code for a GitHub token and calls our strategy
router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/login-failed' }),
  authController.handleGithubCallback
);

// Refresh access token using the refresh token cookie
router.get('/refresh', authController.refreshToken);

// Logout — clears the refresh token cookie
router.post('/logout', authController.logout);

// Get the current logged-in user's info (protected)
router.get('/me', verifyToken, authController.getMe);

module.exports = router;
