/**
 * THEME ENUMS
 * 
 * Purpose: Central source of truth for all supported themes and sub-themes.
 * This prevents typos and makes it easy to add new theme variations.
 * 
 * Architecture Decision:
 * - Themes represent the HIGH-LEVEL travel intent (beach, business, etc.)
 * - SubThemes represent the PRICING/LUXURY tier (budget, deluxe, luxurious)
 * - This 2D matrix creates distinct "Recommendation Profiles"
 */

const Theme = Object.freeze({
  BEACH: 'beach',
  HILLSTATION: 'hillstation',
  BUSINESS: 'business',
  NATURE_WELLNESS: 'nature_wellness',
  FAMILY: 'family',
});

const SubTheme = Object.freeze({
  BUDGET: 'budget',
  DELUXE: 'deluxe',
  LUXURIOUS: 'luxurious',
});

/**
 * Validation helper to ensure incoming requests use valid theme values
 */
function isValidTheme(theme) {
  return Object.values(Theme).includes(theme);
}

function isValidSubTheme(subTheme) {
  return Object.values(SubTheme).includes(subTheme);
}

export { Theme, SubTheme, isValidTheme, isValidSubTheme };
