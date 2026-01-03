/**
 * API CLIENT UTILITY
 * 
 * Purpose: Centralized HTTP client for all external API calls.
 * Provides consistent error handling, timeouts, and logging.
 * 
 * In production, this would use axios or node-fetch with:
 * - Request/response interceptors
 * - Retry logic
 * - Rate limiting
 * - Caching
 */

import axios from 'axios';

/**
 * Create configured axios instance
 */
const apiClient = axios.create({
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Request interceptor - logs outgoing requests
 */
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error.message);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - logs responses and handles errors
 */
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error(`[API] Error ${error.response.status}: ${error.response.statusText}`);
    } else if (error.request) {
      // Request made but no response
      console.error('[API] No response received:', error.message);
    } else {
      // Error setting up request
      console.error('[API] Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
