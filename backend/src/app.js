import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import config from './config/index.js';
import { connectDatabase } from './config/db.js';
import { standardLimiter } from './middlewares/rateLimiter.js';
import errorHandler from './middlewares/errorHandler.js';
import apiRouter from './routes/index.js';
import { errorResponse } from './utils/response.js';
import logger from './utils/logger.js';

const app = express();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration with explicit allowlist & Vercel/Netlify preview domain support
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, cron jobs)
      if (!origin) return callback(null, true);

      let isAllowed =
        config.corsOrigins.includes(origin) ||
        config.corsOrigins.includes('*') ||
        config.env === 'development';

      if (!isAllowed) {
        try {
          const hostname = new URL(origin).hostname;
          if (hostname.endsWith('.vercel.app') || hostname.endsWith('.netlify.app')) {
            isAllowed = true;
          }
        } catch {
          // invalid URL format, ignore
        }
      }

      if (isAllowed) {
        return callback(null, true);
      }
      return callback(new Error(`CORS error: Origin ${origin} not permitted.`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body Parsing & Cookies
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// Database connection assurance for Serverless (Vercel) & traditional servers
app.use(async (req, res, next) => {
  // Allow health liveness to pass through immediately
  if (req.originalUrl === '/api/v1/health' || req.originalUrl === '/api/v1/health/') {
    return next();
  }
  try {
    await connectDatabase();
    next();
  } catch (err) {
    logger.error(`Database connection error in request: ${err.message}`);
    if (req.originalUrl.includes('/health')) {
      return next();
    }
    return errorResponse(res, 'Database connection unavailable', 503, 'SERVICE_UNAVAILABLE');
  }
});

// HTTP Request Logging
if (config.env !== 'test') {
  app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));
}

// Global rate limiter
app.use('/api', standardLimiter);

// Mount API v1 router
app.use('/api/v1', apiRouter);

// 404 Route handler for undefined endpoints
app.use('*', (req, res) => {
  return errorResponse(res, `Endpoint not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND');
});

// Centralized error handler
app.use(errorHandler);

export default app;

