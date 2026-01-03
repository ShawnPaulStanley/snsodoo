/**
 * OpenStreetMap Service
 * Handles geocoding, location validation, and map data using Nominatim & Overpass APIs
 * 
 * @module services/osm.service
 */
import axios from 'axios';
import { env } from '../config/env.js';

// OSM API URLs
const NOMINATIM_URL = env.osmNominatimUrl;
const OVERPASS_URL = env.osmOverpassUrl;

// Rate limiting: Nominatim requires 1 request/second max
let lastRequestTime = 0;
const RATE_LIMIT_MS = 1100; // 1.1 seconds to be safe

/**
 * Wait for rate limit if needed
 */
const enforceRateLimit = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < RATE_LIMIT_MS) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_MS - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();
};

/**
 * Create axios instance for Nominatim
 */
const nominatimClient = axios.create({
  baseURL: NOMINATIM_URL,
  headers: {
    'User-Agent': 'TravelItineraryApp/1.0 (hackathon-project)',
  },
  timeout: 10000,
});

/**
 * Search for a city by name
 * @param {string} query - City name to search
 * @param {Object} options - Search options
 * @param {number} options.limit - Max results (default: 5)
 * @param {string} options.countryCode - Limit to specific country (ISO 3166-1 alpha-2)
 * @returns {Promise<Array>} - Array of matching locations
 */
const searchCity = async (query, options = {}) => {
  const { limit = 5, countryCode = null } = options;

  await enforceRateLimit();

  const params = {
    q: query,
    format: 'json',
    addressdetails: 1,
    limit,
    featuretype: 'city',
  };

  if (countryCode) {
    params.countrycodes = countryCode;
  }

  try {
    const response = await nominatimClient.get('/search', { params });
    
    return response.data.map(place => ({
      name: place.name,
      displayName: place.display_name,
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon),
      country: place.address?.country,
      countryCode: place.address?.country_code?.toUpperCase(),
      state: place.address?.state,
      type: place.type,
      importance: place.importance,
      boundingBox: place.boundingbox?.map(parseFloat),
      osmId: place.osm_id,
      osmType: place.osm_type,
    }));
  } catch (error) {
    console.error('Nominatim search error:', error.message);
    throw new Error(`Failed to search for city: ${error.message}`);
  }
};

/**
 * Get coordinates for a city
 * @param {string} cityName - City name
 * @param {string} country - Country name (optional)
 * @returns {Promise<Object>} - Coordinates and city details
 */
const getCoordinates = async (cityName, country = null) => {
  const query = country ? `${cityName}, ${country}` : cityName;
  const results = await searchCity(query, { limit: 1 });
  
  if (results.length === 0) {
    throw new Error(`City not found: ${query}`);
  }

  return results[0];
};

/**
 * Reverse geocode coordinates to get location details
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} - Location details
 */
const reverseGeocode = async (lat, lon) => {
  await enforceRateLimit();

  try {
    const response = await nominatimClient.get('/reverse', {
      params: {
        lat,
        lon,
        format: 'json',
        addressdetails: 1,
      },
    });

    const place = response.data;
    return {
      name: place.name,
      displayName: place.display_name,
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon),
      address: place.address,
      type: place.type,
    };
  } catch (error) {
    console.error('Nominatim reverse geocode error:', error.message);
    throw new Error(`Failed to reverse geocode: ${error.message}`);
  }
};

/**
 * Validate if a city exists
 * @param {string} cityName - City name to validate
 * @param {string} country - Expected country (optional)
 * @returns {Promise<Object>} - Validation result with city details
 */
const validateCity = async (cityName, country = null) => {
  try {
    const results = await searchCity(cityName, { limit: 3 });
    
    if (results.length === 0) {
      return { valid: false, message: 'City not found' };
    }

    // If country specified, filter results
    if (country) {
      const countryLower = country.toLowerCase();
      const matchingCity = results.find(
        r => r.country?.toLowerCase() === countryLower || 
             r.countryCode?.toLowerCase() === countryLower
      );
      
      if (matchingCity) {
        return { valid: true, city: matchingCity };
      }
      
      return { 
        valid: false, 
        message: `City "${cityName}" not found in ${country}`,
        suggestions: results.slice(0, 3),
      };
    }

    return { valid: true, city: results[0] };
  } catch (error) {
    return { valid: false, message: error.message };
  }
};

/**
 * Get points of interest near a location using Overpass API
 * @param {number} lat - Center latitude
 * @param {number} lon - Center longitude
 * @param {number} radius - Search radius in meters
 * @param {string} category - POI category (tourism, restaurant, hotel, etc.)
 * @returns {Promise<Array>} - Array of POIs
 */
const getPointsOfInterest = async (lat, lon, radius = 5000, category = 'tourism') => {
  const overpassQuery = `
    [out:json][timeout:25];
    (
      node["${category}"](around:${radius},${lat},${lon});
      way["${category}"](around:${radius},${lat},${lon});
    );
    out center tags 20;
  `;

  try {
    const response = await axios.post(
      `${OVERPASS_URL}/interpreter`,
      `data=${encodeURIComponent(overpassQuery)}`,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 30000,
      }
    );

    return response.data.elements.map(element => ({
      id: element.id,
      type: element.type,
      lat: element.lat || element.center?.lat,
      lon: element.lon || element.center?.lon,
      name: element.tags?.name,
      category: element.tags?.[category] || category,
      tags: element.tags,
    }));
  } catch (error) {
    console.error('Overpass API error:', error.message);
    throw new Error(`Failed to get points of interest: ${error.message}`);
  }
};

/**
 * Get airport codes near a city
 * @param {string} cityName - City name
 * @param {string} country - Country name (optional)
 * @returns {Promise<Array>} - Array of nearby airports
 */
const getNearbyAirports = async (cityName, country = null) => {
  const city = await getCoordinates(cityName, country);
  
  const overpassQuery = `
    [out:json][timeout:25];
    (
      node["aeroway"="aerodrome"](around:100000,${city.lat},${city.lon});
      way["aeroway"="aerodrome"](around:100000,${city.lat},${city.lon});
    );
    out center tags;
  `;

  try {
    const response = await axios.post(
      `${OVERPASS_URL}/interpreter`,
      `data=${encodeURIComponent(overpassQuery)}`,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 30000,
      }
    );

    return response.data.elements
      .filter(el => el.tags?.iata || el.tags?.icao || el.tags?.name)
      .map(element => ({
        name: element.tags?.name,
        iata: element.tags?.iata || null,
        icao: element.tags?.icao || null,
        lat: element.lat || element.center?.lat,
        lon: element.lon || element.center?.lon,
        type: element.tags?.aeroway,
      }));
  } catch (error) {
    console.error('Airport search error:', error.message);
    return []; // Return empty array rather than throwing
  }
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @returns {number} - Distance in kilometers
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
  return R * c;
};

// Export all functions
export const osmService = {
  searchCity,
  getCoordinates,
  reverseGeocode,
  validateCity,
  getPointsOfInterest,
  getNearbyAirports,
  calculateDistance,
};

export default osmService;
