/**
 * OpenWeatherMap API Configuration
 * Configures weather data fetching
 */
const env = require('./env');

const weatherConfig = {
  apiKey: env.OPENWEATHER_API_KEY,
  baseUrl: env.OPENWEATHER_API_URL,

  // Endpoints
  endpoints: {
    current: '/weather',
    forecast: '/forecast',
    oneCall: '/onecall', // For 7-day forecast (requires One Call API subscription)
  },

  // Default parameters
  defaults: {
    units: 'metric', // 'metric', 'imperial', or 'standard'
    lang: 'en',
  },

  // Build query params
  getParams: (additionalParams = {}) => ({
    appid: env.OPENWEATHER_API_KEY,
    units: weatherConfig.defaults.units,
    lang: weatherConfig.defaults.lang,
    ...additionalParams,
  }),
};

module.exports = weatherConfig;
