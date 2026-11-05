import mongoose from 'mongoose';
import config from './index.js';
import logger from '../utils/logger.js';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDatabase = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
      ...config.mongo.options,
    };

    logger.debug('Establishing connection to MongoDB...');
    cached.promise = mongoose.connect(config.mongo.uri, opts).then((m) => {
      logger.info(`MongoDB connected successfully: ${m.connection.host}/${m.connection.name}`);
      return m.connection;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    logger.error(`MongoDB connection failed: ${error.message}`);
    throw error;
  }
};

mongoose.connection.on('disconnected', () => {
  if (cached) cached.conn = null;
  logger.warn('MongoDB connection disconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err.message}`);
});

export const closeDatabase = async () => {
  if (cached && cached.conn) {
    await mongoose.connection.close();
    cached.conn = null;
    cached.promise = null;
    logger.info('MongoDB connection closed');
  }
};

export const getDbState = () => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] || 'unknown';
};

export default { connectDatabase, closeDatabase, getDbState };

