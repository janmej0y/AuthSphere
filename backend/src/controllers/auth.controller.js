import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { recordAudit } from '../utils/audit.js';
import { generateRefreshToken, generateToken } from '../utils/generateToken.js';

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const sendAuthResponse = (res, statusCode, user) => {
  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  res.cookie('refreshToken', refreshToken, refreshCookieOptions);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email, deletedAt: null });

    if (existingUser) {
      return next(new AppError('Email is already registered', 409));
    }

    const user = await User.create({ name, email, password, role: 'user' });
    await recordAudit({ action: 'auth.registered', actor: user._id, targetType: 'auth', targetId: user._id });
    sendAuthResponse(res, 201, user);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, deletedAt: null }).select('+password +refreshTokenVersion');

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid email or password', 401));
    }

    await recordAudit({ action: 'auth.login', actor: user._id, targetType: 'auth', targetId: user._id });
    sendAuthResponse(res, 200, user);
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (!token) {
      return next(new AppError('Refresh token is required', 401));
    }

    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshTokenVersion');

    if (!user || user.refreshTokenVersion !== decoded.version) {
      return next(new AppError('Invalid refresh token', 401));
    }

    sendAuthResponse(res, 200, user);
  } catch (_error) {
    next(new AppError('Invalid or expired refresh token', 401));
  }
};

export const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { refreshTokenVersion: 1 } });
    }

    res.clearCookie('refreshToken', refreshCookieOptions);
    await recordAudit({ action: 'auth.logout', actor: req.user._id, targetType: 'auth', targetId: req.user._id });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
};
