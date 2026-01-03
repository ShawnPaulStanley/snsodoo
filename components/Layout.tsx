import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { store } from '../services/store';
import { LayoutDashboard, Map, User as UserIcon, LogOut, PlusCircle, Globe } from 'lucide-react';
import { Button } from './ui';

export const Layout = ({ children }: { children?: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = store.getCurrentUser();

  const handleLogout = () => {
    store.logout().then(() => navigate('/login'));
  };

  if (!user && location.pathname !== '/login' && location.pathname !== '/signup') {
     // A simple redirect check (in a real app this would be a protected route wrapper)
     React.useEffect(() => {
        navigate('/login');
     }, [navigate]);
     return null;
  }

  // If on auth pages, render without sidebar
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-2 font-bold text-brand-600 text-xl">
           <Globe className="h-6 w-6" /> GlobeTrotter
        </div>
        <button onClick={() => {}} className="text-slate-600">
           <UserIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0 z-10">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 font-bold text-brand-600 text-2xl">
            <Globe className="h-8 w-8" /> GlobeTrotter
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavLink to="/" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </NavLink>
          <NavLink to="/create-trip" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
            <PlusCircle className="h-5 w-5" />
            Plan New Trip
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
            <UserIcon className="h-5 w-5" />
            My Profile
          </NavLink>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img src={user?.avatar} alt={user?.name} className="h-10 w-10 rounded-full object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700" onClick={handleLogout}>
            <LogOut className="h-5 w-5 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 z-20">
         <NavLink to="/" className={({isActive}) => `flex flex-col items-center p-2 rounded-lg ${isActive ? 'text-brand-600' : 'text-slate-500'}`}>
            <LayoutDashboard className="h-6 w-6" />
            <span className="text-[10px] mt-1">Home</span>
         </NavLink>
         <NavLink to="/create-trip" className={({isActive}) => `flex flex-col items-center p-2 rounded-lg ${isActive ? 'text-brand-600' : 'text-slate-500'}`}>
            <PlusCircle className="h-6 w-6" />
            <span className="text-[10px] mt-1">Plan</span>
         </NavLink>
         <NavLink to="/profile" className={({isActive}) => `flex flex-col items-center p-2 rounded-lg ${isActive ? 'text-brand-600' : 'text-slate-500'}`}>
            <UserIcon className="h-6 w-6" />
            <span className="text-[10px] mt-1">Profile</span>
         </NavLink>
      </nav>
    </div>
  );
};