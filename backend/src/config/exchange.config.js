/**
 * Exchange Rate API Configuration
 * Configures currency conversion service
 */
const env = require('./env');

const exchangeConfig = {
  apiKey: env.EXCHANGE_API_KEY,
  baseUrl: env.EXCHANGE_API_URL,

  // Endpoints (appended to baseUrl/{apiKey})
  endpoints: {
    latest: '/latest',
    pair: '/pair',
    convert: '/pair', // Same as pair but with amount
  },

  // Default base currency
  defaultCurrency: 'USD',

  // Supported currencies for the app
  supportedCurrencies: [
    'USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SGD',
    'AED', 'THB', 'MXN', 'BRL', 'ZAR', 'NZD', 'KRW', 'HKD', 'SEK', 'NOK'
  ],

  // Build URL for exchange rate API
  buildUrl: (endpoint, ...params) => {
    return `${env.EXCHANGE_API_URL}/${env.EXCHANGE_API_KEY}${endpoint}/${params.join('/')}`;
  },
};

module.exports = exchangeConfig;
