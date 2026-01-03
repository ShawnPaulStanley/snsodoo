/**
 * Amadeus Service
 * Handles flight and hotel searches via Amadeus Travel API
 */

import axios from 'axios';
import { env } from '../config/env.js';
import logger from '../utils/logger.new.js';
import { ExternalApiError } from '../utils/errorHandler.js';

const AMADEUS_URL = env.amadeusApiUrl;
const CLIENT_ID = env.amadeusClientId;
const CLIENT_SECRET = env.amadeusClientSecret;

let accessToken = null;
let tokenExpiry = null;

/**
 * Get OAuth2 access token
 */
const getAccessToken = async () => {
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    logger.debug('Refreshing Amadeus access token');

    const response = await axios.post(
      `${AMADEUS_URL}/v1/security/oauth2/token`,
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
    tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;

    logger.info('Amadeus token refreshed successfully');
    return accessToken;
  } catch (error) {
    logger.error('Failed to get Amadeus token', { error: error.message });
    throw new ExternalApiError('Amadeus', 'Authentication failed');
  }
};

/**
 * Create authenticated axios instance
 */
const getAmadeusClient = async () => {
  const token = await getAccessToken();

  return axios.create({
    baseURL: AMADEUS_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  });
};

/**
 * Search for flights
 */
const searchFlights = async (params) => {
  const {
    originCity,
    destinationCity,
    departureDate,
    returnDate,
    adults = 1,
    travelClass = 'ECONOMY',
    maxResults = 5,
  } = params;

  try {
    logger.info('Searching flights', { originCity, destinationCity, departureDate });

    const client = await getAmadeusClient();
    const startTime = Date.now();

    // First, get airport codes for cities
    const [originAirport, destAirport] = await Promise.all([
      getAirportCode(originCity, client),
      getAirportCode(destinationCity, client),
    ]);

    if (!originAirport || !destAirport) {
      logger.warn('Could not find airports', { originCity, destinationCity });
      return { flights: [], message: 'Could not find airports for specified cities' };
    }

    const searchParams = {
      originLocationCode: originAirport,
      destinationLocationCode: destAirport,
      departureDate,
      adults,
      travelClass,
      max: maxResults,
      currencyCode: 'USD',
    };

    if (returnDate) {
      searchParams.returnDate = returnDate;
    }

    const response = await client.get('/v2/shopping/flight-offers', {
      params: searchParams,
    });

    const duration = Date.now() - startTime;
    logger.logApiCall('Amadeus', '/flight-offers', true, duration);

    const flights = response.data.data?.map((offer) => ({
      id: offer.id,
      price: {
        total: parseFloat(offer.price.total),
        currency: offer.price.currency,
      },
      itineraries: offer.itineraries.map((itin) => ({
        duration: itin.duration,
        segments: itin.segments.map((seg) => ({
          departure: {
            airport: seg.departure.iataCode,
            time: seg.departure.at,
          },
          arrival: {
            airport: seg.arrival.iataCode,
            time: seg.arrival.at,
          },
          carrier: seg.carrierCode,
          flightNumber: `${seg.carrierCode}${seg.number}`,
          duration: seg.duration,
        })),
      })),
      travelClass,
      bookingClass: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.class,
    })) || [];

    return {
      flights,
      origin: originAirport,
      destination: destAirport,
    };
  } catch (error) {
    logger.error('Flight search error', { error: error.message });

    if (error.response?.status === 400) {
      return { flights: [], message: 'No flights found for specified criteria' };
    }

    throw new ExternalApiError('Amadeus', 'Flight search failed', error.response?.data);
  }
};

/**
 * Get airport code for a city
 */
const getAirportCode = async (cityName, client = null) => {
  try {
    const amadeusClient = client || (await getAmadeusClient());

    const response = await amadeusClient.get('/v1/reference-data/locations', {
      params: {
        keyword: cityName,
        subType: 'AIRPORT,CITY',
        'page[limit]': 1,
      },
    });

    const location = response.data.data?.[0];
    return location?.iataCode || null;
  } catch (error) {
    logger.warn('Could not find airport code', { cityName, error: error.message });
    return null;
  }
};

/**
 * Search for hotels
 */
const searchHotels = async (params) => {
  const {
    cityCode,
    checkInDate,
    checkOutDate,
    adults = 1,
    roomQuantity = 1,
    ratings = ['3', '4', '5'],
    maxResults = 10,
  } = params;

  try {
    logger.info('Searching hotels', { cityCode, checkInDate });

    const client = await getAmadeusClient();
    const startTime = Date.now();

    // First, get hotels by city
    const hotelListResponse = await client.get('/v1/reference-data/locations/hotels/by-city', {
      params: {
        cityCode,
        radius: 30,
        radiusUnit: 'KM',
        hotelSource: 'ALL',
      },
    });

    const hotelIds = hotelListResponse.data.data
      ?.slice(0, 20)
      .map((h) => h.hotelId);

    if (!hotelIds || hotelIds.length === 0) {
      return { hotels: [], message: 'No hotels found in this city' };
    }

    // Get offers for these hotels
    const offersResponse = await client.get('/v3/shopping/hotel-offers', {
      params: {
        hotelIds: hotelIds.join(','),
        checkInDate,
        checkOutDate,
        adults,
        roomQuantity,
        currency: 'USD',
      },
    });

    const duration = Date.now() - startTime;
    logger.logApiCall('Amadeus', '/hotel-offers', true, duration);

    const hotels = offersResponse.data.data?.map((hotel) => ({
      id: hotel.hotel.hotelId,
      name: hotel.hotel.name,
      rating: hotel.hotel.rating,
      address: hotel.hotel.address,
      coordinates: hotel.hotel.latitude
        ? {
            latitude: hotel.hotel.latitude,
            longitude: hotel.hotel.longitude,
          }
        : null,
      offers: hotel.offers?.slice(0, 3).map((offer) => ({
        id: offer.id,
        price: {
          total: parseFloat(offer.price.total),
          currency: offer.price.currency,
        },
        room: {
          type: offer.room?.typeEstimated?.category,
          beds: offer.room?.typeEstimated?.beds,
          bedType: offer.room?.typeEstimated?.bedType,
        },
        policies: {
          cancellation: offer.policies?.cancellation?.description?.text,
        },
      })),
    })) || [];

    return {
      hotels: hotels.slice(0, maxResults),
      cityCode,
    };
  } catch (error) {
    logger.error('Hotel search error', { error: error.message });

    if (error.response?.status === 400) {
      return { hotels: [], message: 'No hotels found for specified criteria' };
    }

    throw new ExternalApiError('Amadeus', 'Hotel search failed', error.response?.data);
  }
};

/**
 * Search hotels by coordinates
 */
const searchHotelsByLocation = async (latitude, longitude, params = {}) => {
  const {
    checkInDate,
    checkOutDate,
    radius = 5,
    adults = 1,
    maxResults = 10,
  } = params;

  try {
    const client = await getAmadeusClient();

    const response = await client.get('/v1/reference-data/locations/hotels/by-geocode', {
      params: {
        latitude,
        longitude,
        radius,
        radiusUnit: 'KM',
        hotelSource: 'ALL',
      },
    });

    const hotels = response.data.data?.slice(0, maxResults).map((hotel) => ({
      id: hotel.hotelId,
      name: hotel.name,
      distance: hotel.distance?.value,
      distanceUnit: hotel.distance?.unit,
      coordinates: {
        latitude: hotel.geoCode?.latitude,
        longitude: hotel.geoCode?.longitude,
      },
    }));

    return { hotels: hotels || [] };
  } catch (error) {
    logger.error('Hotel location search error', { error: error.message });
    return { hotels: [] };
  }
};

/**
 * Validate Amadeus connection
 */
const validateConnection = async () => {
  try {
    await getAccessToken();
    return { connected: true };
  } catch (error) {
    return { connected: false, error: error.message };
  }
};

export default {
  searchFlights,
  searchHotels,
  searchHotelsByLocation,
  getAirportCode,
  validateConnection,
};
