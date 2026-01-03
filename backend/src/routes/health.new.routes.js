/**
 * Health Routes
 * API endpoints for health checks and monitoring
 */

import { Router } from 'express';

const router = Router();

/**
 * @route   GET /api/health
 * @desc    Basic health check
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * @route   GET /api/health/ready
 * @desc    Readiness check
 * @access  Public
 */
router.get('/ready', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ready',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @route   GET /api/health/live
 * @desc    Liveness check
 * @access  Public
 */
router.get('/live', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'alive',
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
  });
});

export default router;
