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
}

export enum ActivityType {
  Transport = 'Transport',
  Accommodation = 'Accommodation',
  Food = 'Food',
  Activity = 'Activity',
}

export interface Activity {
  id: string;
  tripStopId: string;
  title: string;
  description?: string;
  type: ActivityType;
  cost: number;
  startTime?: string; // ISO string
  durationMinutes?: number;
}

export interface TripStop {
  id: string;
  tripId: string;
  city: City;
  arrivalDate: string; // ISO Date string YYYY-MM-DD
  departureDate: string; // ISO Date string YYYY-MM-DD
  activities: Activity[];
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
}

export interface TripStats {
  totalCost: number;
  totalDays: number;
  cityCount: number;
  categoryBreakdown: { name: string; value: number }[];
}
