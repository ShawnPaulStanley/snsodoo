/**
 * Grok LLM Service
 * Handles all AI-powered recommendations using Grok API
 * 
 * This service is the "brain" of the platform - it:
 * - Recommends cities based on theme, budget, and preferences
 * - Suggests activities for each city
 * - Generates structured itineraries
 * - Adjusts recommendations based on user feedback
 * 
 * @module services/grok.service
 */
import axios from 'axios';
import { env } from '../config/env.js';

// Grok API configuration
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
  timeout: 60000, // 60 seconds for LLM responses
});

/**
 * Send a chat completion request to Grok
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} options - Additional options (temperature, maxTokens, etc.)
 * @returns {Promise<string>} - The assistant's response
 */
const chat = async (messages, options = {}) => {
  const {
    temperature = 0.7,
    maxTokens = 2048,
    model = 'grok-beta',
  } = options;

  try {
    const response = await grokClient.post('/chat/completions', {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Grok API Error:', error.response?.data || error.message);
    throw new Error(`Grok API Error: ${error.response?.data?.error?.message || error.message}`);
  }
};

/**
 * Recommend cities based on user preferences
 * @param {Object} params - Recommendation parameters
 * @param {string} params.theme - Main theme (beach, hillstation, business, nature, family)
 * @param {string} params.subTheme - Sub-theme (budget, deluxe, luxury)
 * @param {string} params.startingCity - User's departure city
 * @param {number} params.budget - Total budget amount
 * @param {string} params.currency - Budget currency
 * @param {number} params.duration - Trip duration in days
 * @param {string} params.region - Preferred region (optional)
 * @returns {Promise<Object>} - Recommended cities with details
 */
const recommendCities = async (params) => {
  const {
    theme,
    subTheme,
    startingCity,
    budget,
    currency,
    duration,
    region = 'worldwide',
  } = params;

  const systemPrompt = `You are an expert travel planner AI. Recommend travel destinations based on user preferences.
Always respond in valid JSON format with the following structure:
{
  "cities": [
    {
      "name": "City Name",
      "country": "Country Name",
      "description": "Brief description of why this city fits the theme",
      "estimatedDailyBudget": number,
      "bestTimeToVisit": "Season/months",
      "highlights": ["highlight1", "highlight2", "highlight3"],
      "matchScore": number (1-100)
    }
  ],
  "recommendation": "Overall recommendation summary"
}`;

  const userPrompt = `Recommend 3-5 travel cities for the following preferences:
- Theme: ${theme}
- Style: ${subTheme}
- Starting from: ${startingCity}
- Total budget: ${budget} ${currency}
- Trip duration: ${duration} days
- Preferred region: ${region}

Consider the theme and budget tier when selecting destinations. For ${subTheme} tier, ensure cities match the expected comfort and price level.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const response = await chat(messages, { temperature: 0.8 });
  
  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/) || response.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response;
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Failed to parse Grok response:', response);
    throw new Error('Failed to parse city recommendations from AI');
  }
};

/**
 * Recommend activities for a specific city
 * @param {Object} params - Activity recommendation parameters
 * @param {string} params.city - City name
 * @param {string} params.country - Country name
 * @param {string} params.theme - Trip theme
 * @param {string} params.subTheme - Trip sub-theme
 * @param {number} params.daysInCity - Days planned in this city
 * @param {number} params.dailyBudget - Daily budget for activities
 * @returns {Promise<Object>} - Recommended activities
 */
const recommendActivities = async (params) => {
  const {
    city,
    country,
    theme,
    subTheme,
    daysInCity,
    dailyBudget,
  } = params;

  const systemPrompt = `You are an expert local guide AI. Recommend activities and experiences for travelers.
Always respond in valid JSON format:
{
  "activities": [
    {
      "name": "Activity Name",
      "category": "category (sightseeing, food, adventure, culture, relaxation, nightlife)",
      "description": "Brief description",
      "estimatedCost": number,
      "duration": "estimated duration",
      "bestTimeOfDay": "morning/afternoon/evening/anytime",
      "bookingRequired": boolean,
      "address": "approximate location or area"
    }
  ],
  "dayPlan": "Suggested day-by-day structure"
}`;

  const userPrompt = `Recommend activities for ${daysInCity} days in ${city}, ${country}:
- Trip theme: ${theme}
- Style: ${subTheme}
- Daily activity budget: ~${dailyBudget}

Provide a mix of must-see attractions and experiences that match the ${theme} theme.
For ${subTheme} tier, suggest appropriate venues and experiences.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const response = await chat(messages, { temperature: 0.7 });
  
  try {
    const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/) || response.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response;
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Failed to parse Grok response:', response);
    throw new Error('Failed to parse activity recommendations from AI');
  }
};

/**
 * Generate a complete itinerary structure
 * @param {Object} params - Itinerary generation parameters
 * @param {Array} params.cities - Selected cities with details
 * @param {string} params.theme - Trip theme
 * @param {string} params.subTheme - Trip sub-theme
 * @param {number} params.totalDays - Total trip duration
 * @param {number} params.totalBudget - Total budget
 * @param {string} params.startDate - Trip start date
 * @returns {Promise<Object>} - Complete itinerary structure
 */
const generateItinerary = async (params) => {
  const {
    cities,
    theme,
    subTheme,
    totalDays,
    totalBudget,
    startDate,
  } = params;

  const systemPrompt = `You are an expert travel itinerary planner. Create detailed day-by-day travel plans.
Always respond in valid JSON format:
{
  "itinerary": {
    "overview": "Trip overview summary",
    "days": [
      {
        "dayNumber": 1,
        "date": "YYYY-MM-DD",
        "city": "City Name",
        "title": "Day title",
        "activities": [
          {
            "time": "HH:MM",
            "activity": "Activity name",
            "description": "Brief description",
            "estimatedCost": number
          }
        ],
        "meals": {
          "breakfast": "Suggestion",
          "lunch": "Suggestion", 
          "dinner": "Suggestion"
        },
        "estimatedDayCost": number
      }
    ],
    "totalEstimatedCost": number,
    "travelTips": ["tip1", "tip2"]
  }
}`;

  const citiesList = cities.map(c => `${c.name} (${c.days} days)`).join(', ');
  
  const userPrompt = `Create a ${totalDays}-day itinerary:
- Cities: ${citiesList}
- Theme: ${theme}
- Style: ${subTheme}
- Total budget: ${totalBudget}
- Start date: ${startDate}

Create a day-by-day plan with specific activities, meal suggestions, and time allocations.
Match all recommendations to the ${theme} theme and ${subTheme} tier.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const response = await chat(messages, { temperature: 0.6, maxTokens: 4096 });
  
  try {
    const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/) || response.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response;
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Failed to parse Grok response:', response);
    throw new Error('Failed to parse itinerary from AI');
  }
};

/**
 * Adjust recommendations based on feedback
 * @param {Object} params - Adjustment parameters
 * @param {Object} params.currentRecommendations - Current recommendations
 * @param {string} params.feedback - User feedback
 * @param {string} params.adjustmentType - Type of adjustment (cities, activities, budget)
 * @returns {Promise<Object>} - Adjusted recommendations
 */
const adjustRecommendations = async (params) => {
  const {
    currentRecommendations,
    feedback,
    adjustmentType,
  } = params;

  const systemPrompt = `You are a travel planning assistant. Adjust travel recommendations based on user feedback.
Respond with updated recommendations in the same JSON format as the original.`;

  const userPrompt = `Current ${adjustmentType} recommendations:
${JSON.stringify(currentRecommendations, null, 2)}

User feedback: "${feedback}"

Please adjust the recommendations based on this feedback while maintaining the original format.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const response = await chat(messages, { temperature: 0.7 });
  
  try {
    const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/) || response.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response;
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Failed to parse Grok response:', response);
    throw new Error('Failed to parse adjusted recommendations from AI');
  }
};

// Export all functions
export const grokService = {
  chat,
  recommendCities,
  recommendActivities,
  generateItinerary,
  adjustRecommendations,
};

export default grokService;
