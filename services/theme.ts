import { TripIntent, SpendingStyle } from '../types';

// Unified Modern Theme Configuration
export interface ThemeConfig {
  // Wrapper & Container
  wrapper: string;
  pageBackground: string;
  
  // Typography
  fontFamily: string;
  headerFont: string;
  headerStyle: string;
  textColor: string;
  mutedText: string;
  
  // Cards & Surfaces
  card: string;
  cardHover: string;
  surfacePrimary: string;
  surfaceSecondary: string;
  
  // Buttons
  buttonPrimary: string;
  buttonSecondary: string;
  buttonDanger: string;
  
  // Inputs
  input: string;
  inputFocus: string;
  
  // Accents & Highlights
  accent: string;
  accentBg: string;
  accentBorder: string;
  highlight: string;
  
  // Navigation
  navBg: string;
  navItem: string;
  navItemActive: string;
  
  // Layout
  borderRadius: string;
  spacing: 'compact' | 'normal' | 'relaxed';
  shadow: string;
  
  // Special Effects
  gradient: string;
  animation: string;
}

// Single source of truth for the modern UI theme
export const buildTheme = (intent?: TripIntent, spendingStyle?: SpendingStyle): ThemeConfig => {
  // We ignore the intent/spendingStyle params to enforce a consistent UI
  
  return {
    // Clean, modern background
    wrapper: 'min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300',
    pageBackground: 'bg-slate-50 dark:bg-slate-950',
    
    // Modern typography
    fontFamily: 'font-sans',
    headerFont: 'font-display',
    headerStyle: 'font-bold tracking-tight text-slate-900 dark:text-white',
    textColor: 'text-slate-600 dark:text-slate-300',
    mutedText: 'text-slate-400 dark:text-slate-500',
    
    // Clean cards with subtle borders
    card: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm',
    cardHover: 'hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300',
    surfacePrimary: 'bg-white dark:bg-slate-900',
    surfaceSecondary: 'bg-slate-50 dark:bg-slate-800/50',
    
    // Primary Brand Color: Indigo/Violet
    buttonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-xl transition-colors shadow-sm hover:shadow-indigo-500/20',
    buttonSecondary: 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium px-4 py-2 rounded-xl transition-colors',
    buttonDanger: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 px-4 py-2 rounded-xl transition-colors',
    
    // Inputs
    input: 'w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all',
    inputFocus: 'focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500',
    
    // Accents
    accent: 'text-indigo-600 dark:text-indigo-400',
    accentBg: 'bg-indigo-50 dark:bg-indigo-900/20',
    accentBorder: 'border-indigo-200 dark:border-indigo-800',
    highlight: 'bg-indigo-600',
    
    // Navigation
    navBg: 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800',
    navItem: 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors',
    navItemActive: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20',
    
    // Layout
    borderRadius: 'rounded-2xl',
    spacing: 'normal',
    shadow: 'shadow-lg shadow-slate-200/50 dark:shadow-none',
    
    // Subtle gradients only
    gradient: 'bg-gradient-to-br from-indigo-500 to-violet-600',
    animation: 'animate-fade-in',
  };
};

// Hook to get current theme
export const useTheme = (): ThemeConfig => {
  return buildTheme();
};

// Export for components that need direct access
export const getTheme = (): ThemeConfig => {
  return buildTheme();
};
