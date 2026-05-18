import AuditLog from '../models/AuditLog.js';
import { logger } from './logger.js';

export const recordAudit = async ({ action, actor = null, targetType, targetId = null, metadata = {} }) => {
  try {
    await AuditLog.create({ action, actor, targetType, targetId, metadata });
  } catch (error) {
    logger.error('Failed to record audit log', { message: error.message });
  }
};

