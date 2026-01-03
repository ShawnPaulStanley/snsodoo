import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { TripIntent, SpendingStyle } from '../types';
import { store } from '../services/store';

export interface ThemeConfig {
  wrapper: string;
  container: string;
  header: string;
  card: string;
  button: string;
  buttonSecondary: string;
  buttonDanger: string;
  input: string;
  headings: string;
  subheadings: string;
  accent: string;
  accentBg: string;
  progressBar: string;
  icons: string;
  layoutDensity: 'compact' | 'normal' | 'relaxed';
  borderRadius: string;
  animation: string;
}

export const useTripTheme = (intent: TripIntent, style: SpendingStyle): ThemeConfig => {
  // 1. Resolve Base Theme (Intent)
  let baseColors = {
    bg: 'bg-slate-50',
    text: 'text-slate-900',
    primary: 'bg-brand-600',
    primaryText: 'text-brand-600',
    secondaryBg: 'bg-white',
    accent: 'text-brand-500',
    accentBg: 'bg-brand-50'
  };

  let typography = {
    fontMain: 'font-sans',
    fontHead: 'font-sans',
  };

  let radius = 'rounded-lg';
  let layoutDensity: 'compact' | 'normal' | 'relaxed' = 'normal';

  switch (intent) {
    case TripIntent.Beach:
      baseColors = {
        bg: 'bg-cyan-50',
        text: 'text-cyan-900',
        primary: 'bg-cyan-500',
        primaryText: 'text-cyan-600',
        secondaryBg: 'bg-white/80 backdrop-blur-sm',
        accent: 'text-yellow-600',
        accentBg: 'bg-yellow-100'
      };
      typography = { fontMain: 'font-rounded', fontHead: 'font-rounded' };
      radius = 'rounded-[2rem]';
      layoutDensity = 'relaxed';
      break;
      
    case TripIntent.HillStation:
      baseColors = {
        bg: 'bg-emerald-50',
        text: 'text-emerald-950',
        primary: 'bg-emerald-700',
        primaryText: 'text-emerald-700',
        secondaryBg: 'bg-stone-50',
        accent: 'text-emerald-600',
        accentBg: 'bg-emerald-100'
      };
      typography = { fontMain: 'font-sans', fontHead: 'font-sans' };
      radius = 'rounded-lg';
      layoutDensity = 'normal';
      break;

    case TripIntent.Business:
      baseColors = {
        bg: 'bg-slate-100',
        text: 'text-slate-900',
        primary: 'bg-slate-800',
        primaryText: 'text-slate-800',
        secondaryBg: 'bg-white',
        accent: 'text-blue-600',
        accentBg: 'bg-blue-50'
      };
      typography = { fontMain: 'font-sans', fontHead: 'font-sans' };
      radius = 'rounded-sm';
      layoutDensity = 'compact';
      break;

    case TripIntent.Nature:
      baseColors = {
        bg: 'bg-stone-100',
        text: 'text-stone-800',
        primary: 'bg-green-700',
        primaryText: 'text-green-800',
        secondaryBg: 'bg-[#faf8f5]',
        accent: 'text-green-600',
        accentBg: 'bg-green-100'
      };
      typography = { fontMain: 'font-sans', fontHead: 'font-nature' };
      radius = 'rounded-md';
      layoutDensity = 'normal';
      break;

    case TripIntent.Family:
      baseColors = {
        bg: 'bg-orange-50',
        text: 'text-orange-950',
        primary: 'bg-orange-500',
        primaryText: 'text-orange-600',
        secondaryBg: 'bg-white',
        accent: 'text-yellow-600',
        accentBg: 'bg-yellow-100'
      };
      typography = { fontMain: 'font-friendly', fontHead: 'font-friendly' };
      radius = 'rounded-2xl';
      layoutDensity = 'relaxed';
      break;
  }

  // 2. Resolve Spending Style Modifiers (Luxury, Deluxe, Minimalist)
  let cardStyle = '';
  let shadowStyle = '';
  let borderStyle = 'border border-transparent';
  let headingModifier = 'font-bold';

  switch (style) {
    case SpendingStyle.Luxury:
      shadowStyle = 'shadow-2xl';
      cardStyle = 'p-8 border-b-4 border-yellow-500/50';
      typography.fontHead = 'font-serif tracking-wide';
      headingModifier = 'font-semibold italic';
      if (intent === TripIntent.Business) baseColors.bg = 'bg-slate-200';
      break;

    case SpendingStyle.Deluxe:
      shadowStyle = 'shadow-md hover:shadow-lg transition-shadow';
      cardStyle = 'p-6 border border-slate-100';
      break;

    case SpendingStyle.Minimalist:
      shadowStyle = 'shadow-none';
      borderStyle = 'border border-slate-300';
      cardStyle = 'p-4';
      typography.fontMain = 'font-mono text-sm'; 
      layoutDensity = 'compact';
      break;
  }

  return {
    wrapper: `min-h-screen ${baseColors.bg} ${baseColors.text} ${typography.fontMain} transition-colors duration-500`,
    container: `max-w-5xl mx-auto p-4 md:p-8 ${layoutDensity === 'relaxed' ? 'space-y-12' : layoutDensity === 'compact' ? 'space-y-4' : 'space-y-8'}`,
    header: `${typography.fontHead} text-4xl ${headingModifier} ${baseColors.text} mb-2`,
    headings: `${typography.fontHead} text-xl ${headingModifier} ${baseColors.text}`,
    subheadings: `text-sm opacity-70 uppercase tracking-wider font-semibold`,
    card: `${baseColors.secondaryBg} ${radius} ${shadowStyle} ${borderStyle} ${cardStyle} overflow-hidden`,
    button: `${baseColors.primary} text-white ${radius} hover:opacity-90 transition-opacity font-medium px-6 py-2 shadow-sm`,
    buttonSecondary: `bg-transparent border ${borderStyle === 'border border-transparent' ? 'border-current' : borderStyle} ${baseColors.text} ${radius} hover:bg-black/5 px-6 py-2`,
    buttonDanger: `bg-red-50 text-red-600 border border-red-200 ${radius} hover:bg-red-100 px-6 py-2`,
    input: `w-full ${baseColors.secondaryBg} border ${style === SpendingStyle.Minimalist ? 'border-slate-400' : 'border-slate-200'} ${radius} px-4 py-2 focus:ring-2 focus:ring-current outline-none transition-all`,
    accent: baseColors.accent,
    accentBg: baseColors.accentBg,
    progressBar: baseColors.primary,
    icons: `${baseColors.primaryText}`,
    layoutDensity,
    borderRadius: radius,
    animation: style === SpendingStyle.Luxury ? 'duration-700 ease-in-out' : 'duration-300 ease-out'
  };
};

/**
 * Hook to automatically determine the best theme for the current context.
 * 1. If viewing a specific trip, use that trip's intent/style.
 * 2. If no trip (Dashboard/Profile), use the user's global preference.
 * 3. If no preference, default to Business/Deluxe (or show onboarding).
 */
export const useAppTheme = () => {
  const location = useLocation();
  const [theme, setTheme] = useState<ThemeConfig>(useTripTheme(TripIntent.Business, SpendingStyle.Deluxe));

  // Listen to store updates for preference changes
  useEffect(() => {
    const updateTheme = () => {
      let activeIntent = TripIntent.Business;
      let activeStyle = SpendingStyle.Deluxe;
      
      // Check if we are inside a specific trip route
      const tripMatch = location.pathname.match(/\/trips\/([^/]+)/);
      if (tripMatch && tripMatch[1]) {
        const trip = store.getTrip(tripMatch[1]);
        if (trip) {
          activeIntent = trip.intent;
          activeStyle = trip.spendingStyle;
        }
      } else {
        // Use Global Preferences
        const prefs = store.getPreferences();
        if (prefs) {
          activeIntent = prefs.intent;
          activeStyle = prefs.spendingStyle;
        } else {
          // Default fallbacks used before onboarding
          activeIntent = TripIntent.Business;
          activeStyle = SpendingStyle.Deluxe;
        }
      }

      setTheme(useTripTheme(activeIntent, activeStyle));
    };

    updateTheme();
    return store.subscribe(updateTheme);
  }, [location.pathname]);

  return theme;
};