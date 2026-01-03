/**
 * Route Index
 * Central routing configuration
 */

import { Router } from 'express';
import tripRoutes from './trip.routes.js';
import healthRoutes from './health.new.routes.js';

const router = Router();

// Mount routes
router.use('/trip', tripRoutes);
router.use('/health', healthRoutes);

// Root API info
router.get('/', (req, res) => {
  res.json({
    name: 'Travel Planner API',
    version: '2.0.0',
    description: 'Smart travel itinerary generation with AI and external APIs',
    endpoints: {
      trip: {
        create: 'POST /api/trip/create',
        options: 'GET /api/trip/options',
        validateServices: 'GET /api/trip/validate-services',
      },
      health: {
        check: 'GET /api/health',
        ready: 'GET /api/health/ready',
        live: 'GET /api/health/live',
      },
    },
  });
});

export default router;
