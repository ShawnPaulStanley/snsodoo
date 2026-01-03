import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ftntkgjxejejntmikhqf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseAnonKey) {
  console.warn('Missing Supabase anon key');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Profile helpers
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const updateProfile = async (userId: string, updates: { full_name?: string; avatar_url?: string }) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

// User preferences helpers
export const getPreferences = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();
  return { data, error };
};

export const savePreferences = async (userId: string, prefs: { intent: string; spending_style: string }) => {
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({ 
      user_id: userId, 
      intent: prefs.intent, 
      spending_style: prefs.spending_style,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
  return { data, error };
};

// Trips helpers
export const getTrips = async (userId: string) => {
  const { data, error } = await supabase
    .from('trips')
    .select(`
      *,
      trip_stops (
        *,
        activities (*)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const getTrip = async (tripId: string) => {
  const { data, error } = await supabase
    .from('trips')
    .select(`
      *,
      trip_stops (
        *,
        activities (*)
      )
    `)
    .eq('id', tripId)
    .single();
  return { data, error };
};

export const createTrip = async (trip: {
  user_id: string;
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  is_public?: boolean;
  intent?: string;
  spending_style?: string;
}) => {
  const { data, error } = await supabase
    .from('trips')
    .insert(trip)
    .select()
    .single();
  return { data, error };
};

export const updateTrip = async (tripId: string, updates: Partial<{
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  cover_image: string;
  is_public: boolean;
}>) => {
  const { data, error } = await supabase
    .from('trips')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', tripId)
    .select()
    .single();
  return { data, error };
};

export const deleteTrip = async (tripId: string) => {
  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', tripId);
  return { error };
};

// Trip stops helpers
export const addTripStop = async (stop: {
  trip_id: string;
  city_name: string;
  country?: string;
  lat?: number;
  lon?: number;
  arrival_date?: string;
  departure_date?: string;
  order_index?: number;
}) => {
  const { data, error } = await supabase
    .from('trip_stops')
    .insert(stop)
    .select()
    .single();
  return { data, error };
};

export const updateTripStop = async (stopId: string, updates: Partial<{
  city_name: string;
  country: string;
  arrival_date: string;
  departure_date: string;
  order_index: number;
}>) => {
  const { data, error } = await supabase
    .from('trip_stops')
    .update(updates)
    .eq('id', stopId)
    .select()
    .single();
  return { data, error };
};

export const deleteTripStop = async (stopId: string) => {
  const { error } = await supabase
    .from('trip_stops')
    .delete()
    .eq('id', stopId);
  return { error };
};

// Activities helpers
export const addActivity = async (activity: {
  stop_id: string;
  name: string;
  description?: string;
  category?: string;
  cost?: number;
  currency?: string;
  duration_minutes?: number;
  day_index?: number;
  order_index?: number;
}) => {
  const { data, error } = await supabase
    .from('activities')
    .insert(activity)
    .select()
    .single();
  return { data, error };
};

export const updateActivity = async (activityId: string, updates: Partial<{
  name: string;
  description: string;
  category: string;
  cost: number;
  duration_minutes: number;
  order_index: number;
}>) => {
  const { data, error } = await supabase
    .from('activities')
    .update(updates)
    .eq('id', activityId)
    .select()
    .single();
  return { data, error };
};

export const deleteActivity = async (activityId: string) => {
  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id', activityId);
  return { error };
};

// Storage helpers
export const uploadImage = async (bucket: string, path: string, file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${path}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (uploadError) {
    return { url: null, error: uploadError };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return { url: data.publicUrl, error: null };
};

export const deleteImage = async (bucket: string, path: string) => {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  return { error };
};
