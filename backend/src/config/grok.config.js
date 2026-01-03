/**
 * Grok API Configuration
 * Configures the Grok LLM client for AI-powered recommendations
 */
const env = require('./env');

const grokConfig = {
  apiKey: env.GROK_API_KEY,
  baseUrl: env.GROK_API_URL,
  
  // Default model settings
  model: 'grok-beta',
  
  // Request defaults
  defaults: {
    temperature: 0.7,
    maxTokens: 2048,
    topP: 0.9,
  },

  // Endpoint paths
  endpoints: {
    chat: '/chat/completions',
  },

  // Headers for API requests
  getHeaders: () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${env.GROK_API_KEY}`,
  }),
};

module.exports = grokConfig;
