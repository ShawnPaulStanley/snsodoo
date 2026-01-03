import { Router } from 'express';
import healthRoutes from './health.routes.js';
import recommendationRoutes from './recommendation.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/recommendations', recommendationRoutes);

export default router;
