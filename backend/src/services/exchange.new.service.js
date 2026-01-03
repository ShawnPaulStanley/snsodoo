/**
 * Exchange Rate Service
 * Handles currency conversion via Exchange Rate API
 */

import axios from 'axios';
import { env } from '../config/env.js';
import logger from '../utils/logger.new.js';
import { ExternalApiError } from '../utils/errorHandler.js';

const EXCHANGE_API_URL = env.exchangeApiUrl;
const API_KEY = env.exchangeApiKey;

// Cache exchange rates for 1 hour
let ratesCache = null;
let cacheExpiry = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Create axios instance for Exchange Rate API
 */
const exchangeClient = axios.create({
  baseURL: `${EXCHANGE_API_URL}/${API_KEY}`,
  timeout: 15000,
});

/**
 * Get latest exchange rates (cached)
 */
const getExchangeRates = async (baseCurrency = 'USD') => {
  // Check cache
  if (ratesCache && cacheExpiry && Date.now() < cacheExpiry && ratesCache.base === baseCurrency) {
    logger.debug('Using cached exchange rates');
    return ratesCache;
  }

  try {
    logger.info('Fetching exchange rates', { baseCurrency });

    const startTime = Date.now();

    const response = await exchangeClient.get(`/latest/${baseCurrency}`);

    const duration = Date.now() - startTime;
    logger.logApiCall('ExchangeRate', '/latest', true, duration);

    if (response.data.result !== 'success') {
      throw new Error(response.data['error-type'] || 'Unknown error');
    }

    const rates = {
      base: response.data.base_code,
      timestamp: response.data.time_last_update_utc,
      rates: response.data.conversion_rates,
    };

    // Update cache
    ratesCache = rates;
    cacheExpiry = Date.now() + CACHE_DURATION;

    return rates;
  } catch (error) {
    logger.error('Exchange rate fetch error', { error: error.message });

    // Return cached data if available, even if expired
    if (ratesCache) {
      logger.warn('Using expired cache due to API error');
      return ratesCache;
    }

    throw new ExternalApiError('ExchangeRate', 'Failed to fetch exchange rates');
  }
};

/**
 * Convert amount between currencies
 */
const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  try {
    if (fromCurrency === toCurrency) {
      return {
        amount,
        from: fromCurrency,
        to: toCurrency,
        convertedAmount: amount,
        rate: 1,
      };
    }

    const rates = await getExchangeRates(fromCurrency);
    const rate = rates.rates[toCurrency];

    if (!rate) {
      throw new Error(`Unsupported currency: ${toCurrency}`);
    }

    const convertedAmount = Math.round(amount * rate * 100) / 100;

    return {
      amount,
      from: fromCurrency,
      to: toCurrency,
      convertedAmount,
      rate,
      timestamp: rates.timestamp,
    };
  } catch (error) {
    logger.error('Currency conversion error', { error: error.message });
    throw new ExternalApiError('ExchangeRate', error.message);
  }
};

/**
 * Convert budget object to target currency
 */
const convertBudget = async (budget, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) {
    return { ...budget, currency: toCurrency };
  }

  try {
    const rates = await getExchangeRates(fromCurrency);
    const rate = rates.rates[toCurrency];

    if (!rate) {
      throw new Error(`Unsupported currency: ${toCurrency}`);
    }

    const convertedBudget = {};

    for (const [key, value] of Object.entries(budget)) {
      if (typeof value === 'number' && key !== 'rate') {
        convertedBudget[key] = Math.round(value * rate * 100) / 100;
      } else {
        convertedBudget[key] = value;
      }
    }

    convertedBudget.currency = toCurrency;
    convertedBudget.originalCurrency = fromCurrency;
    convertedBudget.exchangeRate = rate;

    return convertedBudget;
  } catch (error) {
    logger.error('Budget conversion error', { error: error.message });
    return { ...budget, currency: fromCurrency, conversionError: error.message };
  }
};

/**
 * Get list of supported currencies
 */
const getSupportedCurrencies = async () => {
  try {
    const response = await exchangeClient.get('/codes');

    if (response.data.result !== 'success') {
      throw new Error('Failed to fetch currency codes');
    }

    return response.data.supported_codes.map(([code, name]) => ({
      code,
      name,
    }));
  } catch (error) {
    logger.error('Failed to get currency codes', { error: error.message });

    // Return common currencies as fallback
    return [
      { code: 'USD', name: 'United States Dollar' },
      { code: 'EUR', name: 'Euro' },
      { code: 'GBP', name: 'British Pound Sterling' },
      { code: 'INR', name: 'Indian Rupee' },
      { code: 'JPY', name: 'Japanese Yen' },
      { code: 'AUD', name: 'Australian Dollar' },
      { code: 'CAD', name: 'Canadian Dollar' },
    ];
  }
};

/**
 * Validate Exchange Rate API connection
 */
const validateConnection = async () => {
  try {
    const response = await exchangeClient.get('/latest/USD');
    return {
      connected: response.data.result === 'success',
    };
  } catch (error) {
    return { connected: false, error: error.message };
  }
};

export default {
  getExchangeRates,
  convertCurrency,
  convertBudget,
  getSupportedCurrencies,
  validateConnection,
};
