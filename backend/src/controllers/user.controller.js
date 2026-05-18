import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { recordAudit } from '../utils/audit.js';

export const getUsers = async (_req, res, next) => {
  try {
    const users = await User.find({ deletedAt: null }).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    await recordAudit({
      action: 'user.role_updated',
      actor: req.user._id,
      targetType: 'user',
      targetId: user._id,
      metadata: { role: user.role }
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return next(new AppError('Admins cannot delete their own account', 400));
    }

    const user = await User.findOneAndUpdate({ _id: req.params.id, deletedAt: null }, { deletedAt: new Date() }, { new: true });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    await recordAudit({ action: 'user.deleted', actor: req.user._id, targetType: 'user', targetId: user._id });
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};
