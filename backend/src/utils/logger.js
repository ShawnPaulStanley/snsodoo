/**
 * LOGGER UTILITY
 * 
 * Purpose: Centralized logging for the application.
 * Provides consistent log formatting and levels.
 * 
 * In production, would integrate with:
 * - Winston
 * - Pino
 * - Cloud logging services
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

class Logger {
  constructor() {
    this.level = process.env.LOG_LEVEL || 'INFO';
  }

  /**
   * Format log message with timestamp and level
   */
  _format(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaString = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
    return `[${timestamp}] [${level}] ${message} ${metaString}`;
  }

  /**
   * Log error message
   */
  error(message, meta = {}) {
    console.error(this._format(LOG_LEVELS.ERROR, message, meta));
  }

  /**
   * Log warning message
   */
  warn(message, meta = {}) {
    if (this._shouldLog(LOG_LEVELS.WARN)) {
      console.warn(this._format(LOG_LEVELS.WARN, message, meta));
    }
  }

  /**
   * Log info message
   */
  info(message, meta = {}) {
    if (this._shouldLog(LOG_LEVELS.INFO)) {
      console.log(this._format(LOG_LEVELS.INFO, message, meta));
    }
  }

  /**
   * Log debug message
   */
  debug(message, meta = {}) {
    if (this._shouldLog(LOG_LEVELS.DEBUG)) {
      console.log(this._format(LOG_LEVELS.DEBUG, message, meta));
    }
  }

  /**
   * Check if current level allows logging
   */
  _shouldLog(level) {
    const levels = [LOG_LEVELS.ERROR, LOG_LEVELS.WARN, LOG_LEVELS.INFO, LOG_LEVELS.DEBUG];
    const currentIndex = levels.indexOf(this.level);
    const targetIndex = levels.indexOf(level);
    return targetIndex <= currentIndex;
  }
}

export default new Logger();
