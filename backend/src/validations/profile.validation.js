import { body } from 'express-validator';

export const updateProfileValidation = [
  body('name').optional().trim().escape().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),
  body('email').optional().trim().normalizeEmail().isEmail().withMessage('Valid email is required')
];

export const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

