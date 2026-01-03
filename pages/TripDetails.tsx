import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { store } from '../services/store';
import { Trip, TripStop, Activity, ActivityType, City } from '../types';
import { MapPin, Calendar, Plus, Trash2, Clock, Utensils, Bed, Bus, Activity as ActivityIcon, Share2, Search, ArrowLeft, Save, IndianRupee } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { getCurrencyRates } from '../services/api';

const generateId = () => Math.random().toString(36).substr(2, 9);
const DEFAULT_INR_RATE = 83.5;

export const TripDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | undefined>(store.getTrip(id || ''));
  const [activeTab, setActiveTab] = useState<'itinerary' | 'budget' | 'settings'>('itinerary');
  const [isAddingCity, setIsAddingCity] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [newActivity, setNewActivity] = useState<Partial<Activity>>({ type: ActivityType.Activity, cost: 0 });

  const [inrRate, setInrRate] = useState(DEFAULT_INR_RATE);
  const [displayCurrency, setDisplayCurrency] = useState('INR');

  const cities = store.getAllCities();

  useEffect(() => {
    if (!trip) {
      const found = store.getTrip(id || '');
      if (found) setTrip(found);
      else navigate('/my-trips');
    }
  }, [id, trip, navigate]);

  useEffect(() => {
    const loadRates = async () => {
      const rates = await getCurrencyRates('USD');
      if (rates && rates['INR']) setInrRate(rates['INR']);
    };
    loadRates();
  }, []);

  if (!trip) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-surface-900">
      <div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full"></div>
    </div>
  );

  const toINR = (usd: number) => Math.round(usd * inrRate);

  const handleUpdateTrip = (updated: Trip) => {
    store.updateTrip(updated);
    setTrip({...updated});
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    if (trip) store.updateTrip(trip);
    setTimeout(() => { setSaving(false); setHasChanges(false); }, 500);
  };

  const handleAddStop = (city: City) => {
    const newStop: TripStop = {
      id: generateId(), tripId: trip.id, city,
      arrivalDate: trip.startDate, departureDate: trip.startDate, activities: []
    };
    handleUpdateTrip({ ...trip, stops: [...trip.stops, newStop] });
    setIsAddingCity(false);
    setCitySearchQuery('');
  };

  const handleRemoveStop = (stopId: string) => {
    handleUpdateTrip({ ...trip, stops: trip.stops.filter(s => s.id !== stopId) });
  };

  const handleAddActivity = () => {
    if (!selectedStopId || !newActivity.title || newActivity.cost === undefined) return;
    const updatedStops = trip.stops.map(stop => {
      if (stop.id === selectedStopId) {
        return {
          ...stop,
          activities: [...stop.activities, {
            id: generateId(), tripStopId: stop.id, title: newActivity.title!,
            type: newActivity.type || ActivityType.Activity, cost: newActivity.cost!, startTime: newActivity.startTime
          } as Activity]
        };
      }
      return stop;
    });
    handleUpdateTrip({ ...trip, stops: updatedStops });
    setSelectedStopId(null);
    setNewActivity({ type: ActivityType.Activity, cost: 0 });
  };

  const handleRemoveActivity = (stopId: string, activityId: string) => {
    const updatedStops = trip.stops.map(stop => {
      if (stop.id === stopId) return { ...stop, activities: stop.activities.filter(a => a.id !== activityId) };
      return stop;
    });
    handleUpdateTrip({ ...trip, stops: updatedStops });
  };

  const totalCostUSD = trip.stops.reduce((acc, stop) => acc + stop.activities.reduce((sAcc, a) => sAcc + (a.cost || 0), 0), 0);
  const totalCostINR = toINR(totalCostUSD);
  const tripDays = Math.max(1, Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 3600 * 24)));
  const avgDailyCostUSD = Math.round(totalCostUSD / tripDays);

  const filteredCities = cities.filter(c => 
    c.name.toLowerCase().includes(citySearchQuery.toLowerCase()) || c.country.toLowerCase().includes(citySearchQuery.toLowerCase())
  );

  const byCategory = trip.stops.flatMap(s => s.activities).reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + (curr.cost || 0);
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(byCategory).map(([name, value]) => ({ name, value: toINR(value) }));
  const barData = trip.stops.map(stop => ({ name: stop.city.name, cost: toINR(stop.activities.reduce((acc, a) => acc + (a.cost || 0), 0)) }));
  const COLORS = ['#14b8a6', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button onClick={() => navigate('/my-trips')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors text-sm font-medium">
          <ArrowLeft className="h-4 w-4" /> Back to Trips
        </button>

        <div className="relative h-56 sm:h-64 rounded-2xl overflow-hidden mb-6 shadow-lg">
          <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{trip.title}</h1>
            <div className="flex items-center text-white/90 gap-4 text-sm flex-wrap">
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(trip.startDate).toLocaleDateString('en-IN')} - {new Date(trip.endDate).toLocaleDateString('en-IN')}</span>
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {trip.stops.length} {trip.stops.length === 1 ? 'City' : 'Cities'}</span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs uppercase tracking-wide">{trip.intent} • {trip.spendingStyle}</span>
            </div>
          </div>
          {hasChanges && (
            <button onClick={handleSave} disabled={saving} className="absolute top-4 right-4 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium text-sm flex items-center gap-2 shadow-lg transition-all disabled:opacity-50">
              <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-surface-800 rounded-xl p-4 sm:p-6 mb-6 shadow-sm border border-gray-100 dark:border-surface-700">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Total Budget</p>
              <p className="text-xl sm:text-2xl font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1"><IndianRupee className="h-5 w-5" />{totalCostINR.toLocaleString('en-IN')}</p>
              <p className="text-xs text-gray-400">${totalCostUSD} USD</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Daily Avg</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">₹{toINR(avgDailyCostUSD).toLocaleString('en-IN')}</p>
              <p className="text-xs text-gray-400">/day</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Duration</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{tripDays} days</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Activities</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{trip.stops.reduce((acc, s) => acc + s.activities.length, 0)}</p>
            </div>
          </div>
        </div>

        <div className="flex border-b border-gray-200 dark:border-surface-700 mb-6 overflow-x-auto">
          {[{ key: 'itinerary', label: 'Itinerary' }, { key: 'budget', label: 'Budget & Analytics' }, { key: 'settings', label: 'Settings' }].map(({ key, label }) => (
            <button key={key} onClick={() => setActiveTab(key as any)} className={`px-4 sm:px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === key ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'itinerary' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 overflow-x-auto pb-2">
              {trip.stops.map(stop => (
                <div key={stop.id} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface-800 rounded-full border border-gray-200 dark:border-surface-700">
                  <MapPin className="h-4 w-4 text-brand-500" />
                  <span className="font-medium text-sm text-gray-900 dark:text-white">{stop.city.name}</span>
                  <button onClick={() => handleRemoveStop(stop.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="h-3 w-3" /></button>
                </div>
              ))}
              <button onClick={() => setIsAddingCity(true)} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-surface-600 rounded-full text-gray-500 hover:text-brand-500 hover:border-brand-500 transition-colors">
                <Plus className="h-4 w-4" /><span className="text-sm font-medium">Add City</span>
              </button>
            </div>

            {isAddingCity && (
              <div className="bg-white dark:bg-surface-800 rounded-xl p-6 border border-gray-200 dark:border-surface-700 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Select a Destination</h3>
                  <button onClick={() => setIsAddingCity(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
                </div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent" placeholder="Search for a city..." value={citySearchQuery} onChange={e => setCitySearchQuery(e.target.value)} autoFocus />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                  {filteredCities.map(city => (
                    <button key={city.id} onClick={() => handleAddStop(city)} className="flex items-center gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-surface-700 rounded-lg transition-colors">
                      <img src={city.imageUrl} alt={city.name} className="h-10 w-10 object-cover rounded-lg" />
                      <div><div className="font-medium text-sm text-gray-900 dark:text-white">{city.name}</div><div className="text-xs text-gray-500">{city.country}</div></div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {trip.stops.length === 0 && !isAddingCity && (
              <div className="text-center py-16 text-gray-400">
                <MapPin className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No cities added yet.</p>
                <p className="text-sm mt-1">Click "Add City" to start planning your itinerary.</p>
              </div>
            )}

            {trip.stops.map((stop) => (
              <div key={stop.id} className="bg-white dark:bg-surface-800 rounded-xl p-6 border border-gray-200 dark:border-surface-700 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"><MapPin className="h-5 w-5 text-brand-500" />{stop.city.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><Calendar className="h-3 w-3" /> {new Date(stop.arrivalDate).toLocaleDateString('en-IN')} - {new Date(stop.departureDate).toLocaleDateString('en-IN')}</p>
                  </div>
                  <button onClick={() => setSelectedStopId(stop.id)} className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"><Plus className="h-3 w-3" /> Add Activity</button>
                </div>
                <div className="space-y-2">
                  {stop.activities.map(activity => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-surface-700 rounded-lg group">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${activity.type === ActivityType.Food ? 'bg-orange-100 text-orange-600' : activity.type === ActivityType.Transport ? 'bg-blue-100 text-blue-600' : activity.type === ActivityType.Accommodation ? 'bg-purple-100 text-purple-600' : 'bg-brand-100 text-brand-600'}`}>
                          {activity.type === ActivityType.Food ? <Utensils className="h-4 w-4"/> : activity.type === ActivityType.Transport ? <Bus className="h-4 w-4"/> : activity.type === ActivityType.Accommodation ? <Bed className="h-4 w-4"/> : <ActivityIcon className="h-4 w-4"/>}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{activity.title}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-2">
                            {activity.startTime && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(activity.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
                            <span className="flex items-center gap-1 text-brand-600"><IndianRupee className="h-3 w-3" />{toINR(activity.cost).toLocaleString('en-IN')}</span>
                            <span className="text-gray-400">(${activity.cost})</span>
                          </p>
                        </div>
                      </div>
                      <button onClick={() => handleRemoveActivity(stop.id, activity.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"><Trash2 className="h-4 w-4"/></button>
                    </div>
                  ))}
                  {stop.activities.length === 0 && <p className="text-sm text-gray-400 italic py-4 text-center">No activities planned yet.</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-surface-800 rounded-xl p-4 border border-gray-200 dark:border-surface-700 flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Display Currency</span>
              <select className="px-4 py-2 border border-gray-200 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-gray-900 dark:text-white" value={displayCurrency} onChange={(e) => setDisplayCurrency(e.target.value)}>
                <option value="INR">₹ INR (Indian Rupee)</option>
                <option value="USD">$ USD (US Dollar)</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-surface-800 rounded-xl p-6 border border-gray-200 dark:border-surface-700">
                <p className="text-sm text-gray-500 mb-1">Total Trip Cost</p>
                <p className="text-3xl font-bold text-brand-600 dark:text-brand-400">{displayCurrency === 'INR' ? `₹${totalCostINR.toLocaleString('en-IN')}` : `$${totalCostUSD.toLocaleString()}`}</p>
                {displayCurrency === 'INR' && <p className="text-sm text-gray-400 mt-1">${totalCostUSD} USD</p>}
              </div>
              <div className="bg-white dark:bg-surface-800 rounded-xl p-6 border border-gray-200 dark:border-surface-700">
                <p className="text-sm text-gray-500 mb-1">Most Expensive City</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{barData.sort((a,b) => b.cost - a.cost)[0]?.name || 'N/A'}</p>
              </div>
              <div className="bg-white dark:bg-surface-800 rounded-xl p-6 border border-gray-200 dark:border-surface-700">
                <p className="text-sm text-gray-500 mb-1">Avg. Daily Cost</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{displayCurrency === 'INR' ? `₹${toINR(avgDailyCostUSD).toLocaleString('en-IN')}` : `$${avgDailyCostUSD}`}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-surface-800 rounded-xl p-6 border border-gray-200 dark:border-surface-700 h-80">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Cost by Category</h3>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="85%">
                    <PieChart><Pie data={pieData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>{pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><RechartsTooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} /><Legend /></PieChart>
                  </ResponsiveContainer>
                ) : <div className="h-full flex items-center justify-center text-gray-400">No expense data</div>}
              </div>
              <div className="bg-white dark:bg-surface-800 rounded-xl p-6 border border-gray-200 dark:border-surface-700 h-80">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Cost by City</h3>
                {barData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={barData}><CartesianGrid strokeDasharray="3 3" opacity={0.3} /><XAxis dataKey="name" /><YAxis tickFormatter={(value) => `₹${value/1000}k`} /><RechartsTooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} /><Bar dataKey="cost" fill="#14b8a6" radius={[4, 4, 0, 0]} /></BarChart>
                  </ResponsiveContainer>
                ) : <div className="h-full flex items-center justify-center text-gray-400">No expense data</div>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-2xl">
            <div className="bg-white dark:bg-surface-800 rounded-xl p-6 border border-gray-200 dark:border-surface-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Share2 className="h-5 w-5 text-brand-500" />Share Trip</h3>
              <p className="text-gray-500 text-sm mb-4">Make your itinerary visible to friends or the public.</p>
              <label className="flex items-center gap-2 mb-4 cursor-pointer">
                <input type="checkbox" checked={trip.isPublic} onChange={(e) => handleUpdateTrip({...trip, isPublic: e.target.checked})} className="rounded border-gray-300 text-brand-500 focus:ring-brand-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Make Trip Publicly Viewable</span>
              </label>
              <div className="flex gap-2">
                <input readOnly value={`${window.location.origin}/#/public/${trip.id}`} className="flex-1 px-4 py-2 border border-gray-200 dark:border-surface-600 rounded-lg bg-gray-50 dark:bg-surface-700 text-gray-600 dark:text-gray-400 text-sm" />
                <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/#/public/${trip.id}`)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-surface-600 dark:hover:bg-surface-500 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">Copy</button>
              </div>
            </div>
            <div className="bg-white dark:bg-surface-800 rounded-xl p-6 border border-red-200 dark:border-red-900">
              <h3 className="font-semibold text-red-600 mb-2">Danger Zone</h3>
              <p className="text-gray-500 text-sm mb-4">Permanently delete this trip and all its data.</p>
              <button onClick={() => { if (confirm('Are you sure you want to delete this trip?')) { store.deleteTrip(trip.id); navigate('/my-trips'); } }} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors">Delete Trip</button>
            </div>
          </div>
        )}

        {selectedStopId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-surface-800 rounded-2xl w-full max-w-md p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Add Activity</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">What are you doing?</label>
                  <input className="w-full px-4 py-2 border border-gray-200 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500" placeholder="e.g. Louvre Museum" value={newActivity.title || ''} onChange={e => setNewActivity({...newActivity, title: e.target.value})} autoFocus />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">Type</label>
                    <select className="w-full px-4 py-2 border border-gray-200 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-gray-900 dark:text-white" value={newActivity.type} onChange={e => setNewActivity({...newActivity, type: e.target.value as ActivityType})}>
                      {Object.values(ActivityType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">Cost (USD)</label>
                    <input type="number" className="w-full px-4 py-2 border border-gray-200 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-gray-900 dark:text-white" placeholder="0" value={newActivity.cost || ''} onChange={e => setNewActivity({...newActivity, cost: Number(e.target.value)})} />
                    {newActivity.cost ? <p className="text-xs text-brand-500 mt-1">≈ ₹{toINR(newActivity.cost).toLocaleString('en-IN')}</p> : null}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">Time (optional)</label>
                  <input type="datetime-local" className="w-full px-4 py-2 border border-gray-200 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-gray-900 dark:text-white" value={newActivity.startTime || ''} onChange={e => setNewActivity({...newActivity, startTime: e.target.value})} />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button onClick={() => setSelectedStopId(null)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-surface-600 dark:hover:bg-surface-500 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors">Cancel</button>
                  <button onClick={handleAddActivity} className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium transition-colors">Add Activity</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
