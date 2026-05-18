import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger.js';
import { env } from './config/env.js';
import { apiLimiter } from './middleware/rateLimiter.middleware.js';
import { requestId } from './middleware/requestId.middleware.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';
import { logger } from './utils/logger.js';

const app = express();
const allowedOrigins = (env.CLIENT_URLS || env.CLIENT_URL || 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map((origin) => origin.trim());

app.use(requestId);
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    exposedHeaders: ['X-Request-Id']
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());

if (env.NODE_ENV !== 'test') {
  app.use(
    morgan('combined', {
      stream: {
        write: (message) => logger.info(message.trim())
      }
    })
  );
}

app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'AuthSphere API is healthy' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/v1', apiLimiter);
app.use('/api/v1', routes);
app.use(notFound);
app.use(errorHandler);

export default app;
