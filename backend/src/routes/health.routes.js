import { Router } from 'express';
import { getDbState } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = Router();

// Liveness check: confirms backend server is alive and accepting traffic
router.get('/', (req, res) => {
  return successResponse(
    res,
    {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'library-hub-api',
      version: '1.0.0',
    },
    'Library Hub API is running'
  );
});

// Readiness check: confirms backend dependencies (MongoDB) are ready
router.get('/ready', (req, res) => {
  const dbState = getDbState();
  const isReady = dbState === 'connected';

  if (!isReady) {
    return errorResponse(
      res,
      'Service not ready: Database connection unavailable',
      503,
      'SERVICE_UNAVAILABLE',
      { databaseState: dbState }
    );
  }

  return successResponse(
    res,
    {
      status: 'ready',
      database: dbState,
      timestamp: new Date().toISOString(),
    },
    'Library Hub API is ready to accept requests'
  );
});

export default router;

