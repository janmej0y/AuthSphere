import { Router } from 'express';
import {
  createTask,
  deleteTask,
  getTask,
  getTasks,
  updateTask
} from '../controllers/task.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createTaskValidation,
  taskListValidation,
  taskIdValidation,
  updateTaskValidation
} from '../validations/task.validation.js';

const router = Router();

router.use(protect);
router.route('/').get(taskListValidation, validate, getTasks).post(createTaskValidation, validate, createTask);
router
  .route('/:id')
  .get(taskIdValidation, validate, getTask)
  .patch(updateTaskValidation, validate, updateTask)
  .delete(taskIdValidation, validate, deleteTask);

export default router;
