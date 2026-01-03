/**
 * Itinerary Service
 * Orchestrates all services to generate complete travel itineraries
 */

import grokService from './grok.new.service.js';
import mapsService from './maps.service.js';
import amadeusService from './amadeus.new.service.js';
import weatherService from './weather.new.service.js';
import exchangeService from './exchange.new.service.js';
import { getThemeConfig } from '../config/themeConfig.js';
import logger from '../utils/logger.new.js';

/**
 * Generate a complete travel itinerary
 */
const generateItinerary = async (tripParams) => {
  const { startingCity, days, theme, subTheme, currency = 'USD' } = tripParams;

  logger.info('Starting itinerary generation', { startingCity, days, theme, subTheme });

  const startTime = Date.now();
  const errors = [];

  try {
    // Step 1: Get LLM recommendations from Grok
    logger.info('Step 1: Getting AI recommendations...');
    const grokResult = await grokService.getTravelRecommendations(tripParams);

    if (!grokResult.success) {
      throw new Error('Failed to get AI recommendations');
    }

    const recommendations = grokResult.data;
    const themeConfig = grokResult.themeConfig;

    // Step 2: Enrich cities with coordinates via OpenStreetMap
    logger.info('Step 2: Enriching cities with location data...');
    let enrichedCities = [];
    try {
      enrichedCities = await mapsService.enrichCities(recommendations.recommendedCities || []);
    } catch (error) {
      logger.error('Maps enrichment failed', { error: error.message });
      errors.push({ service: 'maps', error: error.message });
      enrichedCities = recommendations.recommendedCities || [];
    }

    // Step 3: Search for flights from starting city to first destination
    logger.info('Step 3: Searching for flights...');
    let flights = [];
    try {
      const firstCity = enrichedCities[0];
      if (firstCity) {
        const departureDate = getNextWeekDate();
        const returnDate = addDays(departureDate, days);

        const flightResult = await amadeusService.searchFlights({
          originCity: startingCity,
          destinationCity: firstCity.name,
          departureDate: formatDate(departureDate),
          returnDate: formatDate(returnDate),
          travelClass: themeConfig.subTheme.flightClass,
          maxResults: 5,
        });

        flights = flightResult.flights || [];
      }
    } catch (error) {
      logger.error('Flight search failed', { error: error.message });
      errors.push({ service: 'flights', error: error.message });
    }

    // Step 4: Search for hotels in destination cities
    logger.info('Step 4: Searching for hotels...');
    let hotels = [];
    try {
      const checkInDate = formatDate(getNextWeekDate());
      const checkOutDate = formatDate(addDays(getNextWeekDate(), days));

      for (const city of enrichedCities.slice(0, 3)) {
        try {
          // Get airport code to use as city code for hotel search
          const cityCode = await amadeusService.getAirportCode(city.name);

          if (cityCode) {
            const hotelResult = await amadeusService.searchHotels({
              cityCode,
              checkInDate,
              checkOutDate,
              maxResults: 3,
            });

            hotels.push({
              city: city.name,
              hotels: hotelResult.hotels || [],
            });
          }
        } catch (error) {
          logger.warn('Hotel search failed for city', { city: city.name, error: error.message });
        }

        // Small delay between searches
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (error) {
      logger.error('Hotel search failed', { error: error.message });
      errors.push({ service: 'hotels', error: error.message });
    }

    // Step 5: Get weather forecasts
    logger.info('Step 5: Fetching weather data...');
    let weather = [];
    try {
      weather = await weatherService.getWeatherForCities(
        enrichedCities.map((c) => ({
          name: c.name,
          countryCode: c.countryCode,
        }))
      );
    } catch (error) {
      logger.error('Weather fetch failed', { error: error.message });
      errors.push({ service: 'weather', error: error.message });
    }

    // Step 6: Convert budget to target currency
    logger.info('Step 6: Converting currency...');
    let budget = recommendations.budgetBreakdown || {};
    try {
      if (currency !== 'USD') {
        budget = await exchangeService.convertBudget(budget, 'USD', currency);
      } else {
        budget.currency = 'USD';
      }
    } catch (error) {
      logger.error('Currency conversion failed', { error: error.message });
      errors.push({ service: 'exchange', error: error.message });
      budget.currency = 'USD';
    }

    // Calculate total budget for the trip
    const totalBudget = {
      ...budget,
      perDay: budget.total || 0,
      total: (budget.total || 0) * days,
      days,
    };

    // Build the final itinerary
    const itinerary = {
      tripSummary: {
        ...recommendations.tripSummary,
        generatedAt: new Date().toISOString(),
        generationTime: `${Date.now() - startTime}ms`,
      },
      cities: enrichedCities.map((city) => ({
        name: city.name,
        country: city.country,
        daysToSpend: city.daysToSpend,
        highlights: city.highlights,
        whyVisit: city.whyVisit,
        coordinates: city.coordinates,
        mapUrl: city.coordinates
          ? mapsService.getMapTileUrl(city.coordinates.latitude, city.coordinates.longitude)
          : null,
      })),
      activities: recommendations.activities || [],
      flights: flights.map((f) => ({
        ...f,
        priceConverted: currency !== 'USD' ? null : f.price, // TODO: Add conversion
      })),
      hotels: hotels.flatMap((cityHotels) =>
        cityHotels.hotels.map((h) => ({
          ...h,
          city: cityHotels.city,
        }))
      ),
      weather,
      budget: {
        estimated: totalBudget,
        currency,
        breakdown: budget,
      },
      themeConfig: {
        theme,
        subTheme,
        preferences: {
          hotelCategory: themeConfig.subTheme.hotelCategory,
          flightClass: themeConfig.subTheme.flightClass,
          priceRange: themeConfig.subTheme.priceRange,
        },
      },
      errors: errors.length > 0 ? errors : undefined,
    };

    logger.info('Itinerary generation complete', {
      duration: `${Date.now() - startTime}ms`,
      cities: enrichedCities.length,
      flights: flights.length,
      hotels: hotels.length,
    });

    return itinerary;
  } catch (error) {
    logger.error('Itinerary generation failed', { error: error.message });
    throw error;
  }
};

/**
 * Helper: Get date for next week
 */
const getNextWeekDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date;
};

/**
 * Helper: Add days to a date
 */
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Helper: Format date as YYYY-MM-DD
 */
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

/**
 * Validate all external service connections
 */
const validateServices = async () => {
  const results = await Promise.all([
    grokService.validateConnection(),
    mapsService.validateConnection(),
    amadeusService.validateConnection(),
    weatherService.validateConnection(),
    exchangeService.validateConnection(),
  ]);

  return {
    grok: results[0],
    maps: results[1],
    amadeus: results[2],
    weather: results[3],
    exchange: results[4],
  };
};

export default {
  generateItinerary,
  validateServices,
};
