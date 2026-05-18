import { body, param } from 'express-validator';

export const userIdValidation = [
  param('id').isMongoId().withMessage('Valid user id is required')
];

export const updateUserRoleValidation = [
  ...userIdValidation,
  body('role').isIn(['user', 'admin']).withMessage('Role must be user or admin')
];

