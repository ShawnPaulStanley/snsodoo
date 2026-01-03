/**
 * Trip Controller
 * Handles HTTP requests for trip-related operations
 */

import itineraryService from '../services/itinerary.service.js';
import { getAvailableOptions } from '../middleware/validateRequest.js';
import { asyncHandler } from '../utils/errorHandler.js';
import logger from '../utils/logger.new.js';

/**
 * Create a new trip itinerary
 * POST /api/trip/create
 */
const createTrip = asyncHandler(async (req, res) => {
  const { startingCity, days, theme, subTheme, currency } = req.body;

  logger.info('Creating trip itinerary', { startingCity, days, theme, subTheme });

  const itinerary = await itineraryService.generateItinerary({
    startingCity,
    days,
    theme,
    subTheme,
    currency,
  });

  res.status(200).json({
    success: true,
    data: itinerary,
  });
});

/**
 * Get available trip options (themes, sub-themes, etc.)
 * GET /api/trip/options
 */
const getTripOptions = asyncHandler(async (req, res) => {
  const options = getAvailableOptions();

  res.status(200).json({
    success: true,
    data: options,
  });
});

/**
 * Validate external service connections
 * GET /api/trip/validate-services
 */
const validateServices = asyncHandler(async (req, res) => {
  logger.info('Validating external service connections');

  const results = await itineraryService.validateServices();

  const allConnected = Object.values(results).every((r) => r.connected);

  res.status(allConnected ? 200 : 503).json({
    success: allConnected,
    data: {
      status: allConnected ? 'All services connected' : 'Some services unavailable',
      services: results,
    },
  });
});

export default {
  createTrip,
  getTripOptions,
  validateServices,
};
