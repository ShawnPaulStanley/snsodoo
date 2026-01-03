/**
 * FOOD/RESTAURANT SERVICE
 * 
 * Purpose: Handles all restaurant-related API calls.
 * Theme-agnostic - only knows about API parameters.
 * 
 * In production, would integrate with:
 * - Yelp Fusion API
 * - Google Places API
 * - TripAdvisor API
 */

import apiClient from '../utils/apiClient.js';

class FoodService {
  /**
   * Search for restaurants
   * 
   * @param {Object} params - API-ready parameters from FoodParamsAdapter
   * @returns {Promise<Array>} List of restaurants
   */
  async searchRestaurants(params) {
    try {
      // In production:
      // const response = await apiClient.get('https://api.yelp.com/v3/businesses/search', { 
      //   params,
      //   headers: { 'Authorization': `Bearer ${process.env.YELP_API_KEY}` }
      // });
      // return response.data.businesses;

      return this._getMockedRestaurants(params);
    } catch (error) {
      console.error('Error fetching restaurants:', error.message);
      throw new Error('Failed to fetch restaurants');
    }
  }

  /**
   * Get restaurant details by ID
   * 
   * @param {string} restaurantId 
   * @returns {Promise<Object>}
   */
  async getRestaurantDetails(restaurantId) {
    try {
      return this._getMockedRestaurantDetails(restaurantId);
    } catch (error) {
      console.error('Error fetching restaurant details:', error.message);
      throw new Error('Failed to fetch restaurant details');
    }
  }

  /**
   * PRIVATE: Mocked data
   */
  _getMockedRestaurants(params) {
    const restaurants = [];
    const count = params.limit || 15;

    for (let i = 0; i < count; i++) {
      const priceLevel = this._parsePriceLevel(params.price);
      
      restaurants.push({
        id: `RESTAURANT_${i + 1}`,
        name: this._generateRestaurantName(params.categories),
        rating: (Math.random() * 1.5 + 3.5).toFixed(1), // 3.5-5.0
        price_level: priceLevel,
        distance: Math.floor(Math.random() * (params.radius || 5000)),
        location: {
          latitude: params.latitude + (Math.random() - 0.5) * 0.05,
          longitude: params.longitude + (Math.random() - 0.5) * 0.05,
          address: `${i + 100} Main Street`,
        },
        cuisineTypes: params.categories || ['restaurants'],
        review_count: Math.floor(Math.random() * 500) + 50,
        open_now: params.open_now !== false,
        image_url: `https://via.placeholder.com/400x300?text=Restaurant+${i + 1}`,
      });
    }

    return restaurants;
  }

  _getMockedRestaurantDetails(restaurantId) {
    return {
      id: restaurantId,
      name: 'The Seafood Shack',
      rating: 4.5,
      price_level: 2,
      location: {
        latitude: 25.7617,
        longitude: -80.1918,
        address: '456 Ocean Drive, Miami Beach, FL',
      },
      cuisineTypes: ['seafood', 'american'],
      phone: '+1-305-555-0123',
      website: 'https://example.com',
      hours: [
        { day: 'Monday', hours: '11:00 AM - 10:00 PM' },
        { day: 'Tuesday', hours: '11:00 AM - 10:00 PM' },
        { day: 'Wednesday', hours: '11:00 AM - 10:00 PM' },
        { day: 'Thursday', hours: '11:00 AM - 11:00 PM' },
        { day: 'Friday', hours: '11:00 AM - 11:00 PM' },
        { day: 'Saturday', hours: '10:00 AM - 11:00 PM' },
        { day: 'Sunday', hours: '10:00 AM - 10:00 PM' },
      ],
      menu_url: 'https://example.com/menu',
      photos: [
        'https://via.placeholder.com/800x600?text=Restaurant+Exterior',
        'https://via.placeholder.com/800x600?text=Interior',
        'https://via.placeholder.com/800x600?text=Food',
      ],
      reviews: [
        {
          rating: 5,
          text: 'Best seafood in town! Fresh and delicious.',
          author: 'Emily R.',
          date: '2026-01-02',
        },
        {
          rating: 4,
          text: 'Great atmosphere and service.',
          author: 'Michael T.',
          date: '2025-12-28',
        },
      ],
      popular_dishes: ['Grilled Salmon', 'Lobster Roll', 'Fish Tacos'],
    };
  }

  _generateRestaurantName(categories) {
    const prefixes = ['The', 'Casa', 'Blue', 'Golden', 'Ocean', 'Garden', 'Royal'];
    const types = ['Grill', 'Bistro', 'Kitchen', 'House', 'Restaurant', 'Cafe', 'Eatery'];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    
    return `${prefix} ${type}`;
  }

  _parsePriceLevel(priceString) {
    if (!priceString) return 2;
    
    // Parse "1,2,3" -> return middle value
    const levels = priceString.split(',').map(Number);
    return levels[Math.floor(levels.length / 2)] || 2;
  }
}

export default new FoodService();
