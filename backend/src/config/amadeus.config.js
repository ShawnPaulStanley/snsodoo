/**
 * Amadeus Travel API Configuration
 * Configures the Amadeus client for flights and hotels
 */
const env = require('./env');

const amadeusConfig = {
  clientId: env.AMADEUS_CLIENT_ID,
  clientSecret: env.AMADEUS_CLIENT_SECRET,
  baseUrl: env.AMADEUS_API_URL,

  // Endpoints
  endpoints: {
    // Authentication
    auth: '/v1/security/oauth2/token',
    
    // Flights
    flightOffers: '/v2/shopping/flight-offers',
    flightPrice: '/v1/shopping/flight-offers/pricing',
    
    // Hotels
    hotelList: '/v1/reference-data/locations/hotels/by-city',
    hotelOffers: '/v3/shopping/hotel-offers',
    hotelSearch: '/v2/shopping/hotel-offers',
  },

  // Token management (will be updated at runtime)
  accessToken: null,
  tokenExpiry: null,

  // Get auth headers
  getAuthHeaders: () => ({
    'Content-Type': 'application/x-www-form-urlencoded',
  }),

  // Get API headers with token
  getHeaders: (token) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }),
};

module.exports = amadeusConfig;
