/**
 * Request Validation Middleware
 * Validates incoming request data for the trip API
 */

import { ValidationError } from '../utils/errorHandler.js';
import { validateTheme, THEMES, SUB_THEMES } from '../config/themeConfig.js';

/**
 * Validate trip creation request
 */
const validateTripRequest = (req, res, next) => {
  const { startingCity, days, theme, subTheme, currency } = req.body;
  const errors = [];

  // Validate startingCity
  if (!startingCity || typeof startingCity !== 'string') {
    errors.push('startingCity is required and must be a string');
  } else if (startingCity.trim().length < 2) {
    errors.push('startingCity must be at least 2 characters');
  }

  // Validate days
  if (days === undefined || days === null) {
    errors.push('days is required');
  } else if (!Number.isInteger(days) || days < 1 || days > 30) {
    errors.push('days must be an integer between 1 and 30');
  }

  // Validate theme
  if (!theme) {
    errors.push('theme is required');
  } else {
    const themeValidation = validateTheme(theme, subTheme || SUB_THEMES.DELUXE);
    if (!themeValidation.isValid) {
      errors.push(...themeValidation.errors);
    }
  }

  // Validate subTheme
  if (!subTheme) {
    errors.push('subTheme is required');
  }

  // Validate currency (optional, default to USD)
  if (currency && typeof currency !== 'string') {
    errors.push('currency must be a string (e.g., USD, EUR, INR)');
  }

  if (errors.length > 0) {
    throw new ValidationError('Invalid request body', errors);
  }

  // Normalize request body
  req.body.startingCity = startingCity.trim();
  req.body.days = parseInt(days, 10);
  req.body.theme = theme;
  req.body.subTheme = subTheme;
  req.body.currency = currency?.toUpperCase() || 'USD';

  next();
};

/**
 * Validate request has JSON content type
 */
const validateContentType = (req, res, next) => {
  if (req.method !== 'GET' && !req.is('application/json')) {
    throw new ValidationError('Content-Type must be application/json');
  }
  next();
};

/**
 * Available themes for documentation
 */
const getAvailableOptions = () => ({
  themes: Object.values(THEMES),
  subThemes: Object.values(SUB_THEMES),
  supportedCurrencies: ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD'],
  limits: {
    minDays: 1,
    maxDays: 30,
  },
});

export {
  validateTripRequest,
  validateContentType,
  getAvailableOptions,
};
