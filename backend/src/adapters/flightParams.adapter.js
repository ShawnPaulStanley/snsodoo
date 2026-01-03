/**
 * FLIGHT PARAMETERS ADAPTER
 * 
 * Purpose: Converts a RecommendationProfile into flight search parameters
 * for Amadeus Flight API, Skyscanner, etc.
 * 
 * Architecture Decision:
 * - Translates theme-based preferences into flight search criteria
 * - Different themes prioritize different things:
 *   - Budget: cheapest flights, layovers OK
 *   - Deluxe: balance of price and comfort
 *   - Luxurious: business/first class, direct flights
 */

class FlightParamsAdapter {
  /**
   * Convert RecommendationProfile to Amadeus Flight API parameters
   * 
   * @param {Object} profile - The recommendation profile
   * @param {Object} searchContext - Flight search parameters (origin, destination, dates, passengers)
   * @returns {Object} API-ready parameters for Amadeus Flight API
   */
  toAmadeusParams(profile, searchContext) {
    const { origin, destination, departureDate, returnDate, passengers } = searchContext;
    const { transportPreferences, budgetRange, subTheme } = profile;

    return {
      // Route parameters
      originLocationCode: origin, // e.g., 'JFK'
      destinationLocationCode: destination, // e.g., 'LAX'
      departureDate, // YYYY-MM-DD
      returnDate, // YYYY-MM-DD (optional for one-way)
      
      // Passenger parameters
      adults: passengers.adults || 1,
      children: passengers.children || 0,
      infants: passengers.infants || 0,
      
      // Cabin class (based on subTheme)
      travelClass: this._determineCabinClass(subTheme, transportPreferences),
      
      // Flight preferences
      nonStop: this._determineNonStopPreference(transportPreferences),
      maxPrice: budgetRange.max,
      currencyCode: 'USD',
      
      // Number of results
      max: 20,
    };
  }

  /**
   * Rank and filter flight results based on profile
   * 
   * @param {Array} flights - Raw flight results from API
   * @param {Object} profile - Recommendation profile
   * @returns {Array} Ranked and filtered flights
   */
  rankFlights(flights, profile) {
    const { rankingWeights, budgetRange, transportPreferences } = profile;

    return flights
      // Filter by budget
      .filter(flight => {
        const price = flight.price?.total || 0;
        return price <= budgetRange.max;
      })
      // Calculate composite score
      .map(flight => ({
        ...flight,
        score: this._calculateFlightScore(flight, rankingWeights, transportPreferences),
      }))
      // Sort by score
      .sort((a, b) => b.score - a.score)
      // Take top results
      .slice(0, 10);
  }

  /**
   * PRIVATE HELPERS
   */

  _determineCabinClass(subTheme, transportPreferences) {
    const comfortLevel = transportPreferences.comfortLevel;

    if (comfortLevel === 'luxury' || subTheme === 'luxurious') {
      return 'BUSINESS'; // or 'FIRST' for ultra-luxury
    }
    
    if (comfortLevel === 'comfort' || subTheme === 'deluxe') {
      return 'PREMIUM_ECONOMY';
    }
    
    return 'ECONOMY';
  }

  _determineNonStopPreference(transportPreferences) {
    // Luxury/business travelers prefer direct flights
    if (transportPreferences.prioritize === 'time' || 
        transportPreferences.prioritize === 'exclusivity') {
      return true;
    }
    
    // Budget travelers are OK with layovers
    if (transportPreferences.prioritize === 'cost') {
      return false;
    }
    
    return false; // Default to more options
  }

  _calculateFlightScore(flight, weights, transportPreferences) {
    // Normalize price (inverse: lower is better, assume max $2000)
    const priceScore = flight.price?.total ? (2000 - flight.price.total) / 2000 : 0;
    
    // Duration score (inverse: shorter is better, assume max 24 hours)
    const durationMinutes = this._parseDuration(flight.duration);
    const durationScore = durationMinutes ? (1440 - durationMinutes) / 1440 : 0;
    
    // Layover penalty
    const layoverPenalty = flight.segments?.length > 1 ? 0.2 : 0;
    
    // Cabin class bonus
    const cabinBonus = this._getCabinBonus(flight.travelClass);

    // Weighted sum
    const baseScore = (
      priceScore * weights.price +
      durationScore * (weights.rating || 0.3) // Using rating weight as quality proxy
    );

    return baseScore + cabinBonus - layoverPenalty;
  }

  _parseDuration(duration) {
    // Parse ISO 8601 duration like "PT5H30M" -> 330 minutes
    if (!duration) return null;
    
    const match = duration.match(/PT(\d+H)?(\d+M)?/);
    if (!match) return null;
    
    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    
    return hours * 60 + minutes;
  }

  _getCabinBonus(travelClass) {
    const bonusMap = {
      'ECONOMY': 0,
      'PREMIUM_ECONOMY': 0.1,
      'BUSINESS': 0.2,
      'FIRST': 0.3,
    };
    return bonusMap[travelClass] || 0;
  }
}

export default new FlightParamsAdapter();
