/**
 * Maps Service (OpenStreetMap)
 * Handles geocoding, place search, and distance calculations
 */

import axios from 'axios';
import { env } from '../config/env.js';
import logger from '../utils/logger.new.js';
import { ExternalApiError } from '../utils/errorHandler.js';

const NOMINATIM_URL = env.osmNominatimUrl;
const OVERPASS_URL = env.osmOverpassUrl;

/**
 * Create axios instance for Nominatim API
 */
const nominatimClient = axios.create({
  baseURL: NOMINATIM_URL,
  headers: {
    'User-Agent': 'TravelPlannerApp/1.0',
  },
  timeout: 15000,
});

/**
 * Create axios instance for Overpass API
 */
const overpassClient = axios.create({
  baseURL: OVERPASS_URL,
  timeout: 30000,
});

/**
 * Geocode a city name to coordinates
 */
const geocodeCity = async (cityName, country = null) => {
  try {
    logger.debug('Geocoding city', { cityName, country });

    const query = country ? `${cityName}, ${country}` : cityName;
    const startTime = Date.now();

    const response = await nominatimClient.get('/search', {
      params: {
        q: query,
        format: 'json',
        limit: 1,
        addressdetails: 1,
      },
    });

    const duration = Date.now() - startTime;
    logger.logApiCall('OpenStreetMap', '/search', true, duration);

    if (!response.data || response.data.length === 0) {
      return null;
    }

    const result = response.data[0];

    return {
      name: result.name || cityName,
      displayName: result.display_name,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      country: result.address?.country,
      countryCode: result.address?.country_code?.toUpperCase(),
      state: result.address?.state,
      type: result.type,
      importance: result.importance,
    };
  } catch (error) {
    logger.error('Geocoding error', { cityName, error: error.message });
    throw new ExternalApiError('OpenStreetMap', `Failed to geocode: ${cityName}`);
  }
};

/**
 * Enrich multiple cities with coordinates and details
 */
const enrichCities = async (cities) => {
  const enrichedCities = [];

  for (const city of cities) {
    try {
      // Add delay to respect rate limits (1 request per second for Nominatim)
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const geoData = await geocodeCity(city.name, city.country);

      if (geoData) {
        enrichedCities.push({
          ...city,
          coordinates: {
            latitude: geoData.latitude,
            longitude: geoData.longitude,
          },
          displayName: geoData.displayName,
          countryCode: geoData.countryCode,
          state: geoData.state,
        });
      } else {
        enrichedCities.push({
          ...city,
          coordinates: null,
          error: 'Could not geocode city',
        });
      }
    } catch (error) {
      enrichedCities.push({
        ...city,
        coordinates: null,
        error: error.message,
      });
    }
  }

  return enrichedCities;
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

/**
 * Get nearby points of interest
 */
const getNearbyPOIs = async (latitude, longitude, radius = 5000, types = ['tourism']) => {
  try {
    const typeQuery = types.map((t) => `node["${t}"](around:${radius},${latitude},${longitude});`).join('');

    const query = `
      [out:json][timeout:25];
      (
        ${typeQuery}
      );
      out center 20;
    `;

    const startTime = Date.now();

    const response = await overpassClient.get('/interpreter', {
      params: { data: query },
    });

    const duration = Date.now() - startTime;
    logger.logApiCall('Overpass', '/interpreter', true, duration);

    const pois = response.data.elements.map((el) => ({
      id: el.id,
      name: el.tags?.name || 'Unknown',
      type: el.tags?.tourism || el.tags?.amenity || 'poi',
      latitude: el.lat || el.center?.lat,
      longitude: el.lon || el.center?.lon,
      tags: el.tags,
    }));

    return pois;
  } catch (error) {
    logger.error('Overpass API error', { error: error.message });
    return [];
  }
};

/**
 * Get map tile URL for a location
 */
const getMapTileUrl = (latitude, longitude, zoom = 12) => {
  return `https://www.openstreetmap.org/#map=${zoom}/${latitude}/${longitude}`;
};

/**
 * Validate OSM connection
 */
const validateConnection = async () => {
  try {
    await nominatimClient.get('/status', { timeout: 5000 });
    return { connected: true };
  } catch (error) {
    return { connected: false, error: error.message };
  }
};

export default {
  geocodeCity,
  enrichCities,
  calculateDistance,
  getNearbyPOIs,
  getMapTileUrl,
  validateConnection,
};
