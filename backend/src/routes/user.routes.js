import { Router } from 'express';
import { deleteUser, getUsers, updateUserRole } from '../controllers/user.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { updateUserRoleValidation, userIdValidation } from '../validations/user.validation.js';

const router = Router();

router.get('/', protect, authorize('admin'), getUsers);
router.patch('/:id/role', protect, authorize('admin'), updateUserRoleValidation, validate, updateUserRole);
router.delete('/:id', protect, authorize('admin'), userIdValidation, validate, deleteUser);

export default router;
