/**
 * FOOD/RESTAURANT PARAMETERS ADAPTER
 * 
 * Purpose: Converts a RecommendationProfile into restaurant search parameters
 * for Yelp Fusion API, Google Places API, etc.
 * 
 * Architecture Decision:
 * - Different themes have different food preferences
 * - Beach: seafood, casual dining
 * - Business: fast options near business districts
 * - Family: kid-friendly restaurants
 * - Nature/Wellness: organic, vegan, healthy options
 */

class FoodParamsAdapter {
  /**
   * Convert RecommendationProfile to Yelp Fusion API parameters
   * 
   * @param {Object} profile - The recommendation profile
   * @param {Object} searchContext - Search parameters (location, radius)
   * @returns {Object} API-ready parameters for Yelp Fusion API
   */
  toYelpParams(profile, searchContext) {
    const { location } = searchContext;
    const { restaurantPreferences } = profile;

    return {
      // Location parameters
      latitude: location.latitude,
      longitude: location.longitude,
      radius: restaurantPreferences.distanceMax || 5000, // meters
      
      // Categories (based on cuisine types)
      categories: this._convertCuisineToYelpCategories(restaurantPreferences.cuisineTypes),
      
      // Price filter (Yelp uses 1-4 scale: $, $$, $$$, $$$$)
      price: this._convertPriceLevelToYelp(restaurantPreferences.priceLevel),
      
      // Sorting
      sort_by: 'rating', // or 'distance' or 'review_count'
      
      // Filters
      open_now: true, // Only show restaurants that are currently open
      
      // Result limits
      limit: 20,
    };
  }

  /**
   * Convert RecommendationProfile to Google Places API parameters
   * 
   * @param {Object} profile 
   * @param {Object} searchContext 
   * @returns {Object}
   */
  toGooglePlacesParams(profile, searchContext) {
    const { location } = searchContext;
    const { restaurantPreferences } = profile;

    return {
      // Location parameters
      location: `${location.latitude},${location.longitude}`,
      radius: restaurantPreferences.distanceMax || 5000,
      type: 'restaurant',
      
      // Keywords based on cuisine
      keyword: restaurantPreferences.cuisineTypes.join(' OR '),
      
      // Price level (Google uses 0-4 scale)
      minprice: restaurantPreferences.priceLevel.min || 0,
      maxprice: restaurantPreferences.priceLevel.max || 4,
      
      // Only highly rated
      opennow: true,
    };
  }

  /**
   * Rank and filter restaurant results based on profile
   * 
   * @param {Array} restaurants - Raw restaurant results from API
   * @param {Object} profile - Recommendation profile
   * @returns {Array} Ranked and filtered restaurants
   */
  rankRestaurants(restaurants, profile) {
    const { rankingWeights, restaurantPreferences } = profile;

    return restaurants
      // Filter by price level
      .filter(restaurant => {
        const price = restaurant.price_level || 2;
        return price >= restaurantPreferences.priceLevel.min && 
               price <= restaurantPreferences.priceLevel.max;
      })
      // Calculate composite score
      .map(restaurant => ({
        ...restaurant,
        score: this._calculateRestaurantScore(restaurant, rankingWeights),
      }))
      // Sort by score
      .sort((a, b) => b.score - a.score)
      // Take top results
      .slice(0, 10);
  }

  /**
   * PRIVATE HELPERS
   */

  _convertCuisineToYelpCategories(cuisineTypes) {
    if (!cuisineTypes || cuisineTypes.length === 0) {
      return ['restaurants'];
    }

    // Mapping from our generic cuisine types to Yelp categories
    const cuisineMap = {
      'seafood': 'seafood',
      'local': 'local_flavor',
      'casual': 'restaurants',
      'fine_dining': 'fine_dining',
      'international': 'international',
      'vegan': 'vegan',
      'organic': 'organic',
      'healthy': 'healthyeating',
      'fast_casual': 'fast_food',
      'cafe': 'cafes',
      'michelin_star': 'fine_dining',
      'business_lunch': 'restaurants',
      'kids_menu': 'family_friendly',
      'family_friendly': 'family_friendly',
    };

    return cuisineTypes
      .map(cuisine => cuisineMap[cuisine] || cuisine)
      .filter(Boolean);
  }

  _convertPriceLevelToYelp(priceLevel) {
    if (!priceLevel) return '1,2,3,4';
    
    // Yelp uses 1-4 (matching our scale)
    const levels = [];
    for (let i = priceLevel.min; i <= priceLevel.max; i++) {
      levels.push(i);
    }
    return levels.join(',');
  }

  _calculateRestaurantScore(restaurant, weights) {
    // Normalize price (inverse: lower is better on 1-4 scale)
    const priceScore = restaurant.price_level ? (5 - restaurant.price_level) / 4 : 0.5;
    
    // Normalize rating (0-5 scale)
    const ratingScore = (restaurant.rating || 0) / 5;
    
    // Normalize distance (inverse: closer is better, assume max 10km)
    const distanceScore = restaurant.distance ? (10000 - restaurant.distance) / 10000 : 0;
    
    // Review count bonus (more reviews = more reliable)
    const reviewBonus = Math.min((restaurant.review_count || 0) / 500, 0.2);

    // Weighted sum
    return (
      priceScore * weights.price +
      ratingScore * weights.rating +
      distanceScore * weights.distance +
      reviewBonus
    );
  }
}

export default new FoodParamsAdapter();
