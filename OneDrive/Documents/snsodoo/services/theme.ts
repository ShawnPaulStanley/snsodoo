import { TripIntent, SpendingStyle } from '../types';
import { store } from '../services/store';

// Complete theme configuration for dramatically different UI experiences
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
  iconStyle: string;
  
  // Borders
  border: string;
  divider: string;
}

// 5 dramatically different theme variants based on intent
const intentThemes: Record<TripIntent, Partial<ThemeConfig>> = {
  [TripIntent.Beach]: {
    pageBackground: 'bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-100',
    fontFamily: 'font-rounded',
    headerFont: 'font-rounded',
    headerStyle: 'font-bold tracking-tight',
    textColor: 'text-cyan-900',
    mutedText: 'text-cyan-600/70',
    card: 'bg-white/70 backdrop-blur-md border border-white/50 shadow-lg shadow-cyan-100/50',
    cardHover: 'hover:shadow-xl hover:shadow-cyan-200/50 hover:-translate-y-1',
    surfacePrimary: 'bg-white/80 backdrop-blur-sm',
    surfaceSecondary: 'bg-cyan-50/50',
    buttonPrimary: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40',
    buttonSecondary: 'bg-white/60 backdrop-blur-sm text-cyan-700 border border-cyan-200 hover:bg-cyan-50',
    accent: 'text-cyan-600',
    accentBg: 'bg-cyan-100/80',
    accentBorder: 'border-cyan-300',
    highlight: 'bg-gradient-to-r from-yellow-200 to-orange-200',
    navBg: 'bg-white/60 backdrop-blur-xl border border-white/50 shadow-lg',
    navItem: 'text-cyan-700/70 hover:text-cyan-900 hover:bg-cyan-100/50',
    navItemActive: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md',
    borderRadius: 'rounded-3xl',
    spacing: 'relaxed',
    shadow: 'shadow-xl shadow-cyan-100/30',
    gradient: 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600',
    animation: 'transition-all duration-500 ease-out',
    iconStyle: 'text-cyan-500',
    border: 'border-cyan-200/50',
    divider: 'border-cyan-100',
  },

  [TripIntent.HillStation]: {
    pageBackground: 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100',
    fontFamily: 'font-sans',
    headerFont: 'font-nature',
    headerStyle: 'font-semibold',
    textColor: 'text-emerald-950',
    mutedText: 'text-emerald-700/60',
    card: 'bg-white border border-emerald-200/50 shadow-md',
    cardHover: 'hover:shadow-lg hover:border-emerald-300',
    surfacePrimary: 'bg-white',
    surfaceSecondary: 'bg-emerald-50',
    buttonPrimary: 'bg-emerald-700 text-white hover:bg-emerald-800 shadow-md',
    buttonSecondary: 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100',
    accent: 'text-emerald-600',
    accentBg: 'bg-emerald-100',
    accentBorder: 'border-emerald-400',
    highlight: 'bg-emerald-200',
    navBg: 'bg-white/90 backdrop-blur-md border-b border-emerald-100',
    navItem: 'text-emerald-700/60 hover:text-emerald-900 hover:bg-emerald-50',
    navItemActive: 'bg-emerald-700 text-white',
    borderRadius: 'rounded-xl',
    spacing: 'normal',
    shadow: 'shadow-lg',
    gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    animation: 'transition-all duration-300',
    iconStyle: 'text-emerald-600',
    border: 'border-emerald-200',
    divider: 'border-emerald-100',
  },

  [TripIntent.Business]: {
    pageBackground: 'bg-slate-100',
    fontFamily: 'font-sans',
    headerFont: 'font-sans',
    headerStyle: 'font-semibold tracking-tight',
    textColor: 'text-slate-900',
    mutedText: 'text-slate-500',
    card: 'bg-white border border-slate-200 shadow-sm',
    cardHover: 'hover:shadow-md hover:border-slate-300',
    surfacePrimary: 'bg-white',
    surfaceSecondary: 'bg-slate-50',
    buttonPrimary: 'bg-slate-900 text-white hover:bg-slate-800',
    buttonSecondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50',
    accent: 'text-blue-600',
    accentBg: 'bg-blue-50',
    accentBorder: 'border-blue-500',
    highlight: 'bg-blue-100',
    navBg: 'bg-white border-b border-slate-200',
    navItem: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
    navItemActive: 'bg-slate-900 text-white',
    borderRadius: 'rounded-lg',
    spacing: 'compact',
    shadow: 'shadow-sm',
    gradient: 'bg-gradient-to-r from-slate-800 to-slate-900',
    animation: 'transition-all duration-200',
    iconStyle: 'text-slate-600',
    border: 'border-slate-200',
    divider: 'border-slate-200',
  },

  [TripIntent.Nature]: {
    pageBackground: 'bg-gradient-to-br from-stone-100 via-amber-50 to-green-50',
    fontFamily: 'font-nature',
    headerFont: 'font-nature',
    headerStyle: 'font-semibold italic',
    textColor: 'text-stone-800',
    mutedText: 'text-stone-600/70',
    card: 'bg-[#faf8f5] border border-stone-200 shadow-md',
    cardHover: 'hover:shadow-lg hover:border-green-300',
    surfacePrimary: 'bg-[#faf8f5]',
    surfaceSecondary: 'bg-stone-100',
    buttonPrimary: 'bg-green-800 text-white hover:bg-green-900 shadow-md',
    buttonSecondary: 'bg-stone-100 text-green-800 border border-stone-300 hover:bg-stone-200',
    accent: 'text-green-700',
    accentBg: 'bg-green-100',
    accentBorder: 'border-green-500',
    highlight: 'bg-amber-100',
    navBg: 'bg-[#faf8f5]/90 backdrop-blur-md border-b border-stone-200',
    navItem: 'text-stone-600 hover:text-green-800 hover:bg-stone-100',
    navItemActive: 'bg-green-800 text-white',
    borderRadius: 'rounded-xl',
    spacing: 'normal',
    shadow: 'shadow-md',
    gradient: 'bg-gradient-to-br from-green-700 to-emerald-800',
    animation: 'transition-all duration-400',
    iconStyle: 'text-green-700',
    border: 'border-stone-200',
    divider: 'border-stone-200',
  },

  [TripIntent.Family]: {
    pageBackground: 'bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50',
    fontFamily: 'font-friendly',
    headerFont: 'font-friendly',
    headerStyle: 'font-bold',
    textColor: 'text-orange-950',
    mutedText: 'text-orange-700/60',
    card: 'bg-white border-2 border-orange-100 shadow-lg shadow-orange-100/50',
    cardHover: 'hover:shadow-xl hover:border-orange-200 hover:-translate-y-0.5',
    surfacePrimary: 'bg-white',
    surfaceSecondary: 'bg-orange-50',
    buttonPrimary: 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-300/50 hover:shadow-xl',
    buttonSecondary: 'bg-orange-50 text-orange-700 border-2 border-orange-200 hover:bg-orange-100',
    accent: 'text-orange-600',
    accentBg: 'bg-orange-100',
    accentBorder: 'border-orange-400',
    highlight: 'bg-gradient-to-r from-yellow-100 to-orange-100',
    navBg: 'bg-white/80 backdrop-blur-xl border-b-2 border-orange-100',
    navItem: 'text-orange-600/70 hover:text-orange-900 hover:bg-orange-50',
    navItemActive: 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md',
    borderRadius: 'rounded-2xl',
    spacing: 'relaxed',
    shadow: 'shadow-lg shadow-orange-100/30',
    gradient: 'bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500',
    animation: 'transition-all duration-300 ease-bounce',
    iconStyle: 'text-orange-500',
    border: 'border-orange-200',
    divider: 'border-orange-100',
  },
};

// Spending style modifiers
const spendingModifiers: Record<SpendingStyle, Partial<ThemeConfig>> = {
  [SpendingStyle.Luxury]: {
    card: 'p-8 border-b-4',
    headerFont: 'font-serif',
    headerStyle: 'font-semibold italic tracking-wide',
    shadow: 'shadow-2xl',
    animation: 'transition-all duration-700 ease-in-out',
  },
  [SpendingStyle.Deluxe]: {
    card: 'p-6',
    shadow: 'shadow-lg',
    animation: 'transition-all duration-300',
  },
  [SpendingStyle.Minimalist]: {
    fontFamily: 'font-mono',
    card: 'p-4 border',
    shadow: 'shadow-none',
    borderRadius: 'rounded-md',
    spacing: 'compact',
    animation: 'transition-all duration-150',
  },
};

// Build complete theme from intent + spending style
export const buildTheme = (intent: TripIntent, style: SpendingStyle): ThemeConfig => {
  const base = intentThemes[intent];
  const modifier = spendingModifiers[style];

  // Merge base with modifiers
  const merged: ThemeConfig = {
    pageBackground: base.pageBackground || 'bg-slate-100',
    wrapper: `min-h-screen ${base.pageBackground} ${base.fontFamily} ${base.textColor}`,
    fontFamily: modifier.fontFamily || base.fontFamily || 'font-sans',
    headerFont: modifier.headerFont || base.headerFont || 'font-sans',
    headerStyle: modifier.headerStyle || base.headerStyle || 'font-bold',
    textColor: base.textColor || 'text-slate-900',
    mutedText: base.mutedText || 'text-slate-500',
    card: `${base.card} ${modifier.card || ''} ${base.borderRadius}`,
    cardHover: base.cardHover || '',
    surfacePrimary: base.surfacePrimary || 'bg-white',
    surfaceSecondary: base.surfaceSecondary || 'bg-slate-50',
    buttonPrimary: `${base.buttonPrimary} ${base.borderRadius} font-semibold px-6 py-2.5 ${base.animation}`,
    buttonSecondary: `${base.buttonSecondary} ${base.borderRadius} font-medium px-6 py-2.5 ${base.animation}`,
    buttonDanger: `bg-red-500 text-white hover:bg-red-600 ${base.borderRadius} font-medium px-6 py-2.5`,
    input: `w-full ${base.surfacePrimary} border ${base.border} ${base.borderRadius} px-4 py-2.5 focus:ring-2 focus:ring-offset-0 outline-none ${base.animation}`,
    inputFocus: `focus:${base.accentBorder} focus:ring-${base.accent?.replace('text-', '')}`,
    accent: base.accent || 'text-blue-600',
    accentBg: base.accentBg || 'bg-blue-50',
    accentBorder: base.accentBorder || 'border-blue-500',
    highlight: base.highlight || 'bg-yellow-100',
    navBg: base.navBg || 'bg-white',
    navItem: base.navItem || 'text-slate-600 hover:text-slate-900',
    navItemActive: `${base.navItemActive} ${base.borderRadius}`,
    borderRadius: base.borderRadius || 'rounded-lg',
    spacing: modifier.spacing || base.spacing || 'normal',
    shadow: modifier.shadow || base.shadow || 'shadow-md',
    gradient: base.gradient || 'bg-gradient-to-r from-blue-500 to-purple-500',
    animation: modifier.animation || base.animation || 'transition-all duration-300',
    iconStyle: base.iconStyle || 'text-slate-600',
    border: base.border || 'border-slate-200',
    divider: base.divider || 'border-slate-200',
  };

  return merged;
};

// Hook to get current theme
export const useTheme = (): ThemeConfig => {
  const prefs = store.getPreferences();
  const intent = prefs?.intent || TripIntent.Business;
  const style = prefs?.spendingStyle || SpendingStyle.Deluxe;
  return buildTheme(intent, style);
};

// Export for components that need direct access
export const getTheme = (): ThemeConfig => {
  const prefs = store.getPreferences();
  const intent = prefs?.intent || TripIntent.Business;
  const style = prefs?.spendingStyle || SpendingStyle.Deluxe;
  return buildTheme(intent, style);
};
