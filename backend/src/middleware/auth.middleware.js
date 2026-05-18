import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';

export const protect = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return next(new AppError('Authentication token is required', 401));
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.id, deletedAt: null }).select('-password');

    if (!user) {
      return next(new AppError('User no longer exists', 401));
    }

    req.user = user;
    next();
  } catch (_error) {
    next(new AppError('Invalid or expired token', 401));
  }
};

export const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to access this resource', 403));
    }

    next();
  };
};
