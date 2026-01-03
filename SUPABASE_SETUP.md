# Supabase Setup Guide

## 1. Create a Supabase Project
1. Go to [Supabase](https://supabase.com) and sign in.
2. Create a new project.
3. Get your `Project URL` and `anon` public key from Project Settings > API.

## 2. Configure Environment Variables
Update your `.env` file with the Supabase keys:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 3. Set up Database Schema
1. Go to the **SQL Editor** in your Supabase dashboard.
2. Copy the content of `supabase/schema.sql` from this project.
3. Paste it into the SQL Editor and run it.
   - This creates tables: `profiles`, `user_preferences`, `trips`, `trip_stops`, `activities`.
   - It sets up Row Level Security (RLS) policies so users can only access their own data.

## 4. Set up Storage
1. Go to **Storage** in the Supabase dashboard.
2. Create a new public bucket named `trip-covers`.
3. Create a new public bucket named `avatars`.
4. Add a policy to allow authenticated users to upload images.

## 5. Authentication
1. Go to **Authentication** > **Providers**.
2. Enable **Email/Password** (it's enabled by default).
3. (Optional) Enable Google or GitHub auth.

## 6. Deploy
When deploying to Vercel, make sure to add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your Vercel Environment Variables.
