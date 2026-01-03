/**
 * RECOMMENDATION ROUTES
 * 
 * Purpose: Define all recommendation-related endpoints.
 * Maps HTTP routes to controller methods.
 */

import { Router } from 'express';
import recommendationController from '../controllers/recommendation.controller.js';

const router = Router();

/**
 * POST /api/recommendations
 * Get comprehensive recommendations (hotels, flights, restaurants, transport)
 * 
 * Body:
 * {
 *   theme: 'beach',
 *   subTheme: 'deluxe',
 *   location: { cityCode: 'MIA', latitude: 25.7617, longitude: -80.1918 },
 *   dates: { checkIn: '2026-03-01', checkOut: '2026-03-05', departureDate: '2026-03-01', returnDate: '2026-03-05' },
 *   guests: { adults: 2, children: 1, rooms: 1 },
 *   passengers: { adults: 2, children: 1, infants: 0 }
 * }
 */
router.post('/', recommendationController.getRecommendations);

/**
 * POST /api/recommendations/hotels
 * Get hotel recommendations only
 */
router.post('/hotels', recommendationController.getHotels);

/**
 * POST /api/recommendations/flights
 * Get flight recommendations only
 */
router.post('/flights', recommendationController.getFlights);

/**
 * POST /api/recommendations/restaurants
 * Get restaurant recommendations only
 */
router.post('/restaurants', recommendationController.getRestaurants);

/**
 * GET /api/recommendations/themes
 * Get all available theme combinations
 */
router.get('/themes', recommendationController.getThemes);

export default router;
