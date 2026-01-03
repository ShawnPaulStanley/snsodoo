/**
 * Logger Utility
 * Centralized logging with different log levels
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const currentLevel = process.env.LOG_LEVEL
  ? LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()] ?? LOG_LEVELS.INFO
  : LOG_LEVELS.INFO;

const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaString = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}] ${message}${metaString}`;
};

const logger = {
  error: (message, meta = {}) => {
    if (currentLevel >= LOG_LEVELS.ERROR) {
      console.error(formatMessage('ERROR', message, meta));
    }
  },

  warn: (message, meta = {}) => {
    if (currentLevel >= LOG_LEVELS.WARN) {
      console.warn(formatMessage('WARN', message, meta));
    }
  },

  info: (message, meta = {}) => {
    if (currentLevel >= LOG_LEVELS.INFO) {
      console.log(formatMessage('INFO', message, meta));
    }
  },

  debug: (message, meta = {}) => {
    if (currentLevel >= LOG_LEVELS.DEBUG) {
      console.log(formatMessage('DEBUG', message, meta));
    }
  },

  /**
   * Log API request
   */
  logRequest: (req) => {
    logger.info(`${req.method} ${req.originalUrl}`, {
      body: req.body,
      query: req.query,
    });
  },

  /**
   * Log API response
   */
  logResponse: (req, statusCode, duration) => {
    logger.info(`${req.method} ${req.originalUrl} - ${statusCode}`, {
      duration: `${duration}ms`,
    });
  },

  /**
   * Log external API call
   */
  logApiCall: (service, endpoint, success = true, duration = 0) => {
    const level = success ? 'info' : 'error';
    logger[level](`External API: ${service} - ${endpoint}`, {
      success,
      duration: `${duration}ms`,
    });
  },
};

export default logger;
