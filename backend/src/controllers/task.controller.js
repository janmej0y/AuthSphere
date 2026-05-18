import Task from '../models/Task.js';
import AppError from '../utils/AppError.js';
import { recordAudit } from '../utils/audit.js';

const taskQueryForUser = (req, id) => {
  const query = id ? { _id: id, deletedAt: null } : { deletedAt: null };
  return req.user.role === 'admin' ? query : { ...query, user: req.user._id };
};

const buildTaskListQuery = (req) => {
  const query = taskQueryForUser(req);

  if (req.query.status) {
    query.status = req.query.status;
  }

  if (req.query.search) {
    const search = req.query.search.trim();
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  return query;
};

const sortMap = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  title: { title: 1 }
};

export const createTask = async (req, res, next) => {
  try {
    const task = await Task.create({
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
      attachments: req.body.attachments,
      user: req.user._id
    });

    await recordAudit({ action: 'task.created', actor: req.user._id, targetType: 'task', targetId: task._id });
    res.status(201).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;
    const query = buildTaskListQuery(req);
    const sort = sortMap[req.query.sort] || sortMap.newest;
    const [tasks, total] = await Promise.all([
      Task.find(query).sort(sort).skip(skip).limit(limit).populate('user', 'name email role'),
      Task.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: tasks.length,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      tasks
    });
  } catch (error) {
    next(error);
  }
};

export const getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne(taskQueryForUser(req, req.params.id)).populate('user', 'name email role');

    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    res.status(200).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(taskQueryForUser(req, req.params.id), req.body, {
      new: true,
      runValidators: true
    });

    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    await recordAudit({ action: 'task.updated', actor: req.user._id, targetType: 'task', targetId: task._id });
    res.status(200).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(taskQueryForUser(req, req.params.id), { deletedAt: new Date() }, { new: true });

    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    await recordAudit({ action: 'task.deleted', actor: req.user._id, targetType: 'task', targetId: task._id });
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};
