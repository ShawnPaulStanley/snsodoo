/**
 * THEME PROFILES CONFIGURATION
 * 
 * Purpose: Maps (Theme + SubTheme) combinations to "Recommendation Profiles".
 * Each profile controls HOW the backend queries APIs and ranks results.
 * 
 * Architecture Decision:
 * - NO business logic in controllers/services
 * - ALL theme-specific behavior is encoded HERE
 * - Adapters read this profile and convert to API-specific params
 * - Adding a new theme = just adding a new profile object
 * 
 * Profile Structure:
 * - budgetRange: Min/max daily spending (USD)
 * - hotelPreferences: Star rating, amenities, location priorities
 * - restaurantPreferences: Price level, cuisine types
 * - transportPreferences: Comfort level, speed vs cost
 * - activityCategories: Types of activities to recommend
 * - rankingWeights: How to score results (price vs quality vs distance)
 * - uiHints: Frontend theming (colors, density) - NOT implemented by us
 * - llmBias: Prompt fragment for future LLM integration
 */

import { Theme, SubTheme } from '../enums/theme.enum.js';

const themeProfiles = {
  // ============================================
  // BEACH PROFILES
  // ============================================
  [`${Theme.BEACH}_${SubTheme.BUDGET}`]: {
    name: 'Budget Beach Vacation',
    budgetRange: { min: 50, max: 150 },
    hotelPreferences: {
      starRating: { min: 2, max: 3 },
      amenities: ['wifi', 'pool', 'beach_access'],
      distanceToBeach: { max: 1000 }, // meters
      roomTypes: ['standard', 'economy'],
    },
    restaurantPreferences: {
      priceLevel: { min: 1, max: 2 }, // 1-4 scale (Yelp/Google)
      cuisineTypes: ['local', 'seafood', 'casual'],
      distanceMax: 2000, // meters
    },
    transportPreferences: {
      comfortLevel: 'economy',
      preferredModes: ['public_transport', 'shared_rides', 'walk'],
      prioritize: 'cost',
    },
    activityCategories: ['beach', 'water_sports', 'local_markets', 'free_activities'],
    rankingWeights: {
      price: 0.5,
      rating: 0.3,
      distance: 0.2,
    },
    uiHints: {
      primaryColor: '#38bdf8',
      accentColor: '#fbbf24',
      density: 'compact',
    },
    llmBias: 'Focus on affordable beachfront experiences, local seafood, and budget-friendly water activities.',
  },

  [`${Theme.BEACH}_${SubTheme.DELUXE}`]: {
    name: 'Deluxe Beach Experience',
    budgetRange: { min: 200, max: 500 },
    hotelPreferences: {
      starRating: { min: 4, max: 4.5 },
      amenities: ['wifi', 'pool', 'spa', 'beach_access', 'restaurant', 'gym'],
      distanceToBeach: { max: 500 },
      roomTypes: ['deluxe', 'suite', 'ocean_view'],
    },
    restaurantPreferences: {
      priceLevel: { min: 2, max: 3 },
      cuisineTypes: ['seafood', 'international', 'fine_dining'],
      distanceMax: 5000,
    },
    transportPreferences: {
      comfortLevel: 'comfort',
      preferredModes: ['private_car', 'taxi', 'premium_rides'],
      prioritize: 'convenience',
    },
    activityCategories: ['beach', 'water_sports', 'spa', 'yacht', 'snorkeling'],
    rankingWeights: {
      price: 0.2,
      rating: 0.5,
      distance: 0.3,
    },
    uiHints: {
      primaryColor: '#0ea5e9',
      accentColor: '#f59e0b',
      density: 'comfortable',
    },
    llmBias: 'Emphasize quality beachfront resorts, curated dining, and premium water experiences.',
  },

  [`${Theme.BEACH}_${SubTheme.LUXURIOUS}`]: {
    name: 'Luxury Beach Paradise',
    budgetRange: { min: 600, max: 2000 },
    hotelPreferences: {
      starRating: { min: 5, max: 5 },
      amenities: ['wifi', 'infinity_pool', 'spa', 'private_beach', 'butler', 'fine_dining', 'concierge'],
      distanceToBeach: { max: 100 },
      roomTypes: ['presidential_suite', 'villa', 'penthouse'],
    },
    restaurantPreferences: {
      priceLevel: { min: 3, max: 4 },
      cuisineTypes: ['fine_dining', 'michelin_star', 'international', 'private_chef'],
      distanceMax: 10000,
    },
    transportPreferences: {
      comfortLevel: 'luxury',
      preferredModes: ['private_car', 'helicopter', 'yacht', 'limousine'],
      prioritize: 'exclusivity',
    },
    activityCategories: ['private_beach', 'yacht', 'diving', 'helicopter_tour', 'spa', 'wine_tasting'],
    rankingWeights: {
      price: 0.1,
      rating: 0.6,
      distance: 0.3,
    },
    uiHints: {
      primaryColor: '#0c4a6e',
      accentColor: '#d97706',
      density: 'spacious',
    },
    llmBias: 'Focus on ultra-luxury resorts, exclusive experiences, personalized service, and world-class amenities.',
  },

  // ============================================
  // HILLSTATION PROFILES
  // ============================================
  [`${Theme.HILLSTATION}_${SubTheme.BUDGET}`]: {
    name: 'Budget Mountain Retreat',
    budgetRange: { min: 40, max: 120 },
    hotelPreferences: {
      starRating: { min: 2, max: 3 },
      amenities: ['wifi', 'heating', 'mountain_view'],
      distanceToCenter: { max: 5000 },
      roomTypes: ['standard', 'hostel', 'guesthouse'],
    },
    restaurantPreferences: {
      priceLevel: { min: 1, max: 2 },
      cuisineTypes: ['local', 'comfort_food', 'cafe'],
      distanceMax: 3000,
    },
    transportPreferences: {
      comfortLevel: 'economy',
      preferredModes: ['public_transport', 'shared_rides', 'hiking'],
      prioritize: 'cost',
    },
    activityCategories: ['hiking', 'nature_walks', 'viewpoints', 'local_markets', 'camping'],
    rankingWeights: {
      price: 0.5,
      rating: 0.3,
      distance: 0.2,
    },
    uiHints: {
      primaryColor: '#10b981',
      accentColor: '#8b5cf6',
      density: 'compact',
    },
    llmBias: 'Highlight affordable mountain lodges, hiking trails, and authentic local experiences.',
  },

  [`${Theme.HILLSTATION}_${SubTheme.DELUXE}`]: {
    name: 'Deluxe Mountain Experience',
    budgetRange: { min: 180, max: 450 },
    hotelPreferences: {
      starRating: { min: 4, max: 4.5 },
      amenities: ['wifi', 'heating', 'mountain_view', 'spa', 'fireplace', 'restaurant'],
      distanceToCenter: { max: 3000 },
      roomTypes: ['deluxe', 'suite', 'mountain_view'],
    },
    restaurantPreferences: {
      priceLevel: { min: 2, max: 3 },
      cuisineTypes: ['local', 'international', 'organic', 'wine_bar'],
      distanceMax: 5000,
    },
    transportPreferences: {
      comfortLevel: 'comfort',
      preferredModes: ['private_car', 'taxi', 'cable_car'],
      prioritize: 'convenience',
    },
    activityCategories: ['hiking', 'spa', 'adventure_sports', 'wildlife', 'scenic_drives'],
    rankingWeights: {
      price: 0.2,
      rating: 0.5,
      distance: 0.3,
    },
    uiHints: {
      primaryColor: '#059669',
      accentColor: '#7c3aed',
      density: 'comfortable',
    },
    llmBias: 'Focus on quality mountain resorts, guided adventures, and wellness activities.',
  },

  [`${Theme.HILLSTATION}_${SubTheme.LUXURIOUS}`]: {
    name: 'Luxury Mountain Escape',
    budgetRange: { min: 550, max: 1800 },
    hotelPreferences: {
      starRating: { min: 5, max: 5 },
      amenities: ['wifi', 'heating', 'panoramic_view', 'spa', 'fine_dining', 'butler', 'private_terrace'],
      distanceToCenter: { max: 2000 },
      roomTypes: ['presidential_suite', 'chalet', 'villa'],
    },
    restaurantPreferences: {
      priceLevel: { min: 3, max: 4 },
      cuisineTypes: ['fine_dining', 'michelin_star', 'farm_to_table', 'private_chef'],
      distanceMax: 8000,
    },
    transportPreferences: {
      comfortLevel: 'luxury',
      preferredModes: ['private_car', 'helicopter', 'limousine'],
      prioritize: 'exclusivity',
    },
    activityCategories: ['helicopter_tour', 'private_guides', 'spa', 'adventure_sports', 'wildlife_safari'],
    rankingWeights: {
      price: 0.1,
      rating: 0.6,
      distance: 0.3,
    },
    uiHints: {
      primaryColor: '#047857',
      accentColor: '#6d28d9',
      density: 'spacious',
    },
    llmBias: 'Emphasize exclusive mountain retreats, private experiences, and world-class wellness facilities.',
  },

  // ============================================
  // BUSINESS PROFILES
  // ============================================
  [`${Theme.BUSINESS}_${SubTheme.BUDGET}`]: {
    name: 'Budget Business Travel',
    budgetRange: { min: 80, max: 180 },
    hotelPreferences: {
      starRating: { min: 3, max: 3.5 },
      amenities: ['wifi', 'desk', 'business_center', 'meeting_rooms'],
      distanceToCenter: { max: 5000 },
      roomTypes: ['standard', 'business_room'],
    },
    restaurantPreferences: {
      priceLevel: { min: 1, max: 2 },
      cuisineTypes: ['fast_casual', 'cafe', 'international'],
      distanceMax: 2000,
    },
    transportPreferences: {
      comfortLevel: 'economy',
      preferredModes: ['public_transport', 'taxi', 'ride_sharing'],
      prioritize: 'time',
    },
    activityCategories: ['business_centers', 'coworking', 'networking_events', 'quick_fitness'],
    rankingWeights: {
      price: 0.4,
      rating: 0.3,
      distance: 0.3,
    },
    uiHints: {
      primaryColor: '#3b82f6',
      accentColor: '#64748b',
      density: 'compact',
    },
    llmBias: 'Prioritize convenience, fast wifi, and proximity to business districts.',
  },

  [`${Theme.BUSINESS}_${SubTheme.DELUXE}`]: {
    name: 'Deluxe Business Travel',
    budgetRange: { min: 250, max: 550 },
    hotelPreferences: {
      starRating: { min: 4, max: 4.5 },
      amenities: ['wifi', 'executive_lounge', 'business_center', 'meeting_rooms', 'gym', 'restaurant'],
      distanceToCenter: { max: 3000 },
      roomTypes: ['executive', 'suite', 'business_suite'],
    },
    restaurantPreferences: {
      priceLevel: { min: 2, max: 3 },
      cuisineTypes: ['international', 'fine_dining', 'business_lunch'],
      distanceMax: 3000,
    },
    transportPreferences: {
      comfortLevel: 'comfort',
      preferredModes: ['private_car', 'premium_taxi', 'airport_shuttle'],
      prioritize: 'reliability',
    },
    activityCategories: ['business_centers', 'executive_lounges', 'golf', 'fine_dining', 'spa'],
    rankingWeights: {
      price: 0.2,
      rating: 0.5,
      distance: 0.3,
    },
    uiHints: {
      primaryColor: '#2563eb',
      accentColor: '#475569',
      density: 'comfortable',
    },
    llmBias: 'Focus on professional amenities, executive services, and quality business facilities.',
  },

  [`${Theme.BUSINESS}_${SubTheme.LUXURIOUS}`]: {
    name: 'Luxury Business Travel',
    budgetRange: { min: 650, max: 2000 },
    hotelPreferences: {
      starRating: { min: 5, max: 5 },
      amenities: ['wifi', 'executive_lounge', 'private_meeting_rooms', 'butler', 'chauffeur', 'concierge'],
      distanceToCenter: { max: 2000 },
      roomTypes: ['presidential_suite', 'executive_suite', 'penthouse'],
    },
    restaurantPreferences: {
      priceLevel: { min: 3, max: 4 },
      cuisineTypes: ['fine_dining', 'michelin_star', 'private_dining'],
      distanceMax: 5000,
    },
    transportPreferences: {
      comfortLevel: 'luxury',
      preferredModes: ['private_car', 'limousine', 'helicopter'],
      prioritize: 'prestige',
    },
    activityCategories: ['executive_lounges', 'private_clubs', 'golf', 'spa', 'fine_dining'],
    rankingWeights: {
      price: 0.1,
      rating: 0.6,
      distance: 0.3,
    },
    uiHints: {
      primaryColor: '#1e40af',
      accentColor: '#334155',
      density: 'spacious',
    },
    llmBias: 'Emphasize executive-level service, privacy, and premium business facilities.',
  },

  // ============================================
  // NATURE & WELLNESS PROFILES
  // ============================================
  [`${Theme.NATURE_WELLNESS}_${SubTheme.BUDGET}`]: {
    name: 'Budget Wellness Retreat',
    budgetRange: { min: 60, max: 150 },
    hotelPreferences: {
      starRating: { min: 2, max: 3 },
      amenities: ['wifi', 'yoga_space', 'meditation_area', 'organic_food'],
      distanceToNature: { max: 2000 },
      roomTypes: ['standard', 'shared', 'eco_lodge'],
    },
    restaurantPreferences: {
      priceLevel: { min: 1, max: 2 },
      cuisineTypes: ['vegan', 'organic', 'local', 'healthy'],
      distanceMax: 3000,
    },
    transportPreferences: {
      comfortLevel: 'economy',
      preferredModes: ['public_transport', 'bicycle', 'walk'],
      prioritize: 'eco_friendly',
    },
    activityCategories: ['yoga', 'meditation', 'hiking', 'nature_walks', 'organic_farming'],
    rankingWeights: {
      price: 0.4,
      rating: 0.4,
      distance: 0.2,
    },
    uiHints: {
      primaryColor: '#22c55e',
      accentColor: '#a78bfa',
      density: 'compact',
    },
    llmBias: 'Highlight affordable wellness activities, nature immersion, and holistic experiences.',
  },

  [`${Theme.NATURE_WELLNESS}_${SubTheme.DELUXE}`]: {
    name: 'Deluxe Wellness Experience',
    budgetRange: { min: 220, max: 500 },
    hotelPreferences: {
      starRating: { min: 4, max: 4.5 },
      amenities: ['wifi', 'spa', 'yoga_studio', 'meditation_center', 'organic_restaurant', 'wellness_programs'],
      distanceToNature: { max: 1000 },
      roomTypes: ['deluxe', 'wellness_suite', 'nature_view'],
    },
    restaurantPreferences: {
      priceLevel: { min: 2, max: 3 },
      cuisineTypes: ['organic', 'farm_to_table', 'vegan', 'ayurvedic'],
      distanceMax: 4000,
    },
    transportPreferences: {
      comfortLevel: 'comfort',
      preferredModes: ['private_car', 'eco_friendly_transport'],
      prioritize: 'comfort',
    },
    activityCategories: ['spa', 'yoga', 'meditation', 'wellness_programs', 'nature_therapy', 'hiking'],
    rankingWeights: {
      price: 0.2,
      rating: 0.5,
      distance: 0.3,
    },
    uiHints: {
      primaryColor: '#16a34a',
      accentColor: '#9333ea',
      density: 'comfortable',
    },
    llmBias: 'Focus on quality wellness facilities, holistic treatments, and nature-based healing.',
  },

  [`${Theme.NATURE_WELLNESS}_${SubTheme.LUXURIOUS}`]: {
    name: 'Luxury Wellness Sanctuary',
    budgetRange: { min: 600, max: 2200 },
    hotelPreferences: {
      starRating: { min: 5, max: 5 },
      amenities: ['wifi', 'luxury_spa', 'yoga_pavilion', 'meditation_sanctuary', 'organic_fine_dining', 'wellness_concierge', 'private_treatments'],
      distanceToNature: { max: 500 },
      roomTypes: ['wellness_suite', 'villa', 'private_retreat'],
    },
    restaurantPreferences: {
      priceLevel: { min: 3, max: 4 },
      cuisineTypes: ['organic_fine_dining', 'plant_based', 'ayurvedic', 'private_chef'],
      distanceMax: 6000,
    },
    transportPreferences: {
      comfortLevel: 'luxury',
      preferredModes: ['private_car', 'helicopter', 'eco_luxury_transport'],
      prioritize: 'exclusivity',
    },
    activityCategories: ['luxury_spa', 'private_yoga', 'meditation_retreats', 'wellness_consultations', 'nature_immersion'],
    rankingWeights: {
      price: 0.1,
      rating: 0.6,
      distance: 0.3,
    },
    uiHints: {
      primaryColor: '#15803d',
      accentColor: '#7e22ce',
      density: 'spacious',
    },
    llmBias: 'Emphasize world-class wellness facilities, personalized treatments, and transformative experiences.',
  },

  // ============================================
  // FAMILY PROFILES
  // ============================================
  [`${Theme.FAMILY}_${SubTheme.BUDGET}`]: {
    name: 'Budget Family Vacation',
    budgetRange: { min: 70, max: 180 },
    hotelPreferences: {
      starRating: { min: 2, max: 3 },
      amenities: ['wifi', 'pool', 'kids_club', 'family_rooms', 'playground'],
      distanceToAttractions: { max: 5000 },
      roomTypes: ['family_room', 'connecting_rooms', 'apartment'],
    },
    restaurantPreferences: {
      priceLevel: { min: 1, max: 2 },
      cuisineTypes: ['family_friendly', 'casual', 'kids_menu', 'international'],
      distanceMax: 2000,
    },
    transportPreferences: {
      comfortLevel: 'economy',
      preferredModes: ['public_transport', 'family_taxis', 'rental_car'],
      prioritize: 'safety',
    },
    activityCategories: ['theme_parks', 'zoos', 'playgrounds', 'family_activities', 'educational'],
    rankingWeights: {
      price: 0.4,
      rating: 0.4,
      distance: 0.2,
    },
    uiHints: {
      primaryColor: '#f59e0b',
      accentColor: '#ec4899',
      density: 'compact',
    },
    llmBias: 'Focus on family-friendly amenities, kid-safe activities, and value-for-money experiences.',
  },

  [`${Theme.FAMILY}_${SubTheme.DELUXE}`]: {
    name: 'Deluxe Family Experience',
    budgetRange: { min: 280, max: 600 },
    hotelPreferences: {
      starRating: { min: 4, max: 4.5 },
      amenities: ['wifi', 'pool', 'kids_club', 'babysitting', 'family_suites', 'kids_activities', 'water_park'],
      distanceToAttractions: { max: 3000 },
      roomTypes: ['family_suite', 'villa', 'interconnecting_rooms'],
    },
    restaurantPreferences: {
      priceLevel: { min: 2, max: 3 },
      cuisineTypes: ['family_friendly', 'international', 'kids_menu', 'healthy'],
      distanceMax: 4000,
    },
    transportPreferences: {
      comfortLevel: 'comfort',
      preferredModes: ['private_car', 'family_taxi', 'rental_car'],
      prioritize: 'convenience',
    },
    activityCategories: ['theme_parks', 'water_parks', 'educational_tours', 'adventure_activities', 'kids_clubs'],
    rankingWeights: {
      price: 0.2,
      rating: 0.5,
      distance: 0.3,
    },
    uiHints: {
      primaryColor: '#f97316',
      accentColor: '#db2777',
      density: 'comfortable',
    },
    llmBias: 'Highlight quality family resorts, supervised activities, and memorable experiences for all ages.',
  },

  [`${Theme.FAMILY}_${SubTheme.LUXURIOUS}`]: {
    name: 'Luxury Family Retreat',
    budgetRange: { min: 700, max: 2500 },
    hotelPreferences: {
      starRating: { min: 5, max: 5 },
      amenities: ['wifi', 'infinity_pool', 'kids_club', 'nanny_service', 'family_villas', 'teens_lounge', 'adventure_center', 'spa'],
      distanceToAttractions: { max: 2000 },
      roomTypes: ['family_villa', 'presidential_suite', 'multi_bedroom'],
    },
    restaurantPreferences: {
      priceLevel: { min: 3, max: 4 },
      cuisineTypes: ['fine_dining', 'international', 'kids_gourmet', 'private_dining'],
      distanceMax: 6000,
    },
    transportPreferences: {
      comfortLevel: 'luxury',
      preferredModes: ['private_car', 'limousine', 'private_transfers'],
      prioritize: 'exclusivity',
    },
    activityCategories: ['private_activities', 'adventure_parks', 'cultural_experiences', 'water_sports', 'educational_tours'],
    rankingWeights: {
      price: 0.1,
      rating: 0.6,
      distance: 0.3,
    },
    uiHints: {
      primaryColor: '#ea580c',
      accentColor: '#be185d',
      density: 'spacious',
    },
    llmBias: 'Focus on exclusive family experiences, personalized service, and world-class facilities for all ages.',
  },
};

/**
 * Helper function to retrieve a specific profile
 */
function getThemeProfile(theme, subTheme) {
  const key = `${theme}_${subTheme}`;
  return themeProfiles[key] || null;
}

/**
 * Get all available theme combinations
 */
function getAllThemeCombinations() {
  return Object.keys(themeProfiles).map(key => {
    const [theme, subTheme] = key.split('_');
    // Reconstruct properly for nature_wellness case
    const actualTheme = theme === 'nature' ? 'nature_wellness' : theme;
    const actualSubTheme = theme === 'nature' ? key.split('_')[2] : subTheme;
    return {
      theme: actualTheme,
      subTheme: actualSubTheme,
      name: themeProfiles[key].name,
    };
  });
}

export { themeProfiles, getThemeProfile, getAllThemeCombinations };
