/**
 * HOTEL PARAMETERS ADAPTER
 * 
 * Purpose: Converts a RecommendationProfile into API-specific parameters
 * for hotel search APIs (Amadeus, Booking.com, etc.)
 * 
 * Architecture Decision:
 * - The API service does NOT know about themes
 * - The API service receives ONLY technical parameters
 * - THIS adapter does the translation
 * - Makes it easy to swap APIs without touching business logic
 * 
 * Example Flow:
 * 1. Controller gets profile from ThemeResolver
 * 2. Controller passes profile to THIS adapter
 * 3. Adapter outputs API-ready params
 * 4. Controller passes params to HotelService
 * 5. HotelService makes the API call
 */

class HotelParamsAdapter {
  /**
   * Convert RecommendationProfile to Amadeus Hotel API parameters
   * 
   * @param {Object} profile - The recommendation profile
   * @param {Object} searchContext - User's search parameters (location, dates, guests)
   * @returns {Object} API-ready parameters for Amadeus Hotel API
   */
  toAmadeusParams(profile, searchContext) {
    const { location, checkIn, checkOut, guests } = searchContext;
    const { hotelPreferences, budgetRange } = profile;

    return {
      // Location parameters
      cityCode: location.cityCode, // e.g., 'NYC'
      latitude: location.latitude,
      longitude: location.longitude,
      radius: hotelPreferences.distanceToBeach?.max || 
              hotelPreferences.distanceToCenter?.max || 
              hotelPreferences.distanceToAttractions?.max || 
              5000, // default 5km
      radiusUnit: 'M', // Meters

      // Date parameters
      checkInDate: checkIn, // YYYY-MM-DD
      checkOutDate: checkOut,

      // Guest parameters
      adults: guests.adults || 2,
      children: guests.children || 0,
      rooms: guests.rooms || 1,

      // Quality filters (from profile)
      ratings: this._convertStarRating(hotelPreferences.starRating),
      
      // Amenities (from profile)
      amenities: this._convertAmenities(hotelPreferences.amenities),

      // Budget filters
      priceRange: `${budgetRange.min}-${budgetRange.max}`,
      currency: 'USD',

      // Sorting
      sortBy: this._determineSorting(profile.rankingWeights),

      // Result limits
      limit: 20,
    };
  }

  /**
   * Convert RecommendationProfile to Booking.com API parameters
   * (Alternative API, same pattern)
   * 
   * @param {Object} profile 
   * @param {Object} searchContext 
   * @returns {Object}
   */
  toBookingParams(profile, searchContext) {
    const { location, checkIn, checkOut, guests } = searchContext;
    const { hotelPreferences, budgetRange } = profile;

    return {
      dest_id: location.destId,
      dest_type: 'city',
      checkin_date: checkIn,
      checkout_date: checkOut,
      adults_number: guests.adults || 2,
      children_number: guests.children || 0,
      room_number: guests.rooms || 1,
      
      // Star rating filter
      nflt: `class=${hotelPreferences.starRating.min}-${hotelPreferences.starRating.max}`,
      
      // Price filter
      price_min: budgetRange.min,
      price_max: budgetRange.max,
      
      // Sorting
      order_by: this._determineBookingSorting(profile.rankingWeights),
      
      // Filters
      filter_by_amenities: this._convertAmenitiesToBooking(hotelPreferences.amenities),
    };
  }

  /**
   * PRIVATE HELPERS
   * These translate profile values to API-specific formats
   */

  _convertStarRating(starRating) {
    if (!starRating) return [2, 3, 4, 5];
    
    const ratings = [];
    for (let i = Math.floor(starRating.min); i <= Math.ceil(starRating.max); i++) {
      ratings.push(i);
    }
    return ratings;
  }

  _convertAmenities(amenities) {
    if (!amenities) return [];
    
    // Mapping from our generic amenity names to Amadeus codes
    const amenityMap = {
      'wifi': 'WIFI',
      'pool': 'SWIMMING_POOL',
      'spa': 'SPA',
      'gym': 'FITNESS_CENTER',
      'restaurant': 'RESTAURANT',
      'beach_access': 'BEACH',
      'business_center': 'BUSINESS_CENTER',
      'meeting_rooms': 'MEETING_ROOMS',
      'kids_club': 'KIDS_CLUB',
      'parking': 'PARKING',
    };

    return amenities
      .map(amenity => amenityMap[amenity])
      .filter(Boolean); // Remove unmapped amenities
  }

  _convertAmenitiesToBooking(amenities) {
    if (!amenities) return [];
    
    // Booking.com uses different codes
    const amenityMap = {
      'wifi': 'free_wifi',
      'pool': 'swimming_pool',
      'spa': 'spa',
      'gym': 'fitness_center',
      'restaurant': 'restaurant',
      'beach_access': 'beach_front',
      'parking': 'free_parking',
    };

    return amenities
      .map(amenity => amenityMap[amenity])
      .filter(Boolean);
  }

  _determineSorting(rankingWeights) {
    // Determine primary sort based on highest weight
    const weights = [
      { key: 'price', value: rankingWeights.price, sort: 'PRICE' },
      { key: 'rating', value: rankingWeights.rating, sort: 'RATING' },
      { key: 'distance', value: rankingWeights.distance, sort: 'DISTANCE' },
    ];

    weights.sort((a, b) => b.value - a.value);
    return weights[0].sort;
  }

  _determineBookingSorting(rankingWeights) {
    const weights = [
      { key: 'price', value: rankingWeights.price, sort: 'price' },
      { key: 'rating', value: rankingWeights.rating, sort: 'review_score' },
      { key: 'distance', value: rankingWeights.distance, sort: 'distance' },
    ];

    weights.sort((a, b) => b.value - a.value);
    return weights[0].sort;
  }

  /**
   * Rank and filter hotel results based on profile weights
   * This runs AFTER getting API results
   * 
   * @param {Array} hotels - Raw hotel results from API
   * @param {Object} profile - Recommendation profile
   * @returns {Array} Ranked and filtered hotels
   */
  rankHotels(hotels, profile) {
    const { rankingWeights, budgetRange, hotelPreferences } = profile;

    return hotels
      // Filter by budget
      .filter(hotel => {
        const price = hotel.price?.total || 0;
        return price >= budgetRange.min && price <= budgetRange.max;
      })
      // Filter by star rating
      .filter(hotel => {
        const stars = hotel.rating || 0;
        return stars >= hotelPreferences.starRating.min && 
               stars <= hotelPreferences.starRating.max;
      })
      // Calculate composite score
      .map(hotel => ({
        ...hotel,
        score: this._calculateHotelScore(hotel, rankingWeights),
      }))
      // Sort by score
      .sort((a, b) => b.score - a.score)
      // Take top results
      .slice(0, 10);
  }

  _calculateHotelScore(hotel, weights) {
    // Normalize price (inverse: lower is better)
    const priceScore = hotel.price?.total ? (1000 - hotel.price.total) / 1000 : 0;
    
    // Normalize rating (0-5 scale)
    const ratingScore = (hotel.rating || 0) / 5;
    
    // Normalize distance (inverse: closer is better, assume max 10km)
    const distanceScore = hotel.distance ? (10000 - hotel.distance) / 10000 : 0;

    // Weighted sum
    return (
      priceScore * weights.price +
      ratingScore * weights.rating +
      distanceScore * weights.distance
    );
  }
}

export default new HotelParamsAdapter();
