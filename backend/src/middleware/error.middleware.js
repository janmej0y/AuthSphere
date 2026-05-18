import AppError from '../utils/AppError.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export const notFound = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

export const errorHandler = (error, _req, res, _next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';

  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource identifier';
  }

  if (error.code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value entered';
  }

  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors).map((item) => item.message).join(', ');
  }

  logger.error(message, { requestId: _req.id, statusCode, stack: error.stack });

  res.status(statusCode).json({
    success: false,
    message,
    requestId: _req.id,
    stack: env.NODE_ENV === 'production' ? undefined : error.stack
  });
};
