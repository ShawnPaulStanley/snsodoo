/**
 * HOTEL SERVICE
 * 
 * Purpose: Handles all hotel-related API calls.
 * This service is THEME-AGNOSTIC. It only knows about API parameters.
 * 
 * Architecture Decision:
 * - Receives API-ready parameters (from adapter)
 * - Makes external API calls (or returns mocked data for now)
 * - Returns raw results
 * - Does NOT apply theme-specific logic
 * 
 * This makes it easy to:
 * - Swap APIs (Amadeus -> Booking.com)
 * - Add caching
 * - Add rate limiting
 * - Add error handling
 * - Mock for testing
 */

import apiClient from '../utils/apiClient.js';

class HotelService {
  /**
   * Search for hotels using Amadeus API
   * 
   * @param {Object} params - API-ready parameters from HotelParamsAdapter
   * @returns {Promise<Array>} List of hotels
   */
  async searchHotels(params) {
    try {
      // In production, this would call the real Amadeus API:
      // const response = await apiClient.get('https://api.amadeus.com/v2/shopping/hotel-offers', { params });
      // return response.data.data;

      // For now, return mocked data
      return this._getMockedHotels(params);
    } catch (error) {
      console.error('Error fetching hotels:', error.message);
      throw new Error('Failed to fetch hotels');
    }
  }

  /**
   * Get details for a specific hotel
   * 
   * @param {string} hotelId 
   * @returns {Promise<Object>} Hotel details
   */
  async getHotelDetails(hotelId) {
    try {
      // In production:
      // const response = await apiClient.get(`https://api.amadeus.com/v2/shopping/hotel-offers/${hotelId}`);
      // return response.data.data;

      return this._getMockedHotelDetails(hotelId);
    } catch (error) {
      console.error('Error fetching hotel details:', error.message);
      throw new Error('Failed to fetch hotel details');
    }
  }

  /**
   * PRIVATE: Mocked data for development/testing
   */
  _getMockedHotels(params) {
    // Generate realistic mock data based on parameters
    const hotels = [];
    const count = params.limit || 10;

    for (let i = 0; i < count; i++) {
      hotels.push({
        id: `HOTEL_${i + 1}`,
        name: this._generateHotelName(params.ratings?.[0] || 3),
        rating: params.ratings?.[0] || Math.floor(Math.random() * 2) + 3,
        price: {
          total: this._generatePrice(params.priceRange),
          currency: params.currency || 'USD',
        },
        distance: Math.floor(Math.random() * (params.radius || 5000)),
        location: {
          latitude: params.latitude + (Math.random() - 0.5) * 0.1,
          longitude: params.longitude + (Math.random() - 0.5) * 0.1,
          address: `${i + 1} Beach Road, ${params.cityCode || 'City'}`,
        },
        amenities: params.amenities || ['WIFI', 'SWIMMING_POOL'],
        description: 'Beautiful hotel with excellent service and amenities.',
        images: [
          `https://via.placeholder.com/400x300?text=Hotel+${i + 1}`,
        ],
        available: true,
        checkIn: params.checkInDate,
        checkOut: params.checkOutDate,
      });
    }

    return hotels;
  }

  _getMockedHotelDetails(hotelId) {
    return {
      id: hotelId,
      name: 'Luxury Beach Resort',
      rating: 4.5,
      price: {
        total: 350,
        currency: 'USD',
      },
      location: {
        latitude: 25.7617,
        longitude: -80.1918,
        address: '123 Ocean Drive, Miami Beach, FL',
      },
      amenities: ['WIFI', 'SWIMMING_POOL', 'SPA', 'BEACH', 'RESTAURANT', 'GYM'],
      description: 'A stunning beachfront resort with world-class amenities and service.',
      images: [
        'https://via.placeholder.com/800x600?text=Hotel+Exterior',
        'https://via.placeholder.com/800x600?text=Hotel+Pool',
        'https://via.placeholder.com/800x600?text=Hotel+Room',
      ],
      rooms: [
        {
          type: 'Standard Room',
          price: 250,
          available: true,
        },
        {
          type: 'Deluxe Ocean View',
          price: 350,
          available: true,
        },
        {
          type: 'Presidential Suite',
          price: 800,
          available: false,
        },
      ],
      reviews: [
        {
          rating: 5,
          comment: 'Amazing stay! The beach access was perfect.',
          author: 'John D.',
          date: '2025-12-20',
        },
        {
          rating: 4,
          comment: 'Great hotel, but a bit pricey.',
          author: 'Sarah M.',
          date: '2025-12-15',
        },
      ],
    };
  }

  _generateHotelName(starRating) {
    const prefixes = ['Ocean', 'Sunset', 'Paradise', 'Grand', 'Royal', 'Beach', 'Palm', 'Vista'];
    const types = ['Hotel', 'Resort', 'Inn', 'Lodge', 'Suites'];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    
    if (starRating >= 5) return `The ${prefix} Grand ${type}`;
    if (starRating >= 4) return `${prefix} ${type} & Spa`;
    return `${prefix} ${type}`;
  }

  _generatePrice(priceRange) {
    if (!priceRange) return Math.floor(Math.random() * 300) + 100;
    
    const [min, max] = priceRange.split('-').map(Number);
    return Math.floor(Math.random() * (max - min)) + min;
  }
}

export default new HotelService();
