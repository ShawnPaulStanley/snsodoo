/**
 * RECOMMENDATION CONTROLLER
 * 
 * Purpose: Orchestrates the entire recommendation flow.
 * This is where EVERYTHING comes together.
 * 
 * FLOW:
 * 1. Receives request (theme, subTheme, location, dates, etc.)
 * 2. Validates inputs
 * 3. Resolves RecommendationProfile via ThemeResolver
 * 4. Converts profile to API params via Adapters
 * 5. Calls API Services
 * 6. Ranks/filters results via Adapters
 * 7. Aggregates everything
 * 8. Returns recommendations + UI hints
 * 
 * Architecture Decision:
 * - Controller has ZERO theme-specific logic
 * - Controller has ZERO API-specific logic
 * - Controller is PURE ORCHESTRATION
 * - Easy to test, easy to understand
 */

import themeResolver from '../services/themeResolver.service.js';
import hotelService from '../services/hotels.service.js';
import flightService from '../services/flights.service.js';
import foodService from '../services/food.service.js';
import transportService from '../services/transport.service.js';
import weatherService from '../services/weather.service.js';

import hotelAdapter from '../adapters/hotelParams.adapter.js';
import flightAdapter from '../adapters/flightParams.adapter.js';
import foodAdapter from '../adapters/foodParams.adapter.js';
import transportAdapter from '../adapters/transportParams.adapter.js';

class RecommendationController {
  /**
   * Get complete recommendations based on theme and location
   * 
   * This is the MAIN endpoint that demonstrates the full architecture.
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async getRecommendations(req, res) {
    try {
      // 1. EXTRACT & VALIDATE inputs
      const {
        theme,
        subTheme,
        location, // { cityCode, latitude, longitude }
        dates, // { checkIn, checkOut, departureDate, returnDate }
        guests, // { adults, children, rooms }
        passengers, // { adults, children, infants }
      } = req.body;

      // Basic validation
      if (!theme || !subTheme || !location) {
        return res.status(400).json({
          error: 'Missing required fields: theme, subTheme, location',
        });
      }

      // 2. RESOLVE RECOMMENDATION PROFILE
      // This is the KEY step - transforms theme into configuration
      const profile = themeResolver.resolveProfile(theme, subTheme);

      console.log(`[Recommendation] Resolved profile: ${profile.name}`);

      // 3. BUILD API PARAMETERS using adapters
      const searchContext = {
        location,
        checkIn: dates?.checkIn,
        checkOut: dates?.checkOut,
        guests: guests || { adults: 2, children: 0, rooms: 1 },
        origin: location.origin || location.cityCode,
        destination: location.destination || location.cityCode,
        departureDate: dates?.departureDate,
        returnDate: dates?.returnDate,
        passengers: passengers || { adults: 1, children: 0, infants: 0 },
      };

      const hotelParams = hotelAdapter.toAmadeusParams(profile, searchContext);
      const flightParams = flightAdapter.toAmadeusParams(profile, searchContext);
      const foodParams = foodAdapter.toYelpParams(profile, searchContext);
      const transportParams = transportAdapter.toRome2RioParams(profile, searchContext);

      // 4. CALL EXTERNAL APIS (in parallel for speed)
      console.log('[Recommendation] Fetching from APIs...');
      
      const [hotels, flights, restaurants, transport, weather] = await Promise.all([
        hotelService.searchHotels(hotelParams),
        flightService.searchFlights(flightParams),
        foodService.searchRestaurants(foodParams),
        transportService.searchTransport(transportParams),
        weatherService.getCurrentWeather(location),
      ]);

      console.log('[Recommendation] Raw results received');

      // 5. RANK & FILTER results using profile weights
      const rankedHotels = hotelAdapter.rankHotels(hotels, profile);
      const rankedFlights = flightAdapter.rankFlights(flights, profile);
      const rankedRestaurants = foodAdapter.rankRestaurants(restaurants, profile);
      const rankedTransport = transportAdapter.rankTransportOptions(transport, profile);

      console.log('[Recommendation] Results ranked and filtered');

      // 6. AGGREGATE RESPONSE
      const recommendations = {
        // Metadata
        profile: {
          theme: profile.theme,
          subTheme: profile.subTheme,
          name: profile.name,
          budgetRange: profile.budgetRange,
        },
        
        // UI Hints (for frontend to use)
        uiHints: profile.uiHints,
        
        // LLM Bias (for future AI integration)
        llmBias: profile.llmBias,

        // Recommendations
        hotels: rankedHotels.slice(0, 5), // Top 5
        flights: rankedFlights.slice(0, 3), // Top 3
        restaurants: rankedRestaurants.slice(0, 8), // Top 8
        transport: rankedTransport.slice(0, 4), // Top 4
        
        // Context
        weather,
        
        // Stats
        stats: {
          totalHotels: hotels.length,
          totalFlights: flights.length,
          totalRestaurants: restaurants.length,
          totalTransportOptions: transport.length,
          recommendedHotels: rankedHotels.length,
          recommendedFlights: rankedFlights.length,
          recommendedRestaurants: rankedRestaurants.length,
          recommendedTransport: rankedTransport.length,
        },
      };

      // 7. RETURN RESPONSE
      return res.status(200).json({
        success: true,
        data: recommendations,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('[Recommendation] Error:', error.message);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get hotels only (focused endpoint)
   * 
   * @param {Object} req 
   * @param {Object} res 
   */
  async getHotels(req, res) {
    try {
      const { theme, subTheme, location, dates, guests } = req.body;

      if (!theme || !subTheme || !location) {
        return res.status(400).json({
          error: 'Missing required fields',
        });
      }

      const profile = themeResolver.resolveProfile(theme, subTheme);
      
      const searchContext = {
        location,
        checkIn: dates?.checkIn,
        checkOut: dates?.checkOut,
        guests: guests || { adults: 2, children: 0, rooms: 1 },
      };

      const hotelParams = hotelAdapter.toAmadeusParams(profile, searchContext);
      const hotels = await hotelService.searchHotels(hotelParams);
      const rankedHotels = hotelAdapter.rankHotels(hotels, profile);

      return res.status(200).json({
        success: true,
        data: {
          profile: {
            theme: profile.theme,
            subTheme: profile.subTheme,
            name: profile.name,
          },
          hotels: rankedHotels,
          uiHints: profile.uiHints,
        },
      });

    } catch (error) {
      console.error('[Hotels] Error:', error.message);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get flights only
   * 
   * @param {Object} req 
   * @param {Object} res 
   */
  async getFlights(req, res) {
    try {
      const { theme, subTheme, location, dates, passengers } = req.body;

      if (!theme || !subTheme || !location) {
        return res.status(400).json({
          error: 'Missing required fields',
        });
      }

      const profile = themeResolver.resolveProfile(theme, subTheme);
      
      const searchContext = {
        origin: location.origin,
        destination: location.destination,
        departureDate: dates?.departureDate,
        returnDate: dates?.returnDate,
        passengers: passengers || { adults: 1, children: 0, infants: 0 },
      };

      const flightParams = flightAdapter.toAmadeusParams(profile, searchContext);
      const flights = await flightService.searchFlights(flightParams);
      const rankedFlights = flightAdapter.rankFlights(flights, profile);

      return res.status(200).json({
        success: true,
        data: {
          profile: {
            theme: profile.theme,
            subTheme: profile.subTheme,
            name: profile.name,
          },
          flights: rankedFlights,
          uiHints: profile.uiHints,
        },
      });

    } catch (error) {
      console.error('[Flights] Error:', error.message);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get restaurants only
   * 
   * @param {Object} req 
   * @param {Object} res 
   */
  async getRestaurants(req, res) {
    try {
      const { theme, subTheme, location } = req.body;

      if (!theme || !subTheme || !location) {
        return res.status(400).json({
          error: 'Missing required fields',
        });
      }

      const profile = themeResolver.resolveProfile(theme, subTheme);
      
      const searchContext = { location };
      const foodParams = foodAdapter.toYelpParams(profile, searchContext);
      const restaurants = await foodService.searchRestaurants(foodParams);
      const rankedRestaurants = foodAdapter.rankRestaurants(restaurants, profile);

      return res.status(200).json({
        success: true,
        data: {
          profile: {
            theme: profile.theme,
            subTheme: profile.subTheme,
            name: profile.name,
          },
          restaurants: rankedRestaurants,
          uiHints: profile.uiHints,
        },
      });

    } catch (error) {
      console.error('[Restaurants] Error:', error.message);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get available theme combinations
   * 
   * @param {Object} req 
   * @param {Object} res 
   */
  async getThemes(req, res) {
    try {
      const { getAllThemeCombinations } = await import('../config/themeProfiles.js');
      const themes = getAllThemeCombinations();

      return res.status(200).json({
        success: true,
        data: themes,
      });

    } catch (error) {
      console.error('[Themes] Error:', error.message);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

export default new RecommendationController();
