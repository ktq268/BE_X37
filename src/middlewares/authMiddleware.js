import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  // Get token from header
  const token = req.header("x-auth-token");

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

export const requireRoles =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user?.role) {
      return res.status(401).json({ msg: "Unauthorized" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ msg: "Forbidden" });
    }
    next();
  };
