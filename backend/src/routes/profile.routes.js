import { Router } from 'express';
import { changePassword, deleteProfile, getProfile, updateProfile } from '../controllers/profile.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { changePasswordValidation, updateProfileValidation } from '../validations/profile.validation.js';

const router = Router();

router.use(protect);
router.get('/', getProfile);
router.patch('/', updateProfileValidation, validate, updateProfile);
router.patch('/password', changePasswordValidation, validate, changePassword);
router.delete('/', deleteProfile);

export default router;

