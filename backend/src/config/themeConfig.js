/**
 * Theme Configuration
 * Centralized theme and sub-theme logic for travel recommendations
 */

const THEMES = {
  BEACH: 'Beach',
  HILLSTATION: 'Hillstation',
  WORK: 'Work',
  NATURE: 'Nature',
  FAMILY: 'Family',
};

const SUB_THEMES = {
  LUXURY: 'Luxury',
  DELUXE: 'Deluxe',
  BUDGET: 'Budget',
};

/**
 * Theme-specific configurations
 * Controls how each theme affects API parameters and recommendations
 */
const themeProfiles = {
  [THEMES.BEACH]: {
    keywords: ['beach', 'coastal', 'seaside', 'ocean', 'tropical'],
    activityTypes: ['water_sports', 'sunbathing', 'snorkeling', 'beach_parties', 'seafood'],
    hotelAmenities: ['pool', 'beach_access', 'spa'],
    preferredTransport: 'flight',
    weatherPreference: { minTemp: 25, maxTemp: 35, preferSunny: true },
  },

  [THEMES.HILLSTATION]: {
    keywords: ['hill', 'mountain', 'scenic', 'trekking', 'cool_climate'],
    activityTypes: ['hiking', 'trekking', 'sightseeing', 'camping', 'nature_walks'],
    hotelAmenities: ['mountain_view', 'fireplace', 'restaurant'],
    preferredTransport: 'flight_or_train',
    weatherPreference: { minTemp: 10, maxTemp: 25, preferCool: true },
  },

  [THEMES.WORK]: {
    keywords: ['business', 'corporate', 'conference', 'meetings', 'professional'],
    activityTypes: ['networking', 'business_meetings', 'conferences', 'fine_dining'],
    hotelAmenities: ['wifi', 'business_center', 'meeting_rooms', 'gym'],
    preferredTransport: 'flight',
    weatherPreference: null,
  },

  [THEMES.NATURE]: {
    keywords: ['nature', 'wildlife', 'forest', 'eco', 'adventure'],
    activityTypes: ['wildlife_safari', 'bird_watching', 'nature_photography', 'camping'],
    hotelAmenities: ['eco_friendly', 'nature_view', 'outdoor_activities'],
    preferredTransport: 'mixed',
    weatherPreference: { minTemp: 15, maxTemp: 30 },
  },

  [THEMES.FAMILY]: {
    keywords: ['family', 'kid_friendly', 'safe', 'entertainment', 'relaxed'],
    activityTypes: ['theme_parks', 'museums', 'family_activities', 'easy_tours'],
    hotelAmenities: ['family_rooms', 'kids_club', 'pool', 'restaurant'],
    preferredTransport: 'flight',
    weatherPreference: { minTemp: 20, maxTemp: 30 },
  },
};

/**
 * Sub-theme configurations
 * Controls budget allocation and quality preferences
 */
const subThemeProfiles = {
  [SUB_THEMES.LUXURY]: {
    budgetMultiplier: 2.5,
    hotelRating: { min: 4.5, preferred: 5 },
    flightClass: 'BUSINESS',
    transportPreference: 'private',
    hotelCategory: '5_STAR',
    priceRange: 'high',
    qualityKeywords: ['premium', 'luxury', 'exclusive', 'five-star', 'boutique'],
  },

  [SUB_THEMES.DELUXE]: {
    budgetMultiplier: 1.5,
    hotelRating: { min: 3.5, preferred: 4 },
    flightClass: 'PREMIUM_ECONOMY',
    transportPreference: 'taxi',
    hotelCategory: '4_STAR',
    priceRange: 'medium',
    qualityKeywords: ['comfortable', 'quality', 'four-star', 'recommended'],
  },

  [SUB_THEMES.BUDGET]: {
    budgetMultiplier: 1.0,
    hotelRating: { min: 2.5, preferred: 3 },
    flightClass: 'ECONOMY',
    transportPreference: 'public',
    hotelCategory: '3_STAR',
    priceRange: 'low',
    qualityKeywords: ['affordable', 'budget', 'value', 'economical'],
  },
};

/**
 * Base budget per day in USD
 */
const BASE_DAILY_BUDGET = {
  accommodation: 50,
  food: 30,
  transport: 20,
  activities: 25,
  miscellaneous: 15,
};

/**
 * Get combined theme configuration
 * @param {string} theme - Main theme
 * @param {string} subTheme - Sub-theme
 * @returns {Object} Combined configuration
 */
const getThemeConfig = (theme, subTheme) => {
  const themeProfile = themeProfiles[theme];
  const subThemeProfile = subThemeProfiles[subTheme];

  if (!themeProfile || !subThemeProfile) {
    throw new Error(`Invalid theme (${theme}) or sub-theme (${subTheme})`);
  }

  return {
    theme: {
      name: theme,
      ...themeProfile,
    },
    subTheme: {
      name: subTheme,
      ...subThemeProfile,
    },
    dailyBudget: calculateDailyBudget(subThemeProfile.budgetMultiplier),
  };
};

/**
 * Calculate daily budget based on sub-theme multiplier
 * @param {number} multiplier - Budget multiplier
 * @returns {Object} Daily budget breakdown
 */
const calculateDailyBudget = (multiplier) => {
  const budget = {};
  let total = 0;

  for (const [category, amount] of Object.entries(BASE_DAILY_BUDGET)) {
    budget[category] = Math.round(amount * multiplier);
    total += budget[category];
  }

  budget.total = total;
  return budget;
};

/**
 * Validate theme and sub-theme
 * @param {string} theme - Theme to validate
 * @param {string} subTheme - Sub-theme to validate
 * @returns {Object} Validation result
 */
const validateTheme = (theme, subTheme) => {
  const validThemes = Object.values(THEMES);
  const validSubThemes = Object.values(SUB_THEMES);

  const errors = [];

  if (!validThemes.includes(theme)) {
    errors.push(`Invalid theme: ${theme}. Valid themes: ${validThemes.join(', ')}`);
  }

  if (!validSubThemes.includes(subTheme)) {
    errors.push(`Invalid sub-theme: ${subTheme}. Valid sub-themes: ${validSubThemes.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Get Grok prompt modifiers based on theme
 * @param {string} theme - Main theme
 * @param {string} subTheme - Sub-theme
 * @returns {string} Prompt modifier text
 */
const getPromptModifiers = (theme, subTheme) => {
  const config = getThemeConfig(theme, subTheme);

  return `
Focus on ${config.theme.keywords.join(', ')} destinations.
Recommend activities like: ${config.theme.activityTypes.join(', ')}.
Target ${config.subTheme.qualityKeywords.join(', ')} options.
Budget level: ${config.subTheme.priceRange}.
Hotel preference: ${config.subTheme.hotelCategory}.
Transport preference: ${config.theme.preferredTransport}.
  `.trim();
};

module.exports = {
  THEMES,
  SUB_THEMES,
  themeProfiles,
  subThemeProfiles,
  BASE_DAILY_BUDGET,
  getThemeConfig,
  validateTheme,
  getPromptModifiers,
  calculateDailyBudget,
};
