// controllers/authController.js
// Handles the logic for auth endpoints.
// Controllers are thin — they call services/helpers and send responses.

const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Helper: create a short-lived access token (15 minutes)
function createAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

// Helper: create a long-lived refresh token (7 days)
function createRefreshToken(user) {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

// Helper: set refresh token as secure httpOnly cookie
function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,    // JS cannot read this cookie — prevents XSS theft
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });
}

// Called after GitHub OAuth succeeds
// req.user is set by Passport from the database
const handleGithubCallback = (req, res) => {
  const user = req.user;
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  setRefreshCookie(res, refreshToken);

  // Redirect to frontend with access token in URL fragment
  // Frontend extracts it and stores in memory (never in localStorage)
  res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}`);
};

// Called when access token expires — uses refresh cookie to issue new access token
const refreshToken = (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: 'No refresh token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.clearCookie('refreshToken');
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};

// Clear the refresh cookie to log out
const logout = (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
};

// Return current user's profile (JWT must be valid)
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        cpProfiles: {
          select: { id: true, platform: true, username: true, lastSyncAt: true },
        },
      },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

module.exports = { handleGithubCallback, refreshToken, logout, getMe };
