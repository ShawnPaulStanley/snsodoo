/**
 * Trip Routes
 * API endpoints for trip/itinerary management
 */

import { Router } from 'express';
import tripController from '../controllers/trip.controller.js';
import { validateTripRequest } from '../middleware/validateRequest.js';

const router = Router();

/**
 * @route   POST /api/trip/create
 * @desc    Create a new travel itinerary
 * @access  Public
 */
router.post('/create', validateTripRequest, tripController.createTrip);

/**
 * @route   GET /api/trip/options
 * @desc    Get available themes, sub-themes, and limits
 * @access  Public
 */
router.get('/options', tripController.getTripOptions);

/**
 * @route   GET /api/trip/validate-services
 * @desc    Validate connections to all external services
 * @access  Public
 */
router.get('/validate-services', tripController.validateServices);

export default router;
