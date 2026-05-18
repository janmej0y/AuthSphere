import AuditLog from '../models/AuditLog.js';
import Task from '../models/Task.js';
import User from '../models/User.js';

let cachedStats = null;
let cachedAt = 0;
const CACHE_TTL_MS = 30 * 1000;

export const getAnalytics = async (_req, res, next) => {
  try {
    if (cachedStats && Date.now() - cachedAt < CACHE_TTL_MS) {
      return res.status(200).json({ success: true, cached: true, stats: cachedStats });
    }

    const [totalUsers, totalAdmins, totalTasks, completedTasks, pendingTasks, recentUsers, recentActivity] = await Promise.all([
      User.countDocuments({ deletedAt: null }),
      User.countDocuments({ role: 'admin', deletedAt: null }),
      Task.countDocuments({ deletedAt: null }),
      Task.countDocuments({ status: 'completed', deletedAt: null }),
      Task.countDocuments({ status: 'pending', deletedAt: null }),
      User.find({ deletedAt: null }).sort({ createdAt: -1 }).limit(5).select('name email role createdAt'),
      AuditLog.find().sort({ createdAt: -1 }).limit(10).populate('actor', 'name email role')
    ]);

    cachedStats = {
      totalUsers,
      totalAdmins,
      totalTasks,
      completedTasks,
      pendingTasks,
      recentUsers,
      recentActivity
    };
    cachedAt = Date.now();

    res.status(200).json({ success: true, cached: false, stats: cachedStats });
  } catch (error) {
    next(error);
  }
};

export const getActivity = async (_req, res, next) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(25).populate('actor', 'name email role');
    res.status(200).json({ success: true, logs });
  } catch (error) {
    next(error);
  }
};

export const globalSearch = async (req, res, next) => {
  try {
    const search = (req.query.q || '').trim();

    if (!search) {
      return res.status(200).json({ success: true, users: [], tasks: [] });
    }

    const regex = { $regex: search, $options: 'i' };
    const [users, tasks] = await Promise.all([
      User.find({ deletedAt: null, $or: [{ name: regex }, { email: regex }] }).limit(10).select('name email role createdAt'),
      Task.find({ deletedAt: null, $or: [{ title: regex }, { description: regex }] })
        .limit(10)
        .populate('user', 'name email role')
    ]);

    res.status(200).json({ success: true, users, tasks });
  } catch (error) {
    next(error);
  }
};

