import { supabase } from './supabase';
import { Trip, TripStop, Activity, UserPreferences } from '../types';

// Supabase Data Service
// Use this service to interact with your Supabase backend

export const supabaseService = {
  // User Profile
  async getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  async updateProfile(updates: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...updates });

    if (error) throw error;
  },

  // Preferences
  async getPreferences() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignore not found
    return data as UserPreferences;
  },

  async savePreferences(prefs: UserPreferences) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('user_preferences')
      .upsert({ user_id: user.id, ...prefs });

    if (error) throw error;
  },

  // Trips
  async getTrips() {
    const { data, error } = await supabase
      .from('trips')
      .select('*, stops:trip_stops(*, activities(*))')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Trip[];
  },

  async getTrip(id: string) {
    const { data, error } = await supabase
      .from('trips')
      .select('*, stops:trip_stops(*, activities(*))')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Trip;
  },

  async createTrip(trip: Partial<Trip>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Insert trip
    const { data: newTrip, error: tripError } = await supabase
      .from('trips')
      .insert({ ...trip, user_id: user.id })
      .select()
      .single();

    if (tripError) throw tripError;
    return newTrip;
  },

  async updateTrip(id: string, updates: Partial<Trip>) {
    const { error } = await supabase
      .from('trips')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteTrip(id: string) {
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Stops
  async addStop(stop: Partial<TripStop>) {
    const { data, error } = await supabase
      .from('trip_stops')
      .insert(stop)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Activities
  async addActivity(activity: Partial<Activity>) {
    const { data, error } = await supabase
      .from('activities')
      .insert(activity)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
