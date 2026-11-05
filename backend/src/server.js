import http from 'http';
import app from './app.js';
import config from './config/index.js';
import { connectDatabase, closeDatabase } from './config/db.js';
import { startCronJobs, stopCronJobs } from './jobs/cronScheduler.js';
import logger from './utils/logger.js';

const server = http.createServer(app);

const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase().catch((err) => {
      logger.warn(`Database connection deferred: ${err.message}. Server will still start for offline/mock development.`);
    });

    server.listen(config.port, () => {
      logger.info(`=======================================================`);
      logger.info(`  Library Hub API Server running in [${config.env}] mode`);
      logger.info(`  Port: ${config.port}`);
      logger.info(`  Health check: http://localhost:${config.port}/api/v1/health`);
      logger.info(`  Timezone: ${config.timezone}`);
      logger.info(`=======================================================`);

      // Start background cron jobs (e.g. 11:59 PM auto check-out)
      startCronJobs();
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  stopCronJobs();
  server.close(async () => {
    logger.info('HTTP server closed.');
    await closeDatabase();
    process.exit(0);
  });

  // Force close after 10s if shutdown hangs
  setTimeout(() => {
    logger.error('Forcefully terminating process after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default server;

