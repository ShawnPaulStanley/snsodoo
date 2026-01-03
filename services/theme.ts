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
    // Clean, modern background - Deep Charcoal
    wrapper: 'min-h-screen bg-[#0D0D0D] text-white transition-colors duration-300',
    pageBackground: 'bg-[#0D0D0D]',
    
    // Modern typography - Anton & Inter
    fontFamily: 'font-sans',
    headerFont: 'font-display uppercase tracking-wide',
    headerStyle: 'font-display uppercase tracking-wide text-white',
    textColor: 'text-white',
    mutedText: 'text-gray-400',
    
    // Clean cards with subtle borders - Dark Olive Green
    card: 'bg-[#2B2F23] border border-white/10 rounded-3xl shadow-lg',
    cardHover: 'hover:border-[#D7FF00] transition-all duration-300',
    surfacePrimary: 'bg-[#0D0D0D]',
    surfaceSecondary: 'bg-[#2B2F23]',
    
    // Primary Brand Color: Fluorescent Yellow-Green
    buttonPrimary: 'bg-[#D7FF00] hover:bg-[#C7FF3D] text-[#0D0D0D] font-bold uppercase tracking-wider px-6 py-3 rounded-full transition-all shadow-[0_0_15px_rgba(215,255,0,0.3)] hover:shadow-[0_0_25px_rgba(215,255,0,0.5)]',
    buttonSecondary: 'bg-transparent text-white border border-white/20 hover:bg-white/10 font-bold uppercase tracking-wider px-6 py-3 rounded-full transition-colors',
    buttonDanger: 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 px-6 py-3 rounded-full transition-colors',
    
    // Inputs
    input: 'w-full px-5 py-4 rounded-2xl border border-white/10 bg-[#2B2F23] text-white placeholder-gray-500 focus:outline-none transition-all',
    inputFocus: 'focus:border-[#D7FF00] focus:ring-1 focus:ring-[#D7FF00]',
    
    // Accents
    accent: 'text-[#D7FF00]',
    accentBg: 'bg-[#D7FF00]',
    accentBorder: 'border-[#D7FF00]',
    highlight: 'bg-[#C7FF3D]',
    
    // Navigation
    navBg: 'bg-[#0D0D0D]/90 backdrop-blur-xl border-b border-white/5',
    navItem: 'text-gray-400 hover:text-[#D7FF00] transition-colors font-medium uppercase tracking-wide text-sm',
    navItemActive: 'text-[#D7FF00]',
    
    // Layout
    borderRadius: 'rounded-3xl',
    spacing: 'relaxed',
    shadow: 'shadow-2xl shadow-black/50',
    
    // Special Effects
    gradient: 'bg-gradient-to-br from-[#D7FF00] to-[#C7FF3D]',
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
