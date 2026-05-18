import { body, param, query } from 'express-validator';

export const taskIdValidation = [
  param('id').isMongoId().withMessage('Valid task id is required')
];

export const taskListValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive number'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('status').optional().isIn(['pending', 'completed']).withMessage('Status must be pending or completed'),
  query('search').optional().trim().isLength({ max: 100 }).withMessage('Search must be 100 characters or less'),
  query('sort').optional().isIn(['newest', 'oldest', 'title']).withMessage('Sort must be newest, oldest, or title')
];

export const createTaskValidation = [
  body('title').trim().escape().isLength({ min: 2, max: 120 }).withMessage('Title must be 2-120 characters'),
  body('description').optional().trim().escape().isLength({ max: 1000 }).withMessage('Description is too long'),
  body('status').optional().isIn(['pending', 'completed']).withMessage('Status must be pending or completed'),
  body('attachments').optional().isArray({ max: 5 }).withMessage('Attachments must be an array with up to 5 items'),
  body('attachments.*.name').optional().trim().escape().isLength({ max: 160 }).withMessage('Attachment name is too long'),
  body('attachments.*.url').optional().trim().isURL().withMessage('Attachment URL must be valid')
];

export const updateTaskValidation = [
  ...taskIdValidation,
  body('title').optional().trim().escape().isLength({ min: 2, max: 120 }).withMessage('Title must be 2-120 characters'),
  body('description').optional().trim().escape().isLength({ max: 1000 }).withMessage('Description is too long'),
  body('status').optional().isIn(['pending', 'completed']).withMessage('Status must be pending or completed'),
  body('attachments').optional().isArray({ max: 5 }).withMessage('Attachments must be an array with up to 5 items'),
  body('attachments.*.name').optional().trim().escape().isLength({ max: 160 }).withMessage('Attachment name is too long'),
  body('attachments.*.url').optional().trim().isURL().withMessage('Attachment URL must be valid')
];
