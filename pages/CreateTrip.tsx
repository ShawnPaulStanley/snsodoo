import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { store } from '../services/store';
import { Trip, TripIntent, SpendingStyle, CitySearchResult } from '../types';
import { Calendar, MapPin, Sparkles, Loader2, Search } from 'lucide-react';
import { buildTheme } from '../services/theme';
import { CitySearch } from '../components/CitySearch';
import { generateTripRecommendations } from '../services/api';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const CreateTrip = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCity, setSelectedCity] = useState<CitySearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  
  // Get user's theme preference
  const prefs = store.getPreferences();
  const theme = buildTheme(prefs?.intent || TripIntent.Business, prefs?.spendingStyle || SpendingStyle.Deluxe);

  // Generate AI suggestion when city is selected
  const handleGenerateItinerary = async () => {
    if (!selectedCity || !startDate || !endDate) return;
    
    setLoadingAI(true);
    const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    try {
      const suggestion = await generateTripRecommendations(
        selectedCity.name,
        prefs?.intent || 'Beach',
        prefs?.spendingStyle || 'Deluxe',
        days
      );
      setAiSuggestion(suggestion);
      if (!description) {
        setDescription(`Trip to ${selectedCity.name}, ${selectedCity.country}`);
      }
    } catch (error) {
      console.error('Failed to generate AI suggestion:', error);
    }
    setLoadingAI(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate || !endDate) return;
    
    setLoading(true);

    const newTrip: Trip = {
      id: generateId(),
      userId: store.getCurrentUser()?.id || 'u1',
      title,
      description,
      startDate,
      endDate,
      coverImage: `https://picsum.photos/1200/400?random=${Math.floor(Math.random() * 100)}`,
      stops: [],
      isPublic: false,
      intent: prefs?.intent || TripIntent.Beach,
      spendingStyle: prefs?.spendingStyle || SpendingStyle.Deluxe
    };

    store.addTrip(newTrip);
    
    setTimeout(() => {
      setLoading(false);
      navigate(`/trips/${newTrip.id}`);
    }, 500);
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className={`text-3xl ${theme.headerFont} ${theme.headerStyle} ${theme.textColor}`}>
          Plan a New Trip
        </h1>
        <p className={theme.mutedText}>Start your next adventure</p>
      </div>

      <div className={`${theme.card} ${theme.cardHover}`}>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Destination Search */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${theme.textColor} border-b ${theme.divider} pb-2 flex items-center gap-2`}>
              <Search className={`h-5 w-5 ${theme.iconStyle}`} />
              Where to?
            </h3>
            <CitySearch 
              onCitySelect={(city) => {
                setSelectedCity(city);
                if (!title) setTitle(`Trip to ${city.name}`);
              }}
              placeholder="Search for a destination..."
            />
          </div>

          {/* Trip Details */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${theme.textColor} border-b ${theme.divider} pb-2`}>
              Trip Details
            </h3>
            
            <div>
              <label className={`block text-sm font-medium ${theme.textColor} mb-1`}>Trip Name</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Summer in Italy"
                className={theme.input}
                required
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${theme.textColor} mb-1`}>Description</label>
              <textarea
                className={`${theme.input} min-h-[100px]`}
                rows={3}
                placeholder="What's the goal of this trip?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${theme.textColor} mb-1`}>
                  <Calendar className={`h-4 w-4 inline mr-1 ${theme.iconStyle}`} />
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={theme.input}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${theme.textColor} mb-1`}>
                  <Calendar className={`h-4 w-4 inline mr-1 ${theme.iconStyle}`} />
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={theme.input}
                  required
                />
              </div>
            </div>
          </div>

          {/* AI Suggestions */}
          {selectedCity && startDate && endDate && (
            <div className="space-y-4">
              <div className={`flex items-center justify-between border-b ${theme.divider} pb-2`}>
                <h3 className={`text-lg font-semibold ${theme.textColor}`}>
                  <Sparkles className={`h-5 w-5 inline mr-2 ${theme.iconStyle}`} />
                  AI Suggestions
                </h3>
                <button
                  type="button"
                  onClick={handleGenerateItinerary}
                  disabled={loadingAI}
                  className={theme.buttonSecondary}
                >
                  {loadingAI ? (
                    <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                  ) : (
                    <Sparkles className="h-4 w-4 inline mr-2" />
                  )}
                  Generate Ideas
                </button>
              </div>
              
              {aiSuggestion && (
                <div className={`${theme.surfaceSecondary} ${theme.borderRadius} p-4 border ${theme.border}`}>
                  <pre className={`whitespace-pre-wrap text-sm ${theme.textColor} font-sans`}>
                    {aiSuggestion}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className={theme.buttonSecondary}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title || !startDate || !endDate}
              className={`flex-1 ${theme.buttonPrimary} disabled:opacity-50`}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin inline mr-2" />
              ) : (
                <MapPin className="h-5 w-5 inline mr-2" />
              )}
              Create Trip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
