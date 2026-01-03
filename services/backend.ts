// Backend API service for MySQL database operations
const API_BASE = import.meta.env.VITE_API_URL || '/api';

// User/Auth APIs
export const authApi = {
  login: async (email: string, name?: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },

  getUser: async (email: string) => {
    const res = await fetch(`${API_BASE}/auth/login?email=${encodeURIComponent(email)}`);
    if (!res.ok) throw new Error('User not found');
    return res.json();
  },
};

// Preferences APIs
export const preferencesApi = {
  save: async (userId: string, intent: string, spendingStyle: string, defaultCurrency: string = 'USD') => {
    const res = await fetch(`${API_BASE}/preferences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, intent, spendingStyle, defaultCurrency }),
    });
    if (!res.ok) throw new Error('Failed to save preferences');
    return res.json();
  },

  get: async (userId: string) => {
    const res = await fetch(`${API_BASE}/preferences?userId=${userId}`);
    if (!res.ok) return null;
    return res.json();
  },
};

// Trips APIs
export const tripsApi = {
  getAll: async (userId: string) => {
    const res = await fetch(`${API_BASE}/trips?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch trips');
    return res.json();
  },

  getPublic: async () => {
    const res = await fetch(`${API_BASE}/trips?publicOnly=true`);
    if (!res.ok) throw new Error('Failed to fetch public trips');
    return res.json();
  },

  get: async (tripId: string) => {
    const res = await fetch(`${API_BASE}/trips?tripId=${tripId}`);
    if (!res.ok) throw new Error('Trip not found');
    return res.json();
  },

  create: async (trip: {
    userId: string;
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    coverImage?: string;
    isPublic?: boolean;
    intent?: string;
    spendingStyle?: string;
  }) => {
    const res = await fetch(`${API_BASE}/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trip),
    });
    if (!res.ok) throw new Error('Failed to create trip');
    return res.json();
  },

  update: async (trip: {
    id: string;
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    coverImage?: string;
    isPublic?: boolean;
    intent?: string;
    spendingStyle?: string;
  }) => {
    const res = await fetch(`${API_BASE}/trips`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trip),
    });
    if (!res.ok) throw new Error('Failed to update trip');
    return res.json();
  },

  delete: async (tripId: string) => {
    const res = await fetch(`${API_BASE}/trips?id=${tripId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete trip');
    return res.json();
  },
};

// Stops APIs
export const stopsApi = {
  getAll: async (tripId: string) => {
    const res = await fetch(`${API_BASE}/stops?tripId=${tripId}`);
    if (!res.ok) throw new Error('Failed to fetch stops');
    return res.json();
  },

  create: async (stop: {
    tripId: string;
    cityName: string;
    country?: string;
    lat?: number;
    lon?: number;
    arrivalDate?: string;
    departureDate?: string;
    orderIndex?: number;
  }) => {
    const res = await fetch(`${API_BASE}/stops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stop),
    });
    if (!res.ok) throw new Error('Failed to create stop');
    return res.json();
  },

  delete: async (stopId: string) => {
    const res = await fetch(`${API_BASE}/stops?id=${stopId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete stop');
    return res.json();
  },
};

// Activities APIs
export const activitiesApi = {
  getAll: async (stopId: string) => {
    const res = await fetch(`${API_BASE}/activities?stopId=${stopId}`);
    if (!res.ok) throw new Error('Failed to fetch activities');
    return res.json();
  },

  create: async (activity: {
    stopId: string;
    name: string;
    description?: string;
    category?: string;
    cost?: number;
    currency?: string;
    durationMinutes?: number;
    dayIndex?: number;
    orderIndex?: number;
    address?: string;
    lat?: number;
    lon?: number;
  }) => {
    const res = await fetch(`${API_BASE}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity),
    });
    if (!res.ok) throw new Error('Failed to create activity');
    return res.json();
  },

  update: async (activity: {
    id: string;
    name?: string;
    description?: string;
    category?: string;
    cost?: number;
    currency?: string;
    durationMinutes?: number;
    dayIndex?: number;
    orderIndex?: number;
  }) => {
    const res = await fetch(`${API_BASE}/activities`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity),
    });
    if (!res.ok) throw new Error('Failed to update activity');
    return res.json();
  },

  delete: async (activityId: string) => {
    const res = await fetch(`${API_BASE}/activities?id=${activityId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete activity');
    return res.json();
  },
};
