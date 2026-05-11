// server.js — AlgoTrace backend entry point
// This is where Express is configured and the server starts listening.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');

// Import route files
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profiles');
const statsRoutes = require('./routes/stats');

// Import passport config (sets up GitHub strategy)
require('./middleware/passport');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────

// Allow requests from your frontend URL
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true, // required for cookies to work cross-origin
}));

app.use(express.json()); // parse JSON request bodies
app.use(cookieParser()); // parse cookies (needed for refresh token)
app.use(passport.initialize()); // initialize passport (no sessions — we use JWT)

// ─── Routes ──────────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/stats', statsRoutes);

// Health check endpoint — useful for Railway deployment monitoring
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// This catches any errors thrown in route handlers
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`AlgoTrace backend running on http://localhost:${PORT}`);
});
