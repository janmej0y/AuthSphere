import { Router } from 'express';
import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';
import profileRoutes from './profile.routes.js';
import taskRoutes from './task.routes.js';
import userRoutes from './user.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/profile', profileRoutes);
router.use('/tasks', taskRoutes);
router.use('/users', userRoutes);

export default router;
