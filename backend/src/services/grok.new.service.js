/**
 * Grok Service
 * Handles all interactions with the Grok LLM API for travel recommendations
 */

import axios from 'axios';
import { env } from '../config/env.js';
import { getThemeConfig, getPromptModifiers } from '../config/themeConfig.js';
import logger from '../utils/logger.new.js';
import { ExternalApiError } from '../utils/errorHandler.js';

const GROK_API_URL = env.grokApiUrl;
const GROK_API_KEY = env.grokApiKey;

/**
 * Create axios instance for Grok API
 */
const grokClient = axios.create({
  baseURL: GROK_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${GROK_API_KEY}`,
  },
  timeout: 60000,
});

/**
 * Build the travel recommendation prompt
 */
const buildTravelPrompt = (params) => {
  const { startingCity, days, theme, subTheme, themeConfig } = params;

  const promptModifiers = getPromptModifiers(theme, subTheme);
  const dailyBudget = themeConfig.dailyBudget;

  return `You are a travel planning expert. Create a detailed travel itinerary.

TRIP DETAILS:
- Starting city: ${startingCity}
- Duration: ${days} days
- Theme: ${theme}
- Style: ${subTheme}
- Daily budget: $${dailyBudget.total} USD

THEME REQUIREMENTS:
${promptModifiers}

RESPONSE FORMAT (JSON only, no markdown):
{
  "tripSummary": {
    "title": "string - catchy trip title",
    "description": "string - brief description",
    "totalDays": number,
    "startingCity": "string",
    "theme": "string",
    "subTheme": "string"
  },
  "recommendedCities": [
    {
      "name": "string - city name",
      "country": "string - country name",
      "daysToSpend": number,
      "highlights": ["string array of key attractions"],
      "whyVisit": "string - reason this fits the theme"
    }
  ],
  "activities": [
    {
      "day": number,
      "city": "string",
      "activities": [
        {
          "name": "string",
          "type": "string - activity type",
          "duration": "string - e.g., 2 hours",
          "estimatedCost": number,
          "description": "string"
        }
      ]
    }
  ],
  "budgetBreakdown": {
    "accommodation": number,
    "transport": number,
    "food": number,
    "activities": number,
    "miscellaneous": number,
    "total": number,
    "currency": "USD"
  }
}

Generate realistic, specific recommendations. Include only cities that match the ${theme} theme.
Respond with valid JSON only, no additional text.`;
};

/**
 * Get travel recommendations from Grok
 */
const getTravelRecommendations = async (tripParams) => {
  const { startingCity, days, theme, subTheme } = tripParams;

  try {
    logger.info('Calling Grok API for travel recommendations', {
      startingCity,
      days,
      theme,
      subTheme,
    });

    const themeConfig = getThemeConfig(theme, subTheme);
    const prompt = buildTravelPrompt({ ...tripParams, themeConfig });

    const startTime = Date.now();

    const response = await grokClient.post('/chat/completions', {
      model: 'grok-3-latest',
      messages: [
        {
          role: 'system',
          content: 'You are a travel planning expert. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const duration = Date.now() - startTime;
    logger.logApiCall('Grok', '/chat/completions', true, duration);

    const content = response.data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from Grok API');
    }

    // Parse JSON response (handle potential markdown code blocks)
    let recommendations;
    try {
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      recommendations = JSON.parse(cleanContent);
    } catch (parseError) {
      logger.error('Failed to parse Grok response', { content });
      throw new Error('Invalid JSON response from Grok API');
    }

    return {
      success: true,
      data: recommendations,
      themeConfig,
    };
  } catch (error) {
    logger.error('Grok API error', { error: error.message });

    if (error.response) {
      throw new ExternalApiError(
        'Grok',
        error.response.data?.error?.message || 'Failed to get recommendations',
        error.response.data
      );
    }

    throw new ExternalApiError('Grok', error.message);
  }
};

/**
 * Validate Grok API connection
 */
const validateConnection = async () => {
  try {
    const response = await grokClient.post('/chat/completions', {
      model: 'grok-3-latest',
      messages: [{ role: 'user', content: 'Say "OK"' }],
      max_tokens: 10,
    });

    return {
      connected: true,
      model: 'grok-3-latest',
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
    };
  }
};

export default {
  getTravelRecommendations,
  validateConnection,
};
