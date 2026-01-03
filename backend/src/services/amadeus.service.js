/**
 * Amadeus Travel API Service
 * Handles flight and hotel searches using Amadeus API
 * 
 * @module services/amadeus.service
 */
import axios from 'axios';
import { env } from '../config/env.js';

// Amadeus API configuration
const AMADEUS_API_URL = env.amadeusApiUrl;
const CLIENT_ID = env.amadeusClientId;
const CLIENT_SECRET = env.amadeusClientSecret;

// Token management
let accessToken = null;
let tokenExpiry = null;

/**
 * Get or refresh Amadeus access token
 * @returns {Promise<string>} - Valid access token
 */
const getAccessToken = async () => {
  // Check if we have a valid token
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const response = await axios.post(
      `${AMADEUS_API_URL}/v1/security/oauth2/token`,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    accessToken = response.data.access_token;
    // Set expiry 5 minutes before actual expiry for safety
    tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

    return accessToken;
  } catch (error) {
    console.error('Amadeus auth error:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Amadeus API');
  }
};

/**
 * Create authenticated axios instance
 * @returns {Promise<AxiosInstance>} - Authenticated axios instance
 */
const getClient = async () => {
  const token = await getAccessToken();
  return axios.create({
    baseURL: AMADEUS_API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    timeout: 30000,
  });
};

/**
 * Search for flights
 * @param {Object} params - Flight search parameters
 * @param {string} params.origin - Origin airport IATA code
 * @param {string} params.destination - Destination airport IATA code
 * @param {string} params.departureDate - Departure date (YYYY-MM-DD)
 * @param {string} params.returnDate - Return date (YYYY-MM-DD, optional)
 * @param {number} params.adults - Number of adult passengers
 * @param {string} params.travelClass - Travel class (ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST)
 * @param {number} params.maxPrice - Maximum price (optional)
 * @param {number} params.max - Maximum number of results (default: 10)
 * @returns {Promise<Object>} - Flight offers
 */
const searchFlights = async (params) => {
  const {
    origin,
    destination,
    departureDate,
    returnDate = null,
    adults = 1,
    travelClass = 'ECONOMY',
    maxPrice = null,
    max = 10,
  } = params;

  try {
    const client = await getClient();

    const queryParams = {
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate,
      adults,
      travelClass,
      max,
      currencyCode: 'USD',
    };

    if (returnDate) {
      queryParams.returnDate = returnDate;
    }

    if (maxPrice) {
      queryParams.maxPrice = maxPrice;
    }

    const response = await client.get('/v2/shopping/flight-offers', {
      params: queryParams,
    });

    // Process and simplify flight data
    const flights = response.data.data.map(offer => ({
      id: offer.id,
      price: {
        total: parseFloat(offer.price.total),
        currency: offer.price.currency,
        perAdult: parseFloat(offer.price.total) / adults,
      },
      itineraries: offer.itineraries.map(itinerary => ({
        duration: itinerary.duration,
        segments: itinerary.segments.map(segment => ({
          departure: {
            airport: segment.departure.iataCode,
            time: segment.departure.at,
            terminal: segment.departure.terminal,
          },
          arrival: {
            airport: segment.arrival.iataCode,
            time: segment.arrival.at,
            terminal: segment.arrival.terminal,
          },
          carrier: segment.carrierCode,
          flightNumber: `${segment.carrierCode}${segment.number}`,
          duration: segment.duration,
          aircraft: segment.aircraft?.code,
        })),
      })),
      numberOfBookableSeats: offer.numberOfBookableSeats,
      lastTicketingDate: offer.lastTicketingDate,
    }));

    return {
      flights,
      dictionaries: response.data.dictionaries,
      meta: response.data.meta,
    };
  } catch (error) {
    console.error('Amadeus flight search error:', error.response?.data || error.message);
    if (error.response?.status === 400) {
      throw new Error(`Invalid flight search parameters: ${error.response.data.errors?.[0]?.detail || 'Check your input'}`);
    }
    throw new Error('Failed to search flights');
  }
};

/**
 * Search for hotels by city
 * @param {Object} params - Hotel search parameters
 * @param {string} params.cityCode - City IATA code
 * @param {string} params.checkInDate - Check-in date (YYYY-MM-DD)
 * @param {string} params.checkOutDate - Check-out date (YYYY-MM-DD)
 * @param {number} params.adults - Number of adults
 * @param {number} params.rooms - Number of rooms
 * @param {Array<string>} params.ratings - Hotel star ratings to filter (e.g., ['4', '5'])
 * @param {string} params.priceRange - Price range ('LOW', 'MEDIUM', 'HIGH')
 * @returns {Promise<Object>} - Hotel offers
 */
const searchHotels = async (params) => {
  const {
    cityCode,
    checkInDate,
    checkOutDate,
    adults = 1,
    rooms = 1,
    ratings = [],
    priceRange = null,
  } = params;

  try {
    const client = await getClient();

    // First, get hotel list by city
    const hotelListResponse = await client.get('/v1/reference-data/locations/hotels/by-city', {
      params: {
        cityCode,
        ratings: ratings.join(',') || undefined,
        hotelSource: 'ALL',
      },
    });

    if (!hotelListResponse.data.data || hotelListResponse.data.data.length === 0) {
      return { hotels: [], message: 'No hotels found in this city' };
    }

    // Get hotel IDs (limit to first 20 for API limits)
    const hotelIds = hotelListResponse.data.data
      .slice(0, 20)
      .map(hotel => hotel.hotelId);

    // Get offers for these hotels
    const offersResponse = await client.get('/v3/shopping/hotel-offers', {
      params: {
        hotelIds: hotelIds.join(','),
        checkInDate,
        checkOutDate,
        adults,
        roomQuantity: rooms,
        currency: 'USD',
      },
    });

    // Process and simplify hotel data
    const hotels = offersResponse.data.data.map(hotel => ({
      hotelId: hotel.hotel.hotelId,
      name: hotel.hotel.name,
      rating: hotel.hotel.rating,
      cityCode: hotel.hotel.cityCode,
      latitude: hotel.hotel.latitude,
      longitude: hotel.hotel.longitude,
      address: hotel.hotel.address,
      offers: hotel.offers?.map(offer => ({
        id: offer.id,
        checkInDate: offer.checkInDate,
        checkOutDate: offer.checkOutDate,
        room: {
          type: offer.room?.type,
          description: offer.room?.description?.text,
          beds: offer.room?.typeEstimated?.beds,
          bedType: offer.room?.typeEstimated?.bedType,
        },
        guests: offer.guests,
        price: {
          total: offer.price?.total,
          currency: offer.price?.currency,
          perNight: offer.price?.total 
            ? (parseFloat(offer.price.total) / 
               Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)))
            : null,
        },
        policies: {
          cancellation: offer.policies?.cancellation,
          paymentType: offer.policies?.paymentType,
        },
      })) || [],
    }));

    return {
      hotels: hotels.filter(h => h.offers.length > 0),
      meta: offersResponse.data.meta,
    };
  } catch (error) {
    console.error('Amadeus hotel search error:', error.response?.data || error.message);
    if (error.response?.status === 400) {
      throw new Error(`Invalid hotel search parameters: ${error.response.data.errors?.[0]?.detail || 'Check your input'}`);
    }
    throw new Error('Failed to search hotels');
  }
};

/**
 * Get hotel ratings for a specific hotel
 * @param {Array<string>} hotelIds - Array of hotel IDs
 * @returns {Promise<Array>} - Hotel ratings and sentiments
 */
const getHotelRatings = async (hotelIds) => {
  try {
    const client = await getClient();

    const response = await client.get('/v2/e-reputation/hotel-sentiments', {
      params: {
        hotelIds: hotelIds.join(','),
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('Amadeus hotel ratings error:', error.response?.data || error.message);
    return []; // Return empty array rather than throwing
  }
};

/**
 * Get IATA code for a city
 * @param {string} cityName - City name
 * @returns {Promise<string>} - IATA city code
 */
const getCityCode = async (cityName) => {
  try {
    const client = await getClient();

    const response = await client.get('/v1/reference-data/locations', {
      params: {
        subType: 'CITY,AIRPORT',
        keyword: cityName,
        page: { limit: 5 },
      },
    });

    if (response.data.data && response.data.data.length > 0) {
      // Prefer city codes over airport codes
      const city = response.data.data.find(loc => loc.subType === 'CITY');
      return city?.iataCode || response.data.data[0].iataCode;
    }

    throw new Error(`No IATA code found for: ${cityName}`);
  } catch (error) {
    console.error('Amadeus city code error:', error.response?.data || error.message);
    throw new Error(`Failed to get city code for: ${cityName}`);
  }
};

// Export all functions
export const amadeusService = {
  getAccessToken,
  searchFlights,
  searchHotels,
  getHotelRatings,
  getCityCode,
};

export default amadeusService;
