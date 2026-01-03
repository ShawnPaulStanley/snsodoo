/**
 * TRANSPORT PARAMETERS ADAPTER
 * 
 * Purpose: Converts a RecommendationProfile into local transport search parameters
 * for Rome2Rio API, RentalCars API, etc.
 * 
 * Architecture Decision:
 * - Different themes need different transport modes
 * - Budget: public transport, shared rides
 * - Deluxe: private cars, comfortable options
 * - Luxurious: limousines, private transfers
 */

class TransportParamsAdapter {
  /**
   * Convert RecommendationProfile to Rome2Rio API parameters
   * (Multi-modal transport routing)
   * 
   * @param {Object} profile - The recommendation profile
   * @param {Object} searchContext - Search parameters (origin, destination)
   * @returns {Object} API-ready parameters for Rome2Rio API
   */
  toRome2RioParams(profile, searchContext) {
    const { origin, destination } = searchContext;
    const { transportPreferences } = profile;

    return {
      // Route parameters
      oName: origin.name, // Origin place name
      dName: destination.name, // Destination place name
      oPos: `${origin.latitude},${origin.longitude}`,
      dPos: `${destination.latitude},${destination.longitude}`,
      
      // Transport mode filters
      flags: this._convertTransportModes(transportPreferences.preferredModes),
      
      // Currency
      currencyCode: 'USD',
      
      // Language
      languageCode: 'en',
    };
  }

  /**
   * Convert RecommendationProfile to RentalCars API parameters
   * 
   * @param {Object} profile 
   * @param {Object} searchContext 
   * @returns {Object}
   */
  toRentalCarsParams(profile, searchContext) {
    const { location, pickupDate, dropoffDate } = searchContext;
    const { transportPreferences, budgetRange } = profile;

    return {
      // Location parameters
      pickupLocation: location.code, // IATA code or lat/lng
      dropoffLocation: location.code,
      
      // Date parameters
      pickupDate, // YYYY-MM-DD HH:mm
      dropoffDate,
      
      // Vehicle preferences (based on comfort level)
      vehicleCategory: this._determineVehicleCategory(transportPreferences.comfortLevel),
      
      // Price filters
      maxPrice: budgetRange.max / 10, // Rough daily rate
      currency: 'USD',
      
      // Filters
      airConditioned: true,
      automaticTransmission: transportPreferences.comfortLevel !== 'economy',
      
      // Result limits
      limit: 20,
    };
  }

  /**
   * Rank and filter transport results based on profile
   * 
   * @param {Array} transportOptions - Raw transport results from API
   * @param {Object} profile - Recommendation profile
   * @returns {Array} Ranked and filtered transport options
   */
  rankTransportOptions(transportOptions, profile) {
    const { rankingWeights, transportPreferences } = profile;

    return transportOptions
      // Filter by preferred modes
      .filter(option => {
        return transportPreferences.preferredModes.some(mode => 
          this._matchesMode(option.mode, mode)
        );
      })
      // Calculate composite score
      .map(option => ({
        ...option,
        score: this._calculateTransportScore(option, rankingWeights, transportPreferences),
      }))
      // Sort by score
      .sort((a, b) => b.score - a.score)
      // Take top results
      .slice(0, 10);
  }

  /**
   * PRIVATE HELPERS
   */

  _convertTransportModes(preferredModes) {
    // Rome2Rio flags bitmap
    // This is a simplified version; actual API uses complex flags
    const modeFlags = {
      'public_transport': 1,
      'walk': 2,
      'taxi': 4,
      'private_car': 8,
      'shared_rides': 1,
      'rental_car': 8,
      'bicycle': 2,
      'limousine': 4,
      'helicopter': 16,
    };

    let flags = 0;
    preferredModes.forEach(mode => {
      flags |= modeFlags[mode] || 0;
    });

    return flags;
  }

  _determineVehicleCategory(comfortLevel) {
    const categoryMap = {
      'economy': 'ECONOMY',
      'comfort': 'STANDARD',
      'luxury': 'LUXURY',
    };
    return categoryMap[comfortLevel] || 'ECONOMY';
  }

  _matchesMode(optionMode, preferredMode) {
    // Fuzzy matching between API mode names and our generic modes
    const modeAliases = {
      'public_transport': ['bus', 'train', 'metro', 'subway', 'tram'],
      'walk': ['walk', 'walking'],
      'taxi': ['taxi', 'cab', 'uber', 'lyft'],
      'private_car': ['car', 'private_car', 'rental'],
      'shared_rides': ['carpool', 'rideshare', 'uber_pool'],
      'bicycle': ['bike', 'bicycle', 'cycle'],
      'limousine': ['limo', 'limousine', 'luxury_car'],
      'helicopter': ['helicopter', 'heli'],
    };

    const aliases = modeAliases[preferredMode] || [preferredMode];
    return aliases.some(alias => 
      optionMode.toLowerCase().includes(alias.toLowerCase())
    );
  }

  _calculateTransportScore(option, weights, transportPreferences) {
    // Normalize price (inverse: lower is better, assume max $200)
    const priceScore = option.price ? (200 - option.price) / 200 : 0;
    
    // Duration score (inverse: shorter is better, assume max 180 minutes)
    const durationScore = option.duration ? (180 - option.duration) / 180 : 0;
    
    // Comfort bonus based on mode
    const comfortBonus = this._getComfortBonus(option.mode, transportPreferences.comfortLevel);
    
    // Eco-friendly bonus
    const ecoBonus = this._getEcoBonus(option.mode, transportPreferences.prioritize);

    // Weighted sum
    return (
      priceScore * weights.price +
      durationScore * (weights.rating || 0.3) +
      comfortBonus +
      ecoBonus
    );
  }

  _getComfortBonus(mode, preferredComfort) {
    const comfortScores = {
      'walk': { economy: 0.1, comfort: 0, luxury: -0.2 },
      'public_transport': { economy: 0.2, comfort: 0.1, luxury: -0.1 },
      'taxi': { economy: 0, comfort: 0.2, luxury: 0.1 },
      'private_car': { economy: 0, comfort: 0.3, luxury: 0.2 },
      'limousine': { economy: -0.2, comfort: 0.2, luxury: 0.4 },
    };

    return comfortScores[mode]?.[preferredComfort] || 0;
  }

  _getEcoBonus(mode, priority) {
    if (priority !== 'eco_friendly') return 0;

    const ecoScores = {
      'walk': 0.3,
      'bicycle': 0.3,
      'public_transport': 0.2,
      'taxi': 0,
      'private_car': -0.1,
      'limousine': -0.2,
    };

    return ecoScores[mode] || 0;
  }
}

export default new TransportParamsAdapter();
