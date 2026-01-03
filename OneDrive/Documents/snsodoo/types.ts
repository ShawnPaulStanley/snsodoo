export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface City {
  id: string;
  name: string;
  country: string;
  imageUrl: string;
  costIndex: number; // 1-5 ($ to $$$$$)
  lat?: number;
  lon?: number;
  currency?: string;
}

export enum ActivityType {
  Transport = 'Transport',
  Accommodation = 'Accommodation',
  Food = 'Food',
  Activity = 'Activity',
}

export interface Activity {
  id: string;
  tripStopId?: string;
  dayIndex?: number; // Which day of trip this belongs to
  title: string;
  name?: string; // Alias for title
  description?: string;
  type: ActivityType;
  category?: string;
  cost: number;
  estimatedCost?: number; // Alias for cost
  startTime?: string; // ISO string
  durationMinutes?: number;
  estimatedDuration?: number; // Alias for durationMinutes
  address?: string;
  lat?: number;
  lon?: number;
  rating?: number;
}

export interface TripStop {
  id: string;
  tripId: string;
  city: City;
  arrivalDate: string; // ISO Date string YYYY-MM-DD
  departureDate: string; // ISO Date string YYYY-MM-DD
  activities: Activity[];
}

export enum TripIntent {
  Beach = 'Beach',
  HillStation = 'HillStation',
  Business = 'Business',
  Nature = 'Nature',
  Family = 'Family'
}

export enum SpendingStyle {
  Luxury = 'Luxury',
  Deluxe = 'Deluxe',
  Minimalist = 'Minimalist'
}

export interface UserPreferences {
  intent: TripIntent;
  spendingStyle: SpendingStyle;
}

export interface Trip {
  id: string;
  userId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  coverImage?: string;
  stops: TripStop[];
  isPublic: boolean;
  intent: TripIntent;
  spendingStyle: SpendingStyle;
}

export interface TripStats {
  totalCost: number;
  totalDays: number;
  cityCount: number;
  categoryBreakdown: { name: string; value: number }[];
}

export interface CitySearchResult {
  name: string;
  country: string;
  lat: number;
  lon: number;
  displayName: string;
}

export interface CurrencyInfo {
  code: string;
  symbol: string;
  rate: number;
}