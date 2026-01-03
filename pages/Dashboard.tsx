import React, { useEffect, useState } from 'react';
import { store } from '../services/store';
import { Trip, City, TripIntent, SpendingStyle } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, Plus, Sparkles, RefreshCw, DollarSign, Compass, Plane, Wallet } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { buildTheme, ThemeConfig } from '../services/theme';
import { OnboardingModal } from '../components/OnboardingModal';
import { generateDashboardTemplates } from '../services/api';

const generateId = () => Math.random().toString(36).substr(2, 9);

interface TripTemplate {
  title: string;
  destination: string;
  days: number;
  description: string;
  intent: string;
  spendingStyle: string;
}

export const Dashboard = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [popularCities, setPopularCities] = useState<City[]>([]);
  const [templates, setTemplates] = useState<TripTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [theme, setTheme] = useState<ThemeConfig>(buildTheme(TripIntent.Business, SpendingStyle.Deluxe));
  
  const user = store.getCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    const updateAll = () => {
      setTrips(store.getTrips());
      setPopularCities(store.getAllCities().slice(0, 3));
      
      const prefs = store.getPreferences();
      if (prefs) {
        setTheme(buildTheme(prefs.intent, prefs.spendingStyle));
        setShowOnboarding(false);
      } else {
        setShowOnboarding(true);
      }
    };
    
    updateAll();
    loadTemplates();
    
    return store.subscribe(updateAll);
  }, []);

  const loadTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const aiTemplates = await generateDashboardTemplates();
      if (aiTemplates.length > 0) {
        setTemplates(aiTemplates);
      } else {
        throw new Error('No templates');
      }
    } catch (error) {
      // Fallback templates
      setTemplates([
        { title: 'Weekend in Paris', destination: 'Paris', days: 3, description: 'Romantic getaway with Eiffel Tower visit', intent: 'Nature', spendingStyle: 'Deluxe' },
        { title: 'Bali Beach Escape', destination: 'Bali', days: 7, description: 'Tropical paradise with beach resorts', intent: 'Beach', spendingStyle: 'Luxury' },
        { title: 'Tokyo Business Trip', destination: 'Tokyo', days: 5, description: 'Efficient business travel', intent: 'Business', spendingStyle: 'Minimalist' },
        { title: 'Swiss Alps Adventure', destination: 'Zurich', days: 6, description: 'Mountain hiking and scenic views', intent: 'HillStation', spendingStyle: 'Deluxe' },
        { title: 'New York Family Fun', destination: 'New York', days: 4, description: 'Family-friendly attractions', intent: 'Family', spendingStyle: 'Deluxe' },
        { title: 'Amazon Rainforest', destination: 'Manaus', days: 8, description: 'Nature exploration and wildlife', intent: 'Nature', spendingStyle: 'Luxury' }
      ]);
    }
    setLoadingTemplates(false);
  };

  const handleUseTemplate = (template: TripTemplate) => {
    const prefs = store.getPreferences();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + template.days);

    const newTrip: Trip = {
      id: generateId(),
      userId: user?.id || 'u1',
      title: template.title,
      description: template.description,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      coverImage: `https://picsum.photos/1200/400?random=${Math.floor(Math.random() * 100)}`,
      stops: [],
      isPublic: false,
      intent: prefs?.intent || TripIntent.Beach,
      spendingStyle: prefs?.spendingStyle || SpendingStyle.Deluxe
    };

    store.addTrip(newTrip);
    navigate(`/trips/${newTrip.id}`);
  };

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

  return (
    <>
      {showOnboarding && <OnboardingModal />}
      
      <div className="space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">You have {trips.length} upcoming trips scheduled.</p>
          </div>
          <Link to="/create-trip">
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl font-semibold shadow-lg shadow-brand-500/20 hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5 transition-all duration-200">
              <Plus className="h-4 w-4" /> Plan New Trip
            </button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-surface-800 rounded-2xl p-6 border border-gray-100 dark:border-surface-700 shadow-sm hover:shadow-md transition-shadow flex flex-row items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Trips</p>
              <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">{trips.length}</p>
            </div>
            <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-900/20">
              <Plane className="h-6 w-6 text-brand-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-surface-800 rounded-2xl p-6 border border-gray-100 dark:border-surface-700 shadow-sm hover:shadow-md transition-shadow flex flex-row items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Budget</p>
              <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">${totalBudget.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-surface-800 rounded-2xl p-6 border border-gray-100 dark:border-surface-700 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">Budget Usage</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Limit: $5,000</p>
              </div>
            </div>
            <div className="absolute right-0 top-0 bottom-0 opacity-60">
              <ResponsiveContainer width={100} height="100%">
                <PieChart>
                  <Pie
                    data={budgetData}
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={35}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#14b8a6" />
                    <Cell fill="#e2e8f0" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Your Trips */}
        <div>
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-4">Your Trips</h2>
          {trips.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-surface-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-surface-700">
              <div className="mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-3 bg-brand-50 dark:bg-brand-900/20">
                <Compass className="h-6 w-6 text-brand-500" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">No trips planned yet</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">Start exploring the world today.</p>
              <Link to="/create-trip">
                <button className="px-4 py-2 bg-gray-100 dark:bg-surface-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-surface-600 transition-colors">Create your first trip</button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map(trip => (
                <Link to={`/trips/${trip.id}`} key={trip.id} className="group block">
                  <div className="bg-white dark:bg-surface-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-surface-700 shadow-sm hover:shadow-lg transition-all duration-300 h-full">
                    <div className="h-48 w-full relative overflow-hidden">
                      <img src={trip.coverImage || 'https://picsum.photos/400/200'} alt={trip.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute top-3 right-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/90 dark:bg-surface-800/90 backdrop-blur-sm shadow-sm ${trip.isPublic ? 'text-green-600' : 'text-gray-700 dark:text-gray-300'}`}>
                          {trip.isPublic ? 'Public' : 'Private'}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-display font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{trip.title}</h3>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2 mb-4">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-surface-700">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{trip.stops.length} Cities</span>
                        <span className="text-brand-600 dark:text-brand-400 text-sm font-medium flex items-center">
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

        {/* AI-Generated Trip Templates */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-500" />
              <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">Ready-to-Go Itineraries</h2>
            </div>
            <button 
              onClick={loadTemplates}
              disabled={loadingTemplates}
              className="flex items-center px-3 py-1.5 bg-gray-100 dark:bg-surface-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-surface-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-2 ${loadingTemplates ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {loadingTemplates ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white dark:bg-surface-800 rounded-2xl p-5 h-48 animate-pulse border border-gray-100 dark:border-surface-700">
                  <div className="h-4 bg-gray-200 dark:bg-surface-700 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 dark:bg-surface-700 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-surface-700 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {templates.slice(0, 8).map((template, idx) => (
                <div 
                  key={idx}
                  className="bg-white dark:bg-surface-800 rounded-2xl p-5 border border-gray-100 dark:border-surface-700 hover:border-brand-300 dark:hover:border-brand-600 shadow-sm hover:shadow-md cursor-pointer group transition-all duration-200"
                  onClick={() => handleUseTemplate(template)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {template.title}
                    </h3>
                    <Sparkles className="h-4 w-4 text-brand-500 flex-shrink-0" />
                  </div>
                  <p className="text-sm text-brand-600 dark:text-brand-400 mb-2">{template.destination}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{template.description}</p>
                  <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-100 dark:border-surface-700">
                    <span className="text-gray-500 dark:text-gray-400">{template.days} days</span>
                    <span className="text-brand-600 dark:text-brand-400 font-medium">
                      Use Template <ArrowRight className="inline h-3 w-3 ml-1" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Popular Destinations */}
        {popularCities.length > 0 && (
          <div>
            <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-4">Popular Destinations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {popularCities.map(city => (
                <div key={city.id} className="relative rounded-2xl overflow-hidden aspect-[4/3] group cursor-pointer shadow-md hover:shadow-xl transition-shadow">
                  <img src={city.imageUrl} alt={city.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                    <h3 className="text-white font-display font-bold text-lg">{city.name}</h3>
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
        )}
      </div>
    </>
  );
};
