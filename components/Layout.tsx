import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { store } from '../services/store';
import { LayoutDashboard, Map, User as UserIcon, PlusCircle, Sun, Moon } from 'lucide-react';
import { buildTheme } from '../services/theme';

export const Layout = ({ children }: { children?: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = store.getCurrentUser();
  // Use static theme
  const theme = buildTheme();
  
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('gt_darkMode');
    return saved ? saved === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark mode class to HTML element
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('gt_darkMode', String(isDark));
  }, [isDark]);

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
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-white transition-colors duration-300`}>
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between max-w-7xl mx-auto px-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Map className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight hidden sm:block text-slate-900 dark:text-white">trvl</span>
          </div>

          {/* Pill Navigation */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-2xl p-1.5 shadow-inner">
            <NavLink 
              to="/dashboard" 
              className={({isActive}) => `flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Home
            </NavLink>
            <NavLink 
              to="/my-trips" 
              className={({isActive}) => `flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <Map className="h-4 w-4" />
              My Trips
            </NavLink>
            <NavLink 
              to="/create-trip" 
              className={({isActive}) => `flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <PlusCircle className="h-4 w-4" />
              Plan Trip
            </NavLink>
            <NavLink 
              to="/profile" 
              className={({isActive}) => `flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <UserIcon className="h-4 w-4" />
              Profile
            </NavLink>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 flex justify-around p-2 z-50">
        <NavLink to="/dashboard" className={({isActive}) => `flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
          <LayoutDashboard className="h-6 w-6" />
          <span className="text-[10px] mt-1 font-medium">Home</span>
        </NavLink>
        <NavLink to="/my-trips" className={({isActive}) => `flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
          <Map className="h-6 w-6" />
          <span className="text-[10px] mt-1 font-medium">Trips</span>
        </NavLink>
        <NavLink to="/create-trip" className={({isActive}) => `flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
          <PlusCircle className="h-6 w-6" />
          <span className="text-[10px] mt-1 font-medium">Plan</span>
        </NavLink>
        <NavLink to="/profile" className={({isActive}) => `flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
          <UserIcon className="h-6 w-6" />
          <span className="text-[10px] mt-1 font-medium">Profile</span>
        </NavLink>
      </nav>
    </div>
  );
};