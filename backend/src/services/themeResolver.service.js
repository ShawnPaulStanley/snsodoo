/**
 * THEME RESOLVER SERVICE
 * 
 * Purpose: Converts user input (theme + subTheme) into a RecommendationProfile.
 * This is the BRIDGE between incoming requests and the configuration layer.
 * 
 * Architecture Decision:
 * - Controllers call THIS service, not the config directly
 * - This allows for future logic like:
 *   - User preference overrides
 *   - A/B testing different profiles
 *   - Dynamic profile merging
 *   - Analytics tracking
 * 
 * For now, it's a simple lookup, but the abstraction pays off later.
 */

import { isValidTheme, isValidSubTheme } from '../enums/theme.enum.js';
import { getThemeProfile } from '../config/themeProfiles.js';

class ThemeResolverService {
  /**
   * Resolve a recommendation profile based on theme and subTheme
   * 
   * @param {string} theme - The main theme (beach, hillstation, etc.)
   * @param {string} subTheme - The pricing tier (budget, deluxe, luxurious)
   * @returns {Object} The recommendation profile
   * @throws {Error} If theme or subTheme is invalid
   */
  resolveProfile(theme, subTheme) {
    // Validate inputs
    if (!isValidTheme(theme)) {
      throw new Error(`Invalid theme: ${theme}. Must be one of: beach, hillstation, business, nature_wellness, family`);
    }

    if (!isValidSubTheme(subTheme)) {
      throw new Error(`Invalid subTheme: ${subTheme}. Must be one of: budget, deluxe, luxurious`);
    }

    // Fetch profile
    const profile = getThemeProfile(theme, subTheme);

    if (!profile) {
      throw new Error(`No profile found for combination: ${theme} + ${subTheme}`);
    }

    // Return enriched profile with metadata
    return {
      ...profile,
      theme,
      subTheme,
      resolvedAt: new Date().toISOString(),
    };
  }

  /**
   * Get a profile with optional user-specific overrides
   * (Future enhancement for personalization)
   * 
   * @param {string} theme 
   * @param {string} subTheme 
   * @param {Object} userPreferences - Optional user overrides
   * @returns {Object} The recommendation profile
   */
  resolveProfileWithOverrides(theme, subTheme, userPreferences = {}) {
    const baseProfile = this.resolveProfile(theme, subTheme);

    // Future: merge user preferences like dietary restrictions,
    // accessibility needs, favorite cuisines, etc.
    if (Object.keys(userPreferences).length > 0) {
      // Example override logic (not implemented yet):
      // if (userPreferences.budgetMax) {
      //   baseProfile.budgetRange.max = Math.min(
      //     baseProfile.budgetRange.max,
      //     userPreferences.budgetMax
      //   );
      // }
    }

    return baseProfile;
  }

  /**
   * Validate if a theme+subTheme combination is supported
   * 
   * @param {string} theme 
   * @param {string} subTheme 
   * @returns {boolean}
   */
  isValidCombination(theme, subTheme) {
    try {
      this.resolveProfile(theme, subTheme);
      return true;
    } catch {
      return false;
    }
  }
}

// Export as singleton
export default new ThemeResolverService();
