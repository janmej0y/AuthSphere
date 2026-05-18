import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

const connectDB = async () => {
  mongoose.set('strictQuery', true);
  const connection = await mongoose.connect(env.MONGO_URI);
  logger.info(`MongoDB connected: ${connection.connection.host}`);
};

export default connectDB;
