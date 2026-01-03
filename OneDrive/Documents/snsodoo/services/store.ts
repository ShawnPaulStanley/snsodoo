import { User, Trip, City, TripStop, Activity, ActivityType, TripIntent, SpendingStyle, UserPreferences } from '../types';

// Mock Data
const MOCK_USER: User = {
  id: 'u1',
  name: 'Alex Wanderer',
  email: 'alex@globetrotter.com',
  avatar: 'https://picsum.photos/200/200?random=user'
};

const CITIES: City[] = [
  { id: 'c1', name: 'Paris', country: 'France', costIndex: 4, imageUrl: 'https://picsum.photos/800/600?random=1' },
  { id: 'c2', name: 'Tokyo', country: 'Japan', costIndex: 4, imageUrl: 'https://picsum.photos/800/600?random=2' },
  { id: 'c3', name: 'Bali', country: 'Indonesia', costIndex: 2, imageUrl: 'https://picsum.photos/800/600?random=3' },
  { id: 'c4', name: 'New York', country: 'USA', costIndex: 5, imageUrl: 'https://picsum.photos/800/600?random=4' },
  { id: 'c5', name: 'Lisbon', country: 'Portugal', costIndex: 3, imageUrl: 'https://picsum.photos/800/600?random=5' },
];

const INITIAL_TRIPS: Trip[] = [
  {
    id: 't1',
    userId: 'u1',
    title: 'European Summer',
    description: 'Backpacking through Western Europe.',
    startDate: '2024-06-01',
    endDate: '2024-06-15',
    coverImage: 'https://picsum.photos/1200/400?random=10',
    isPublic: true,
    intent: TripIntent.Family,
    spendingStyle: SpendingStyle.Deluxe,
    stops: [
      {
        id: 's1',
        tripId: 't1',
        city: CITIES[0], // Paris
        arrivalDate: '2024-06-01',
        departureDate: '2024-06-05',
        activities: [
          { id: 'a1', tripStopId: 's1', title: 'Eiffel Tower Tour', type: ActivityType.Activity, cost: 35, startTime: '2024-06-02T10:00' },
          { id: 'a2', tripStopId: 's1', title: 'Croissant Breakfast', type: ActivityType.Food, cost: 15, startTime: '2024-06-02T08:00' },
          { id: 'a3', tripStopId: 's1', title: 'Hotel Le Meurice', type: ActivityType.Accommodation, cost: 1200, startTime: '2024-06-01T14:00' },
        ]
      },
      {
        id: 's2',
        tripId: 't1',
        city: CITIES[4], // Lisbon
        arrivalDate: '2024-06-05',
        departureDate: '2024-06-10',
        activities: [
          { id: 'a4', tripStopId: 's2', title: 'Tram 28 Ride', type: ActivityType.Transport, cost: 3, startTime: '2024-06-06T11:00' },
        ]
      }
    ]
  }
];

// Simple Event Emitter for state updates across components
class Store {
  private user: User | null = null;
  private trips: Trip[] = [...INITIAL_TRIPS];
  private cities: City[] = [...CITIES];
  private preferences: UserPreferences | null = null;
  private listeners: (() => void)[] = [];

  constructor() {
    // Check localStorage for persisted auth
    const savedUser = localStorage.getItem('gt_user');
    if (savedUser) {
      this.user = JSON.parse(savedUser);
    }
    
    // Check localStorage for preferences
    const savedPrefs = localStorage.getItem('gt_prefs');
    if (savedPrefs) {
      this.preferences = JSON.parse(savedPrefs);
    }
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(l => l());
  }

  // Auth
  login(email: string) {
    this.user = { ...MOCK_USER, email };
    localStorage.setItem('gt_user', JSON.stringify(this.user));
    this.notify();
    return Promise.resolve(this.user);
  }

  logout() {
    this.user = null;
    localStorage.removeItem('gt_user');
    this.notify();
    return Promise.resolve();
  }

  getCurrentUser() {
    return this.user;
  }
  
  // Preferences
  getPreferences() {
    return this.preferences;
  }
  
  savePreferences(prefs: UserPreferences) {
    this.preferences = prefs;
    localStorage.setItem('gt_prefs', JSON.stringify(prefs));
    this.notify();
  }

  // Data Access
  getTrips() {
    return [...this.trips];
  }

  getTrip(id: string) {
    return this.trips.find(t => t.id === id);
  }

  addTrip(trip: Trip) {
    this.trips.push(trip);
    this.notify();
  }

  updateTrip(updatedTrip: Trip) {
    const index = this.trips.findIndex(t => t.id === updatedTrip.id);
    if (index !== -1) {
      this.trips[index] = updatedTrip;
      this.notify();
    }
  }

  deleteTrip(id: string) {
    this.trips = this.trips.filter(t => t.id !== id);
    this.notify();
  }

  searchCities(query: string) {
    const q = query.toLowerCase();
    return this.cities.filter(c => 
      c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
    );
  }

  getAllCities() {
    return this.cities;
  }
}

export const store = new Store();