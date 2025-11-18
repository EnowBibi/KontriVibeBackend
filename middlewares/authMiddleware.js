import jwt from "jsonwebtoken";

// Simple in-memory blacklist
const tokenBlacklist = new Set();

/**
 * Add token to blacklist
 * @param {string} token - JWT token to blacklist
 */
export const addToBlacklist = (token) => {
  tokenBlacklist.add(token);
};

/**
 * Check if token is blacklisted
 */
const isBlacklisted = (token) => tokenBlacklist.has(token);

/**
 * Authentication middleware with blacklist check
 */
export function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Missing authentication token" });
  }

  // Check blacklist
  if (isBlacklisted(token)) {
    return res.status(401).json({ error: "Token is blacklisted" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}
