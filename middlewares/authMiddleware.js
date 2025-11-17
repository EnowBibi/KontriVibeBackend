/*-----------------------------------------------------------------------------------------------------
| @blocktype authMiddleware
| @brief    Validates JWT token and attaches user info to request object
| @param    req, res, next
| @return   --
-----------------------------------------------------------------------------------------------------*/

import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Missing authentication token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}
