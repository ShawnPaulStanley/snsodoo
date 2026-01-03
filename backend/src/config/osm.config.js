/**
 * OpenStreetMap Configuration
 * Configures Nominatim (geocoding) and Overpass (data) APIs
 */
const env = require('./env');

const osmConfig = {
  // Nominatim API (geocoding & search)
  nominatim: {
    baseUrl: env.OSM_NOMINATIM_URL,
    endpoints: {
      search: '/search',
      reverse: '/reverse',
      lookup: '/lookup',
    },
    // Required: User-Agent header for Nominatim
    headers: {
      'User-Agent': 'TravelItineraryApp/1.0 (contact@example.com)',
    },
    defaults: {
      format: 'json',
      addressdetails: 1,
      limit: 10,
    },
  },

  // Overpass API (detailed map data)
  overpass: {
    baseUrl: env.OSM_OVERPASS_URL,
    endpoints: {
      interpreter: '/interpreter',
    },
    // Default timeout for queries (seconds)
    timeout: 30,
  },

  // Rate limiting (Nominatim has 1 request/second limit)
  rateLimitMs: 1000,
};

module.exports = osmConfig;
