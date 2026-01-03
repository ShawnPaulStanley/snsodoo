/**
 * API CLIENT SERVICE
 * 
 * Purpose: Centralized API client for frontend-backend communication.
 * Handles all HTTP requests to the backend recommendation API.
 */

// Base URL - change for production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

/**
 * Theme mapping from frontend values to backend values
 */
const THEME_MAP: Record<string, string> = {
  'Beach': 'beach',
  'HillStation': 'hillstation',
  'Business': 'business',
  'Nature': 'nature_wellness',
  'Family': 'family',
};

const SPENDING_MAP: Record<string, string> = {
  'Luxury': 'luxurious',
  'Deluxe': 'deluxe',
  'Minimalist': 'budget',
};

/**
 * Convert frontend theme values to backend format
 */
export function mapThemeToBackend(frontendIntent: string): string {
  return THEME_MAP[frontendIntent] || frontendIntent.toLowerCase();
}

export function mapSpendingToBackend(frontendStyle: string): string {
  return SPENDING_MAP[frontendStyle] || frontendStyle.toLowerCase();
}

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API Error: ${response.status}`);
  }

  return response.json();
}

/**
 * API Types
 */
export interface RecommendationRequest {
  theme: string;
  subTheme: string;
  location: {
    cityCode?: string;
    latitude: number;
    longitude: number;
    origin?: string;
    destination?: string;
  };
  dates?: {
    checkIn?: string;
    checkOut?: string;
    departureDate?: string;
    returnDate?: string;
  };
  guests?: {
    adults?: number;
    children?: number;
    rooms?: number;
  };
  passengers?: {
    adults?: number;
    children?: number;
    infants?: number;
  };
}

export interface Hotel {
  id: string;
  name: string;
  rating: number;
  price: { total: number; currency: string };
  distance: number;
  location: { latitude: number; longitude: number; address: string };
  amenities: string[];
  description: string;
  images: string[];
  available: boolean;
  score?: number;
}

export interface Flight {
  id: string;
  price: { total: number; currency: string };
  airline: string;
  travelClass: string;
  segments: number;
  duration: string;
  departureTime: string;
  arrivalTime: string;
  origin: string;
  destination: string;
  score?: number;
}

export interface Restaurant {
  id: string;
  name: string;
  rating: number;
  price_level: number;
  distance: number;
  location: { latitude: number; longitude: number; address: string };
  cuisineTypes: string[];
  review_count: number;
  open_now: boolean;
  image_url: string;
  score?: number;
}

export interface TransportOption {
  id: string;
  mode: string;
  name: string;
  price: number;
  duration: number;
  distance: number;
  provider: string;
  available: boolean;
  score?: number;
}

export interface Weather {
  location: { latitude: number; longitude: number };
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    wind_speed: number;
    weather: { main: string; description: string; icon: string };
  };
  timestamp: string;
}

export interface UIHints {
  primaryColor: string;
  accentColor: string;
  density: 'compact' | 'comfortable' | 'spacious';
}

export interface RecommendationResponse {
  success: boolean;
  data: {
    profile: {
      theme: string;
      subTheme: string;
      name: string;
      budgetRange: { min: number; max: number };
    };
    uiHints: UIHints;
    llmBias: string;
    hotels: Hotel[];
    flights: Flight[];
    restaurants: Restaurant[];
    transport: TransportOption[];
    weather: Weather;
    stats: {
      totalHotels: number;
      totalFlights: number;
      totalRestaurants: number;
      totalTransportOptions: number;
      recommendedHotels: number;
      recommendedFlights: number;
      recommendedRestaurants: number;
      recommendedTransport: number;
    };
  };
  timestamp: string;
}

export interface ThemeCombination {
  theme: string;
  subTheme: string;
  name: string;
}

/**
 * API Methods
 */

// Health check
export async function checkHealth(): Promise<{ status: string; timestamp: string }> {
  return apiFetch('/health');
}

// Get all available themes
export async function getThemes(): Promise<{ success: boolean; data: ThemeCombination[] }> {
  return apiFetch('/recommendations/themes');
}

// Get full recommendations
export async function getRecommendations(
  intent: string,
  spendingStyle: string,
  location: RecommendationRequest['location'],
  dates?: RecommendationRequest['dates'],
  guests?: RecommendationRequest['guests']
): Promise<RecommendationResponse> {
  const request: RecommendationRequest = {
    theme: mapThemeToBackend(intent),
    subTheme: mapSpendingToBackend(spendingStyle),
    location,
    dates,
    guests,
  };

  return apiFetch('/recommendations', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// Get hotels only
export async function getHotels(
  intent: string,
  spendingStyle: string,
  location: RecommendationRequest['location'],
  dates?: RecommendationRequest['dates'],
  guests?: RecommendationRequest['guests']
): Promise<{ success: boolean; data: { hotels: Hotel[]; uiHints: UIHints } }> {
  return apiFetch('/recommendations/hotels', {
    method: 'POST',
    body: JSON.stringify({
      theme: mapThemeToBackend(intent),
      subTheme: mapSpendingToBackend(spendingStyle),
      location,
      dates,
      guests,
    }),
  });
}

// Get flights only
export async function getFlights(
  intent: string,
  spendingStyle: string,
  location: RecommendationRequest['location'],
  dates?: RecommendationRequest['dates'],
  passengers?: RecommendationRequest['passengers']
): Promise<{ success: boolean; data: { flights: Flight[]; uiHints: UIHints } }> {
  return apiFetch('/recommendations/flights', {
    method: 'POST',
    body: JSON.stringify({
      theme: mapThemeToBackend(intent),
      subTheme: mapSpendingToBackend(spendingStyle),
      location,
      dates,
      passengers,
    }),
  });
}

// Get restaurants only
export async function getRestaurants(
  intent: string,
  spendingStyle: string,
  location: RecommendationRequest['location']
): Promise<{ success: boolean; data: { restaurants: Restaurant[]; uiHints: UIHints } }> {
  return apiFetch('/recommendations/restaurants', {
    method: 'POST',
    body: JSON.stringify({
      theme: mapThemeToBackend(intent),
      subTheme: mapSpendingToBackend(spendingStyle),
      location,
    }),
  });
}

/**
 * Export all API functions
 */
export const api = {
  checkHealth,
  getThemes,
  getRecommendations,
  getHotels,
  getFlights,
  getRestaurants,
  mapThemeToBackend,
  mapSpendingToBackend,
};

export default api;
