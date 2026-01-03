import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { store } from '../services/store';
import { LayoutDashboard, Map, User as UserIcon, LogOut, PlusCircle, Globe } from 'lucide-react';
import { Button } from './ui';
import { useAppTheme } from '../hooks/useTripTheme';

export const Layout = ({ children }: { children?: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = store.getCurrentUser();
  const theme = useAppTheme();

  const handleLogout = () => {
    store.logout().then(() => navigate('/login'));
  };

  if (!user && location.pathname !== '/login' && location.pathname !== '/signup') {
     React.useEffect(() => {
        navigate('/login');
     }, [navigate]);
     return null;
  }

  if (location.pathname === '/login' || location.pathname === '/signup') {
    return <>{children}</>;
  }

  // Helper for NavLink styles
  const navLinkClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? `${theme.accentBg} ${theme.accent}` : 'opacity-60 hover:opacity-100 hover:bg-black/5'}`;

  return (
    <div className={`flex flex-col md:flex-row ${theme.wrapper}`}>
      {/* Mobile Header */}
      <div className={`md:hidden ${theme.card} !rounded-none border-b !border-black/5 p-4 flex justify-between items-center sticky top-0 z-20`}>
        <div className={`flex items-center gap-2 font-bold text-xl ${theme.icons}`}>
           <Globe className="h-6 w-6" /> GlobeTrotter
        </div>
        <button className="opacity-60">
           <UserIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Sidebar Navigation (Desktop) */}
      <aside className={`hidden md:flex flex-col w-64 ${theme.card} !rounded-none border-r !border-black/5 h-screen sticky top-0 z-10`}>
        <div className="p-6 border-b border-black/5">
          <div className={`flex items-center gap-2 font-bold text-2xl ${theme.icons}`}>
            <Globe className="h-8 w-8" /> GlobeTrotter
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavLink to="/" className={navLinkClass}>
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </NavLink>
          <NavLink to="/my-trips" className={navLinkClass}>
            <Map className="h-5 w-5" />
            My Trips
          </NavLink>
          <NavLink to="/create-trip" className={navLinkClass}>
            <PlusCircle className="h-5 w-5" />
            Plan New Trip
          </NavLink>
          <NavLink to="/profile" className={navLinkClass}>
            <UserIcon className="h-5 w-5" />
            My Profile
          </NavLink>
        </nav>

        <div className="p-4 border-t border-black/5">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img src={user?.avatar} alt={user?.name} className={`h-10 w-10 object-cover ${theme.borderRadius}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs opacity-60 truncate">{user?.email}</p>
            </div>
          </div>
          <button className={`w-full flex items-center justify-start px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors`} onClick={handleLogout}>
            <LogOut className="h-5 w-5 mr-2" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className={`max-w-7xl mx-auto p-4 md:p-8 ${theme.layoutDensity === 'relaxed' ? 'py-12' : ''}`}>
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 ${theme.card} !rounded-none border-t !border-black/5 flex justify-around p-3 z-20`}>
         <NavLink to="/" className={({isActive}) => `flex flex-col items-center p-2 rounded-lg ${isActive ? theme.accent : 'opacity-50'}`}>
            <LayoutDashboard className="h-6 w-6" />
            <span className="text-[10px] mt-1">Home</span>
         </NavLink>
         <NavLink to="/create-trip" className={({isActive}) => `flex flex-col items-center p-2 rounded-lg ${isActive ? theme.accent : 'opacity-50'}`}>
            <PlusCircle className="h-6 w-6" />
            <span className="text-[10px] mt-1">Plan</span>
         </NavLink>
         <NavLink to="/profile" className={({isActive}) => `flex flex-col items-center p-2 rounded-lg ${isActive ? theme.accent : 'opacity-50'}`}>
            <UserIcon className="h-6 w-6" />
            <span className="text-[10px] mt-1">Profile</span>
         </NavLink>
      </nav>
    </div>
  );
};