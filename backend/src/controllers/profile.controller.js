import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { recordAudit } from '../utils/audit.js';

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
});

export const getProfile = async (req, res) => {
  res.status(200).json({ success: true, user: publicUser(req.user) });
};

export const updateProfile = async (req, res, next) => {
  try {
    const updates = {};

    if (req.body.name) updates.name = req.body.name;
    if (req.body.email) {
      const existingUser = await User.findOne({ email: req.body.email, _id: { $ne: req.user._id } });
      if (existingUser) {
        return next(new AppError('Email is already in use', 409));
      }
      updates.email = req.body.email;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    await recordAudit({ action: 'profile.updated', actor: req.user._id, targetType: 'profile', targetId: req.user._id });

    res.status(200).json({ success: true, user: publicUser(user) });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password +refreshTokenVersion');

    if (!(await user.comparePassword(req.body.currentPassword))) {
      return next(new AppError('Current password is incorrect', 401));
    }

    user.password = req.body.newPassword;
    user.refreshTokenVersion += 1;
    await user.save();
    await recordAudit({ action: 'profile.password_changed', actor: req.user._id, targetType: 'profile', targetId: req.user._id });

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteProfile = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { deletedAt: new Date(), $inc: { refreshTokenVersion: 1 } });
    await recordAudit({ action: 'profile.deleted', actor: req.user._id, targetType: 'profile', targetId: req.user._id });

    res.status(200).json({ success: true, message: 'Profile deleted successfully' });
  } catch (error) {
    next(error);
  }
};

