import app from './app.js';
import connectDB from './config/db.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const startServer = async () => {
  await connectDB();
  app.listen(env.PORT, () => {
    logger.info(`AuthSphere API running on port ${env.PORT}`);
  });
};

startServer().catch((error) => {
  logger.error('Failed to start server', { message: error.message, stack: error.stack });
  process.exit(1);
});
