/**
 * Environment Configuration
 * Loads and validates all environment variables for the travel itinerary platform
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory of this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const env = {
  // Server
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Grok API (LLM) - Primary AI engine
  grokApiKey: process.env.GROK_API_KEY || '',
  grokApiUrl: process.env.GROK_API_URL || 'https://api.x.ai/v1',

  // Amadeus Travel API - Flights & Hotels
  amadeusClientId: process.env.AMADEUS_CLIENT_ID || '',
  amadeusClientSecret: process.env.AMADEUS_CLIENT_SECRET || '',
  amadeusApiUrl: process.env.AMADEUS_API_URL || 'https://test.api.amadeus.com',

  // OpenWeatherMap API - Weather forecasts
  openweatherApiKey: process.env.OPENWEATHER_API_KEY || '',
  openweatherApiUrl: process.env.OPENWEATHER_API_URL || 'https://api.openweathermap.org/data/2.5',

  // Exchange Rate API - Currency conversion
  exchangeApiKey: process.env.EXCHANGE_API_KEY || '',
  exchangeApiUrl: process.env.EXCHANGE_API_URL || 'https://v6.exchangerate-api.com/v6',

  // OpenStreetMap (Nominatim/Overpass) - No API key needed
  osmNominatimUrl: process.env.OSM_NOMINATIM_URL || 'https://nominatim.openstreetmap.org',
  osmOverpassUrl: process.env.OSM_OVERPASS_URL || 'https://overpass-api.de/api',

  // Legacy support
  llmProvider: process.env.LLM_PROVIDER || 'grok',
  llmApiKey: process.env.LLM_API_KEY || process.env.GROK_API_KEY || '',
};

/**
 * Validate required environment variables
 */
const validateEnv = () => {
  const required = [
    { key: 'grokApiKey', name: 'GROK_API_KEY' },
    { key: 'amadeusClientId', name: 'AMADEUS_CLIENT_ID' },
    { key: 'amadeusClientSecret', name: 'AMADEUS_CLIENT_SECRET' },
    { key: 'openweatherApiKey', name: 'OPENWEATHER_API_KEY' },
    { key: 'exchangeApiKey', name: 'EXCHANGE_API_KEY' },
  ];

  const missing = required.filter(({ key }) => !env[key]);

  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.map(m => m.name).join(', ')}`);
    console.warn('Some features may not work correctly.');
  }

  return missing.length === 0;
};

const isValid = validateEnv();

export { env, isValid };
