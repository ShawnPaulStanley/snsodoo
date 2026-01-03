/**
 * API Keys Configuration
 * Centralized access to all external API credentials
 */

const env = require('./env');

const apiKeys = {
  grok: {
    apiKey: env.GROK_API_KEY,
    baseUrl: env.GROK_API_URL,
  },

  amadeus: {
    apiKey: env.AMADEUS_API_KEY,
    apiSecret: env.AMADEUS_API_SECRET,
    baseUrl: env.AMADEUS_API_URL,
  },

  openWeather: {
    apiKey: env.OPENWEATHER_API_KEY,
    baseUrl: env.OPENWEATHER_API_URL,
  },

  exchangeRate: {
    apiKey: env.EXCHANGE_API_KEY,
    baseUrl: env.EXCHANGE_API_URL,
  },

  openStreetMap: {
    baseUrl: env.OSM_API_URL,
  },
};

module.exports = apiKeys;
