// API Keys - loaded from environment variables
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const FOURSQUARE_API_KEY = import.meta.env.VITE_FOURSQUARE_API_KEY || '';
const CURRENCY_API_KEY = import.meta.env.VITE_CURRENCY_API_KEY || '';

import { CitySearchResult, Activity, ActivityType } from '../types';

// OpenStreetMap Nominatim - City Search
export const searchCities = async (query: string): Promise<CitySearchResult[]> => {
  if (!query || query.length < 2) return [];
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'GlobeTrotter/1.0'
        }
      }
    );
    
    const data = await response.json();
    
    return data
      .filter((item: any) => item.type === 'city' || item.type === 'town' || item.type === 'administrative' || item.addresstype === 'city')
      .slice(0, 5)
      .map((item: any) => ({
        name: item.address?.city || item.address?.town || item.name,
        country: item.address?.country || '',
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        displayName: item.display_name
      }));
  } catch (error) {
    console.error('City search error:', error);
    return [];
  }
};

// Groq AI - Generate Trip Recommendations
export const generateTripRecommendations = async (
  destination: string,
  intent: string,
  budget: string,
  days: number
): Promise<string> => {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a travel expert that provides concise, practical trip recommendations.'
          },
          {
            role: 'user',
            content: `Create a ${days}-day itinerary for ${destination} with ${intent} theme and ${budget} budget. Format as a simple day-by-day list with activities.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'No recommendations available';
  } catch (error) {
    console.error('Groq API error:', error);
    return 'Failed to generate recommendations';
  }
};

// Groq AI - Generate Activity Suggestions (returns Activity objects)
export const generateActivitySuggestions = async (
  city: string,
  intent?: string,
  spendingStyle?: string
): Promise<Activity[]> => {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a travel activity recommender. Return ONLY a valid JSON array of 6 activities. Each activity must have these exact fields:
- name (string): activity name
- description (string): 1-2 sentence description
- category (string): one of "Sightseeing", "Food", "Adventure", "Culture", "Shopping", "Relaxation"
- estimatedCost (number): cost in USD
- estimatedDuration (number): duration in minutes
No markdown, no explanation, just the JSON array.`
          },
          {
            role: 'user',
            content: `Generate 6 activities for ${city}${intent ? ` with ${intent} theme` : ''}${spendingStyle ? ` for ${spendingStyle} budget` : ''}.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';
    
    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const activities = JSON.parse(jsonMatch[0]);
      return activities.map((act: any, idx: number) => ({
        id: `ai-${Date.now()}-${idx}`,
        name: act.name || 'Activity',
        title: act.name || 'Activity',
        description: act.description || '',
        category: act.category || 'Activity',
        type: ActivityType.Activity,
        cost: act.estimatedCost || 25,
        estimatedCost: act.estimatedCost || 25,
        durationMinutes: act.estimatedDuration || 90,
        estimatedDuration: act.estimatedDuration || 90,
      }));
    }
    
    // Fallback with sample data if parsing fails
    return getFallbackActivities(city);
  } catch (error) {
    console.error('Activity generation error:', error);
    return getFallbackActivities(city);
  }
};

// Fallback activities when API fails
const getFallbackActivities = (city: string): Activity[] => {
  const activities = [
    { name: `${city} Walking Tour`, description: 'Explore the historic streets and landmarks', category: 'Sightseeing', cost: 25, duration: 180 },
    { name: 'Local Food Market Visit', description: 'Sample authentic local cuisine and specialties', category: 'Food', cost: 35, duration: 120 },
    { name: 'Museum & Art Gallery', description: 'Discover local art and cultural heritage', category: 'Culture', cost: 20, duration: 150 },
    { name: 'Sunset Viewpoint', description: 'Catch breathtaking views at the best vantage point', category: 'Sightseeing', cost: 0, duration: 60 },
    { name: 'Local Cooking Class', description: 'Learn to prepare traditional dishes', category: 'Food', cost: 65, duration: 180 },
    { name: 'Day Trip Adventure', description: 'Explore nearby attractions and nature', category: 'Adventure', cost: 80, duration: 480 },
  ];
  
  return activities.map((act, idx) => ({
    id: `fallback-${Date.now()}-${idx}`,
    name: act.name,
    title: act.name,
    description: act.description,
    category: act.category,
    type: ActivityType.Activity,
    cost: act.cost,
    estimatedCost: act.cost,
    durationMinutes: act.duration,
    estimatedDuration: act.duration,
  }));
};

// Foursquare Places API - Get Real Places
export const searchPlaces = async (
  query: string,
  lat?: number,
  lon?: number,
  category?: string
): Promise<Activity[]> => {
  try {
    let url = `https://api.foursquare.com/v3/places/search?query=${encodeURIComponent(query)}&limit=10`;
    if (lat && lon) {
      url += `&ll=${lat},${lon}`;
    }
    if (category) {
      url += `&categories=${category}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': FOURSQUARE_API_KEY,
        'Accept': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return getFallbackPlaces(query);
    }
    
    return data.results.map((place: any, idx: number) => ({
      id: place.fsq_id || `place-${Date.now()}-${idx}`,
      name: place.name,
      title: place.name,
      description: place.categories?.[0]?.name || 'Local attraction',
      category: place.categories?.[0]?.name || 'Place',
      type: ActivityType.Activity,
      cost: 20,
      estimatedCost: 20,
      durationMinutes: 90,
      estimatedDuration: 90,
      address: place.location?.formatted_address || '',
      lat: place.geocodes?.main?.latitude,
      lon: place.geocodes?.main?.longitude,
      rating: place.rating,
    }));
  } catch (error) {
    console.error('Foursquare API error:', error);
    return getFallbackPlaces(query);
  }
};

// Fallback places when Foursquare fails
const getFallbackPlaces = (city: string): Activity[] => {
  const places = [
    { name: `${city} Central Park`, description: 'Popular green space for relaxation', category: 'Park' },
    { name: `${city} History Museum`, description: 'Learn about local history and culture', category: 'Museum' },
    { name: 'Local Market Square', description: 'Vibrant marketplace with local vendors', category: 'Market' },
    { name: 'Cathedral & Old Town', description: 'Historic architecture and landmarks', category: 'Landmark' },
    { name: 'Riverside Promenade', description: 'Scenic walk along the waterfront', category: 'Park' },
  ];
  
  return places.map((place, idx) => ({
    id: `fallback-place-${Date.now()}-${idx}`,
    name: place.name,
    title: place.name,
    description: place.description,
    category: place.category,
    type: ActivityType.Activity,
    cost: 15,
    estimatedCost: 15,
    durationMinutes: 120,
    estimatedDuration: 120,
  }));
};

// FreeCurrencyAPI - Get Exchange Rates
export const getCurrencyRates = async (baseCurrency: string = 'USD'): Promise<Record<string, number>> => {
  try {
    const response = await fetch(
      `https://api.freecurrencyapi.com/v1/latest?apikey=${CURRENCY_API_KEY}&base_currency=${baseCurrency}`
    );

    const data = await response.json();
    return data.data || {};
  } catch (error) {
    console.error('Currency API error:', error);
    return {};
  }
};

// Get currency by country
export const getCurrencyByCountry = (country: string): string => {
  const currencyMap: Record<string, string> = {
    'United States': 'USD',
    'United Kingdom': 'GBP',
    'France': 'EUR',
    'Germany': 'EUR',
    'Spain': 'EUR',
    'Italy': 'EUR',
    'Japan': 'JPY',
    'China': 'CNY',
    'India': 'INR',
    'Australia': 'AUD',
    'Canada': 'CAD',
    'Mexico': 'MXN',
    'Brazil': 'BRL',
    'Thailand': 'THB',
    'Indonesia': 'IDR',
    'Singapore': 'SGD',
    'Malaysia': 'MYR',
    'Philippines': 'PHP',
    'Vietnam': 'VND',
    'South Korea': 'KRW',
  };

  return currencyMap[country] || 'USD';
};

// Groq AI - Generate Dashboard Templates
export const generateDashboardTemplates = async (): Promise<any[]> => {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: 'You are a travel itinerary generator. Return ONLY a JSON array of 8 trip templates with: title, destination, days, description, intent (Beach/HillStation/Business/Nature/Family), spendingStyle (Minimalist/Deluxe/Luxury). No other text.'
          },
          {
            role: 'user',
            content: 'Generate 8 diverse ready-to-go trip itinerary templates for popular destinations.'
          }
        ],
        temperature: 0.9,
        max_tokens: 2048
      })
    });

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '[]';
    
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch (error) {
    console.error('Template generation error:', error);
    return [];
  }
};
