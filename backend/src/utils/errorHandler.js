/**
 * Error Handler Utility
 * Centralized error handling and custom error classes
 */

import logger from './logger.new.js';

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error
 */
class ValidationError extends ApiError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

/**
 * Not Found Error
 */
class NotFoundError extends ApiError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

/**
 * External API Error
 */
class ExternalApiError extends ApiError {
  constructor(service, message, details = null) {
    super(`${service} API error: ${message}`, 502, 'EXTERNAL_API_ERROR', details);
    this.name = 'ExternalApiError';
    this.service = service;
  }
}

/**
 * Rate Limit Error
 */
class RateLimitError extends ApiError {
  constructor(retryAfter = 60) {
    super('Too many requests. Please try again later.', 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Format error response
 */
const formatErrorResponse = (error) => {
  return {
    success: false,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: error.message || 'An unexpected error occurred',
      details: error.details || null,
    },
  };
};

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(err.message, {
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle ApiError instances
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(formatErrorResponse(err));
  }

  // Handle Axios errors (external API calls)
  if (err.response) {
    const externalError = new ExternalApiError(
      err.config?.baseURL || 'External',
      err.response.data?.message || err.message,
      err.response.data
    );
    return res.status(externalError.statusCode).json(formatErrorResponse(externalError));
  }

  // Handle validation errors from express-validator or Joi
  if (err.name === 'ValidationError' && err.errors) {
    const validationError = new ValidationError('Validation failed', err.errors);
    return res.status(400).json(formatErrorResponse(validationError));
  }

  // Handle unknown errors
  const serverError = new ApiError(
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message,
    500,
    'INTERNAL_ERROR'
  );

  return res.status(500).json(formatErrorResponse(serverError));
};

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors automatically
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export {
  ApiError,
  ValidationError,
  NotFoundError,
  ExternalApiError,
  RateLimitError,
  errorHandler,
  asyncHandler,
  formatErrorResponse,
};
