import jwt from 'jsonwebtoken';
import User from '../models/UserModel.js';

export const staffAuth = async (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    
    // Check if user is staff or admin
    if (req.user.role !== 'staff' && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied, staff privileges required' });
    }
    
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};