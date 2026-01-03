/**
 * Server Entry Point
 * Starts the Express server
 */

import app from './app.new.js';
import { env } from './config/env.js';
import logger from './utils/logger.new.js';

const PORT = env.port || 4000;

const startServer = async () => {
  try {
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Travel Planner API v2.0 started`);
      logger.info(`📍 Server running on http://localhost:${PORT}`);
      logger.info(`📖 API documentation at http://localhost:${PORT}/api`);
      logger.info(`🔧 Environment: ${env.nodeEnv}`);
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
};

startServer();
