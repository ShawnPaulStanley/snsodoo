import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, DragEndEvent, DragOverlay } from '@dnd-kit/core';
import { store } from '../services/store';
import { Trip, Activity, TripIntent, SpendingStyle, CitySearchResult } from '../types';
import { useTripTheme } from '../hooks/useTripTheme';
import { ArrowLeft, MapPin, DollarSign, Sparkles } from 'lucide-react';
import { CitySearch } from '../components/CitySearch';
import ActivitySidebar from '../components/ActivitySidebar';
import { DayColumn } from '../components/DayColumn';
import { getCurrencyByCountry, getCurrencyRates } from '../services/api';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const TripDetailsNew = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | undefined>(store.getTrip(id || ''));
  const [selectedCity, setSelectedCity] = useState<CitySearchResult | null>(null);
  const [showActivitySidebar, setShowActivitySidebar] = useState(false);
  const [dayActivities, setDayActivities] = useState<Record<number, Activity[]>>({});
  const [activeItem, setActiveItem] = useState<Activity | null>(null);
  
  // Currency
  const [currency, setCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState(1);
  const [currencySymbol, setCurrencySymbol] = useState('$');

  const theme = useTripTheme(trip?.intent || TripIntent.Beach, trip?.spendingStyle || SpendingStyle.Deluxe);

  useEffect(() => {
    if (!trip) {
      const found = store.getTrip(id || '');
      if (found) setTrip(found);
      else navigate('/');
    }
  }, [id, trip, navigate]);

  // Auto-detect currency when city changes
  useEffect(() => {
    if (selectedCity) {
      const detectedCurrency = getCurrencyByCountry(selectedCity.country);
      setCurrency(detectedCurrency);
      
      // Fetch exchange rate
      getCurrencyRates('USD').then(rates => {
        setExchangeRate(rates[detectedCurrency] || 1);
      });

      // Set currency symbol (simplified)
      const symbols: Record<string, string> = {
        USD: '$', EUR: '€', GBP: '£', JPY: '¥', INR: '₹', AUD: 'A$', CAD: 'C$'
      };
      setCurrencySymbol(symbols[detectedCurrency] || '$');
    }
  }, [selectedCity]);

  if (!trip) return <div>Loading...</div>;

  // Calculate days
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const days = Array.from({ length: dayCount }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0];
  });

  const handleDragStart = (event: any) => {
    setActiveItem(event.active.data);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveItem(null);
      return;
    }

    const dayMatch = over.id.toString().match(/day-(\d+)/);
    if (dayMatch) {
      const dayIndex = parseInt(dayMatch[1]);
      const activity = active.data as Activity;
      
      // Add activity to day
      setDayActivities(prev => ({
        ...prev,
        [dayIndex]: [...(prev[dayIndex] || []), { ...activity, dayIndex }]
      }));
    }

    setActiveItem(null);
  };

  const handleRemoveActivity = (dayIndex: number, activityId: string) => {
    setDayActivities(prev => ({
      ...prev,
      [dayIndex]: (prev[dayIndex] || []).filter(a => a.id !== activityId)
    }));
  };

  const handleCitySelect = (city: CitySearchResult) => {
    setSelectedCity(city);
    setShowActivitySidebar(true);
  };

  // Calculate total budget in selected currency
  const totalBudget = (Object.values(dayActivities) as Activity[][])
    .flat()
    .reduce((sum: number, act: Activity) => sum + (act.estimatedCost || act.cost || 0), 0) * exchangeRate;

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-gray-50 dark:bg-surface-900 pb-20">
        {/* Header */}
        <div className="bg-white dark:bg-surface-800 border-b border-gray-100 dark:border-surface-700 sticky top-14 z-30 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <button 
              onClick={() => navigate('/my-trips')} 
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-3 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Trips
            </button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-1">{trip.title}</h1>
                <p className="text-gray-500 dark:text-gray-400">{trip.description}</p>
              </div>
              
              {selectedCity && (
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Budget</div>
                    <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                      {currencySymbol}{totalBudget.toFixed(2)} {currency}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowActivitySidebar(!showActivitySidebar)}
                    className="px-4 py-2 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-lg font-semibold hover:shadow-md transition-all"
                  >
                    <Sparkles className="h-4 w-4 inline mr-2" />
                    {showActivitySidebar ? 'Hide' : 'Show'} Activities
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`max-w-7xl mx-auto px-6 py-8 ${showActivitySidebar ? 'pr-[416px]' : ''} transition-all`}>
          {/* City Search */}
          {!selectedCity && (
            <div className="bg-white dark:bg-surface-800 rounded-2xl p-8 shadow-lg max-w-2xl mx-auto border border-gray-100 dark:border-surface-700">
              <div className="text-center mb-6">
                <MapPin className="h-12 w-12 text-brand-500 mx-auto mb-3" />
                <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-2">Where are you going?</h2>
                <p className="text-gray-500 dark:text-gray-400">Search for your destination city</p>
              </div>
              <CitySearch 
                onCitySelect={handleCitySelect}
                placeholder="Search for a city (e.g., Paris, Tokyo, Bali)..."
              />
            </div>
          )}

          {/* Calendar View with Drag & Drop */}
          {selectedCity && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="h-6 w-6 text-brand-500" />
                <div>
                  <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">{selectedCity.name}, {selectedCity.country}</h2>
                  <p className="text-gray-500 dark:text-gray-400">{dayCount} days - {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Day Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {days.map((date, index) => (
                  <DayColumn
                    key={index}
                    dayIndex={index}
                    date={date}
                    activities={dayActivities[index] || []}
                    onRemoveActivity={(activityId) => handleRemoveActivity(index, activityId)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Activity Sidebar */}
        {showActivitySidebar && selectedCity && (
          <div className="fixed right-0 top-14 bottom-0 w-96 z-40">
            <ActivitySidebar
              city={selectedCity.name}
              lat={selectedCity.lat}
              lon={selectedCity.lon}
              intent={trip.intent}
              spendingStyle={trip.spendingStyle}
            />
          </div>
        )}

        {/* Drag Overlay */}
        <DragOverlay>
          {activeItem ? (
            <div className="bg-white p-3 rounded-lg border-2 border-cyan-500 shadow-2xl opacity-90">
              <h4 className="font-semibold text-sm">{activeItem.name || activeItem.title}</h4>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
};
