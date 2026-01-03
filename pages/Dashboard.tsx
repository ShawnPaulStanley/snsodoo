import React, { useEffect, useState } from 'react';
import { store } from '../services/store';
import { Trip, City } from '../types';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, Plus } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useAppTheme } from '../hooks/useTripTheme';
import { OnboardingModal } from '../components/OnboardingModal';

export const Dashboard = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [popularCities, setPopularCities] = useState<City[]>([]);
  const user = store.getCurrentUser();
  const theme = useAppTheme();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    setTrips(store.getTrips());
    setPopularCities(store.getAllCities().slice(0, 3));
    
    // Check preferences for Onboarding
    if (!store.getPreferences()) {
        setShowOnboarding(true);
    }
    
    return store.subscribe(() => {
      setTrips(store.getTrips());
      if (store.getPreferences()) {
          setShowOnboarding(false);
      }
    });
  }, []);

  const totalBudget = trips.reduce((acc, trip) => {
    const tripCost = trip.stops.reduce((stopAcc, stop) => {
      return stopAcc + stop.activities.reduce((actAcc, act) => actAcc + act.cost, 0);
    }, 0);
    return acc + tripCost;
  }, 0);

  const budgetData = [
    { name: 'Spent', value: totalBudget },
    { name: 'Remaining', value: 5000 - totalBudget },
  ];
  const COLORS = ['#0284c7', '#e2e8f0'];

  // --- Styled Components Helper (using theme) ---
  const DashboardCard = ({ children, className = '', noPadding = false }: any) => (
      <div className={`${theme.card} ${className} ${noPadding ? '!p-0' : ''}`}>
          {children}
      </div>
  );

  return (
    <>
    {showOnboarding && <OnboardingModal />}
    
    <div className={`space-y-8 animate-fade-in ${theme.animation}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={theme.header}>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="opacity-60 font-medium">You have {trips.length} upcoming trips scheduled.</p>
        </div>
        <Link to="/create-trip">
          <button className={theme.button}>
            <Plus className="h-4 w-4 mr-2 inline" /> Plan New Trip
          </button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard className="flex flex-row items-center justify-between">
          <div>
            <p className={theme.subheadings}>Total Trips</p>
            <p className={`text-2xl mt-1 ${theme.headings}`}>{trips.length}</p>
          </div>
          <div className={`p-3 rounded-full ${theme.accentBg} ${theme.accent}`}>
            <MapPin className="h-6 w-6" />
          </div>
        </DashboardCard>
        
        <DashboardCard className="flex flex-row items-center justify-between">
           <div>
            <p className={theme.subheadings}>Total Budget Est.</p>
            <p className={`text-2xl mt-1 ${theme.headings}`}>${totalBudget.toLocaleString()}</p>
          </div>
          <div className="bg-green-100 p-3 rounded-full text-green-600">
             <div className="h-6 w-6 flex items-center justify-center font-bold">$</div>
          </div>
        </DashboardCard>

        <DashboardCard className="flex flex-col justify-center h-32 relative" noPadding>
             <div className="absolute inset-0 flex items-center px-6 justify-between z-10 pointer-events-none">
                <div>
                   <p className={theme.subheadings}>Budget Usage</p>
                   <p className="text-sm opacity-60">Limit: $5,000</p>
                </div>
             </div>
             <div className="h-full w-full opacity-50 absolute right-0 top-0 pointer-events-none">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={budgetData}
                      cx="80%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={40}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {budgetData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
             </div>
        </DashboardCard>
      </div>

      {/* Upcoming Trips */}
      <div>
        <h2 className={`${theme.headings} mb-4`}>Your Trips</h2>
        {trips.length === 0 ? (
          <div className={`text-center py-12 ${theme.card} border-dashed opacity-80`}>
            <div className={`mx-auto h-12 w-12 opacity-50 rounded-full flex items-center justify-center mb-3 bg-black/5`}>
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className={`text-sm font-medium ${theme.headings}`}>No trips planned yet</h3>
            <p className="text-sm opacity-60 mt-1 mb-4">Start exploring the world today.</p>
            <Link to="/create-trip"><button className={theme.buttonSecondary}>Create your first trip</button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map(trip => (
              <Link to={`/trips/${trip.id}`} key={trip.id} className="group block">
                <div className={`${theme.card} !p-0 h-full hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1`}>
                  <div className="h-48 w-full relative">
                    <img src={trip.coverImage || 'https://picsum.photos/400/200'} alt={trip.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3">
                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm shadow-sm ${trip.isPublic ? 'text-green-700' : 'text-slate-700'}`}>
                           {trip.isPublic ? 'Public' : 'Private'}
                       </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className={`text-lg transition-colors ${theme.headings} group-hover:${theme.accent}`}>{trip.title}</h3>
                    </div>
                    <div className="flex items-center text-sm opacity-60 mb-4">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-black/5">
                      <span className="text-sm opacity-60">{trip.stops.length} Cities</span>
                      <span className={`${theme.accent} text-sm font-medium flex items-center`}>
                        View Itinerary <ArrowRight className="h-4 w-4 ml-1" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Popular Destinations */}
      <div>
        <h2 className={`${theme.headings} mb-4`}>Popular Destinations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {popularCities.map(city => (
            <div key={city.id} className={`relative ${theme.borderRadius} overflow-hidden aspect-[4/3] group cursor-pointer shadow-md`}>
              <img src={city.imageUrl} alt={city.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                <h3 className="text-white font-bold text-lg font-serif">{city.name}</h3>
                <p className="text-white/80 text-sm">{city.country}</p>
                <div className="mt-2 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-xs ${i < city.costIndex ? 'text-yellow-400' : 'text-white/30'}`}>$</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
};