import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { store } from '../services/store';
import { LayoutDashboard, Map, User as UserIcon, PlusCircle, Sun, Moon } from 'lucide-react';
import { buildTheme, ThemeConfig } from '../services/theme';
import { TripIntent, SpendingStyle } from '../types';

export const Layout = ({ children }: { children?: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = store.getCurrentUser();
  const [theme, setTheme] = useState<ThemeConfig>(buildTheme(TripIntent.Business, SpendingStyle.Deluxe));
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('gt_darkMode');
    return saved ? saved === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark mode class to HTML element
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('gt_darkMode', String(isDark));
  }, [isDark]);

  // Update theme when preferences change
  useEffect(() => {
    const updateTheme = () => {
      const prefs = store.getPreferences();
      if (prefs) {
        setTheme(buildTheme(prefs.intent, prefs.spendingStyle));
      }
    };
    
    updateTheme();
    return store.subscribe(updateTheme);
  }, []);

  useEffect(() => {
    if (!user && location.pathname !== '/login' && location.pathname !== '/signup') {
      navigate('/login');
    }
  }, [user, location.pathname, navigate]);

  if (!user && location.pathname !== '/login' && location.pathname !== '/signup') {
    return null;
  }

  if (location.pathname === '/login' || location.pathname === '/signup') {
    return <>{children}</>;
  }

  const toggleDarkMode = () => setIsDark(!isDark);

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-surface-900 font-sans text-gray-900 dark:text-white transition-colors duration-300`}>
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 py-3 bg-white/80 dark:bg-surface-800/80 backdrop-blur-xl border-b border-gray-100 dark:border-surface-700">
        <div className="flex items-center justify-between max-w-7xl mx-auto px-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Map className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight hidden sm:block">GlobeTrotter</span>
          </div>

          {/* Pill Navigation */}
          <div className="hidden md:flex items-center gap-1 bg-gray-100 dark:bg-surface-700 rounded-2xl p-1.5 shadow-inner">
            <NavLink 
              to="/" 
              className={({isActive}) => `flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive ? 'bg-white dark:bg-surface-600 text-brand-600 dark:text-brand-400 shadow-md' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Home
            </NavLink>
            <NavLink 
              to="/my-trips" 
              className={({isActive}) => `flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive ? 'bg-white dark:bg-surface-600 text-brand-600 dark:text-brand-400 shadow-md' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <Map className="h-4 w-4" />
              My Trips
            </NavLink>
            <NavLink 
              to="/create-trip" 
              className={({isActive}) => `flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive ? 'bg-white dark:bg-surface-600 text-brand-600 dark:text-brand-400 shadow-md' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <PlusCircle className="h-4 w-4" />
              Plan Trip
            </NavLink>
            <NavLink 
              to="/profile" 
              className={({isActive}) => `flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive ? 'bg-white dark:bg-surface-600 text-brand-600 dark:text-brand-400 shadow-md' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <UserIcon className="h-4 w-4" />
              Profile
            </NavLink>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl bg-gray-100 dark:bg-surface-700 hover:bg-gray-200 dark:hover:bg-surface-600 text-gray-600 dark:text-gray-300 transition-all duration-200 hover:scale-105 active:scale-95"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="scroll-smooth pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto p-4 md:p-8 py-8 space-y-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-surface-800/80 backdrop-blur-xl border-t border-gray-100 dark:border-surface-700 flex justify-around p-2 z-50">
        <NavLink to="/" className={({isActive}) => `flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500 dark:text-gray-400'}`}>
          <LayoutDashboard className="h-6 w-6" />
          <span className="text-[10px] mt-1 font-medium">Home</span>
        </NavLink>
        <NavLink to="/my-trips" className={({isActive}) => `flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500 dark:text-gray-400'}`}>
          <Map className="h-6 w-6" />
          <span className="text-[10px] mt-1 font-medium">Trips</span>
        </NavLink>
        <NavLink to="/create-trip" className={({isActive}) => `flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500 dark:text-gray-400'}`}>
          <PlusCircle className="h-6 w-6" />
          <span className="text-[10px] mt-1 font-medium">Plan</span>
        </NavLink>
        <NavLink to="/profile" className={({isActive}) => `flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500 dark:text-gray-400'}`}>
          <UserIcon className="h-6 w-6" />
          <span className="text-[10px] mt-1 font-medium">Profile</span>
        </NavLink>
      </nav>
    </div>
  );
};