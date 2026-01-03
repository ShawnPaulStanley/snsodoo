/**
 * Exchange Rate Service
 * Handles currency conversion using Exchange Rate API
 * 
 * @module services/exchange.service
 */
import axios from 'axios';
import { env } from '../config/env.js';

// Exchange Rate API configuration
const API_KEY = env.exchangeApiKey;
const BASE_URL = env.exchangeApiUrl;

// Cache for exchange rates (to minimize API calls)
const rateCache = new Map();
const CACHE_TTL = 3600000; // 1 hour in milliseconds

/**
 * Get cached rate or null if expired
 * @param {string} baseCurrency - Base currency code
 * @returns {Object|null} - Cached rates or null
 */
const getCachedRates = (baseCurrency) => {
  const cached = rateCache.get(baseCurrency);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.rates;
  }
  return null;
};

/**
 * Cache exchange rates
 * @param {string} baseCurrency - Base currency code
 * @param {Object} rates - Exchange rates
 */
const cacheRates = (baseCurrency, rates) => {
  rateCache.set(baseCurrency, {
    rates,
    timestamp: Date.now(),
  });
};

/**
 * Get all exchange rates for a base currency
 * @param {string} baseCurrency - Base currency code (e.g., 'USD')
 * @returns {Promise<Object>} - Exchange rates for all supported currencies
 */
const getRates = async (baseCurrency = 'USD') => {
  // Check cache first
  const cached = getCachedRates(baseCurrency);
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get(
      `${BASE_URL}/${API_KEY}/latest/${baseCurrency}`,
      { timeout: 10000 }
    );

    if (response.data.result !== 'success') {
      throw new Error(response.data['error-type'] || 'API error');
    }

    const rates = {
      base: response.data.base_code,
      rates: response.data.conversion_rates,
      lastUpdate: response.data.time_last_update_utc,
      nextUpdate: response.data.time_next_update_utc,
    };

    // Cache the result
    cacheRates(baseCurrency, rates);

    return rates;
  } catch (error) {
    console.error('Exchange rate API error:', error.response?.data || error.message);
    throw new Error('Failed to fetch exchange rates');
  }
};

/**
 * Convert amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} from - Source currency code
 * @param {string} to - Target currency code
 * @returns {Promise<Object>} - Conversion result
 */
const convert = async (amount, from, to) => {
  // Validate input
  if (typeof amount !== 'number' || amount < 0) {
    throw new Error('Invalid amount');
  }

  from = from.toUpperCase();
  to = to.toUpperCase();

  try {
    const response = await axios.get(
      `${BASE_URL}/${API_KEY}/pair/${from}/${to}/${amount}`,
      { timeout: 10000 }
    );

    if (response.data.result !== 'success') {
      throw new Error(response.data['error-type'] || 'API error');
    }

    return {
      from: {
        currency: from,
        amount: amount,
      },
      to: {
        currency: to,
        amount: response.data.conversion_result,
      },
      rate: response.data.conversion_rate,
      lastUpdate: response.data.time_last_update_utc,
    };
  } catch (error) {
    console.error('Exchange rate conversion error:', error.response?.data || error.message);
    
    // Fallback: try to use cached rates
    const cachedRates = getCachedRates(from);
    if (cachedRates && cachedRates.rates[to]) {
      const rate = cachedRates.rates[to];
      return {
        from: { currency: from, amount },
        to: { currency: to, amount: amount * rate },
        rate,
        cached: true,
      };
    }

    throw new Error(`Failed to convert ${from} to ${to}`);
  }
};

/**
 * Get exchange rate between two currencies
 * @param {string} from - Source currency code
 * @param {string} to - Target currency code
 * @returns {Promise<number>} - Exchange rate
 */
const getRate = async (from, to) => {
  from = from.toUpperCase();
  to = to.toUpperCase();

  if (from === to) {
    return 1;
  }

  try {
    const response = await axios.get(
      `${BASE_URL}/${API_KEY}/pair/${from}/${to}`,
      { timeout: 10000 }
    );

    if (response.data.result !== 'success') {
      throw new Error(response.data['error-type'] || 'API error');
    }

    return response.data.conversion_rate;
  } catch (error) {
    console.error('Exchange rate error:', error.response?.data || error.message);
    throw new Error(`Failed to get rate for ${from} to ${to}`);
  }
};

/**
 * Normalize budget to a base currency
 * @param {number} amount - Budget amount
 * @param {string} fromCurrency - Current currency
 * @param {string} toCurrency - Target currency (default: USD)
 * @returns {Promise<Object>} - Normalized budget
 */
const normalizeBudget = async (amount, fromCurrency, toCurrency = 'USD') => {
  if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
    return {
      original: { amount, currency: fromCurrency },
      normalized: { amount, currency: toCurrency },
      rate: 1,
    };
  }

  const conversion = await convert(amount, fromCurrency, toCurrency);

  return {
    original: conversion.from,
    normalized: conversion.to,
    rate: conversion.rate,
  };
};

/**
 * Get list of supported currencies
 * @returns {Promise<Array>} - List of supported currency codes
 */
const getSupportedCurrencies = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/${API_KEY}/codes`,
      { timeout: 10000 }
    );

    if (response.data.result !== 'success') {
      throw new Error(response.data['error-type'] || 'API error');
    }

    return response.data.supported_codes.map(([code, name]) => ({
      code,
      name,
    }));
  } catch (error) {
    console.error('Exchange rate API error:', error.response?.data || error.message);
    throw new Error('Failed to fetch supported currencies');
  }
};

/**
 * Convert budget breakdown to target currency
 * @param {Object} breakdown - Budget breakdown object
 * @param {string} fromCurrency - Source currency
 * @param {string} toCurrency - Target currency
 * @returns {Promise<Object>} - Converted breakdown
 */
const convertBreakdown = async (breakdown, fromCurrency, toCurrency) => {
  if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
    return breakdown;
  }

  const rate = await getRate(fromCurrency, toCurrency);

  const converted = {};
  for (const [key, value] of Object.entries(breakdown)) {
    if (typeof value === 'number') {
      converted[key] = Math.round(value * rate * 100) / 100;
    } else if (typeof value === 'object' && value !== null) {
      converted[key] = await convertBreakdown(value, fromCurrency, toCurrency);
    } else {
      converted[key] = value;
    }
  }

  return converted;
};

// Export all functions
export const exchangeService = {
  getRates,
  convert,
  getRate,
  normalizeBudget,
  getSupportedCurrencies,
  convertBreakdown,
};

export default exchangeService;
