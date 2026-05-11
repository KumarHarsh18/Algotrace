// middleware/verifyToken.js
// This middleware runs before any protected route.
// It reads the JWT from the Authorization header and validates it.

const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  // JWT is sent as: Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1]; // extract the token part

  try {
    // jwt.verify throws if token is expired or has wrong signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info to request object
    next(); // proceed to the actual route handler
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = verifyToken;
