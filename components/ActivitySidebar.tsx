import React, { useState, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Activity } from '../types';
import { generateActivitySuggestions, searchPlaces } from '../services/api';
import { Zap, MapPin, RefreshCw, AlertCircle, Loader2, Clock, DollarSign, Sparkles, Navigation, GripVertical } from 'lucide-react';

interface DraggableActivityProps {
  activity: Activity;
}

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'Sightseeing': 'from-amber-500 to-orange-500',
    'Food': 'from-rose-500 to-pink-500',
    'Adventure': 'from-emerald-500 to-teal-500',
    'Culture': 'from-violet-500 to-purple-500',
    'Shopping': 'from-blue-500 to-indigo-500',
    'Relaxation': 'from-cyan-500 to-sky-500',
    'Park': 'from-green-500 to-emerald-500',
    'Museum': 'from-indigo-500 to-violet-500',
    'Market': 'from-orange-500 to-amber-500',
    'Landmark': 'from-purple-500 to-pink-500',
  };
  return colors[category] || 'from-slate-500 to-gray-500';
};

const DraggableActivity: React.FC<DraggableActivityProps> = ({ activity }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: activity.id,
    data: activity,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`group relative p-4 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-300 
        bg-white dark:bg-surface-800 border border-gray-100 dark:border-surface-700
        hover:shadow-lg hover:shadow-brand-500/10 dark:hover:shadow-brand-400/5
        hover:border-brand-200 dark:hover:border-brand-700 hover:-translate-y-0.5
        ${isDragging ? 'opacity-50 scale-95 rotate-2 z-50' : 'opacity-100'}`}
    >
      {/* Drag Handle */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 transition-opacity">
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>
      
      {/* Category Badge */}
      <div className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-gradient-to-r ${getCategoryColor(activity.category)} shadow-sm`}>
        {activity.category}
      </div>
      
      <div className="flex items-start gap-3 pl-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${getCategoryColor(activity.category)} flex items-center justify-center shadow-sm`}>
          <MapPin className="w-5 h-5 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight mb-1 truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            {activity.name}
          </h4>
          {activity.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {activity.description}
            </p>
          )}
          
          <div className="flex items-center gap-3 mt-2">
            {activity.estimatedCost !== undefined && (
              <span className="inline-flex items-center gap-1 text-[11px] text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-surface-700 px-2 py-0.5 rounded-full">
                <DollarSign className="w-3 h-3" />
                {activity.estimatedCost}
              </span>
            )}
            {activity.estimatedDuration && (
              <span className="inline-flex items-center gap-1 text-[11px] text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-surface-700 px-2 py-0.5 rounded-full">
                <Clock className="w-3 h-3" />
                {Math.round(activity.estimatedDuration / 60)}h
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Drag hint */}
      <div className="absolute inset-0 rounded-xl border-2 border-dashed border-brand-400 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
    </div>
  );
};

interface ActivitySidebarProps {
  city: string;
  intent?: string;
  spendingStyle?: string;
  lat?: number;
  lon?: number;
}

const ActivitySidebar: React.FC<ActivitySidebarProps> = ({ city, intent, spendingStyle, lat, lon }) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'places'>('ai');
  const [aiActivities, setAiActivities] = useState<Activity[]>([]);
  const [realPlaces, setRealPlaces] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadActivities = async () => {
    if (!city) return;
    
    setLoading(true);
    setError(null);
    console.log('Loading activities for:', city, { intent, spendingStyle });
    
    try {
      // Load AI suggestions
      const aiResults = await generateActivitySuggestions(city, intent, spendingStyle);
      console.log('AI Results:', aiResults);
      setAiActivities(aiResults);
      
      // Load real places
      const placeResults = await searchPlaces(city, lat, lon);
      console.log('Place Results:', placeResults);
      setRealPlaces(placeResults);
    } catch (err) {
      console.error('Failed to load activities:', err);
      setError('Failed to load suggestions. Click refresh to try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [city, intent, spendingStyle]);

  const currentActivities = activeTab === 'ai' ? aiActivities : realPlaces;

  return (
    <div className="h-full flex flex-col bg-gray-50/50 dark:bg-surface-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-surface-800 shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-surface-800 bg-white dark:bg-surface-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-display font-bold text-gray-900 dark:text-white">Activities</h3>
          </div>
          <button
            onClick={loadActivities}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-700 text-gray-500 dark:text-gray-400 transition-colors disabled:opacity-50"
            title="Refresh activities"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-surface-700 rounded-xl">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'ai'
                ? 'bg-white dark:bg-surface-600 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            AI Suggestions
          </button>
          <button
            onClick={() => setActiveTab('places')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'places'
                ? 'bg-white dark:bg-surface-600 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Navigation className="w-4 h-4" />
            Real Places
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500 mb-3" />
            <p className="text-sm font-medium">Finding activities...</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Powered by AI</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{error}</p>
            <button
              onClick={loadActivities}
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : currentActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-surface-700 flex items-center justify-center mb-3">
              <MapPin className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">No activities found</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {city ? 'Try refreshing or switch tabs' : 'Select a destination first'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentActivities.map((activity, index) => (
              <div 
                key={activity.id} 
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <DraggableActivity activity={activity} />
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer hint */}
      <div className="p-3 border-t border-gray-100 dark:border-surface-800 bg-white/50 dark:bg-surface-800/50">
        <p className="text-xs text-center text-gray-400 dark:text-gray-500">
          Drag activities to your itinerary
        </p>
      </div>
    </div>
  );
};

export default ActivitySidebar;
