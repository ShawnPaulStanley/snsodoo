import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { store } from '../services/store';
import { Trip, TripStop, Activity, ActivityType, City, SpendingStyle } from '../types';
import { useTripTheme } from '../hooks/useTripTheme';
import { MapPin, Calendar, Plus, Trash2, Clock, Utensils, Bed, Bus, Activity as ActivityIcon, Share2, Search, ArrowLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const TripDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | undefined>(store.getTrip(id || ''));
  const [activeTab, setActiveTab] = useState<'itinerary' | 'budget' | 'settings'>('itinerary');
  const [isAddingCity, setIsAddingCity] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  
  // State for adding activity
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [newActivity, setNewActivity] = useState<Partial<Activity>>({ type: ActivityType.Activity });

  // Load Theme
  const theme = useTripTheme(trip?.intent || 'Business' as any, trip?.spendingStyle || 'Deluxe' as any);

  useEffect(() => {
    if (!trip) {
        const found = store.getTrip(id || '');
        if (found) setTrip(found);
        else navigate('/');
    }
  }, [id, trip, navigate]);

  if (!trip) return <div>Loading...</div>;

  const handleUpdateTrip = (updated: Trip) => {
      store.updateTrip(updated);
      setTrip({...updated});
  };

  const handleAddStop = (city: City) => {
    const newStop: TripStop = {
        id: generateId(),
        tripId: trip.id,
        city,
        arrivalDate: trip.startDate,
        departureDate: trip.startDate,
        activities: []
    };
    const updatedTrip = { ...trip, stops: [...trip.stops, newStop] };
    handleUpdateTrip(updatedTrip);
    setIsAddingCity(false);
    setCitySearchQuery('');
  };

  const handleRemoveStop = (stopId: string) => {
      const updatedTrip = { ...trip, stops: trip.stops.filter(s => s.id !== stopId) };
      handleUpdateTrip(updatedTrip);
  };

  const handleAddActivity = () => {
      if (!selectedStopId || !newActivity.title || !newActivity.cost) return;
      
      const updatedStops = trip.stops.map(stop => {
          if (stop.id === selectedStopId) {
              return {
                  ...stop,
                  activities: [...stop.activities, {
                      id: generateId(),
                      tripStopId: stop.id,
                      title: newActivity.title!,
                      cost: Number(newActivity.cost),
                      type: newActivity.type || ActivityType.Activity,
                      startTime: newActivity.startTime
                  }]
              };
          }
          return stop;
      });
      handleUpdateTrip({ ...trip, stops: updatedStops });
      setSelectedStopId(null);
      setNewActivity({ type: ActivityType.Activity });
  };

  const handleRemoveActivity = (stopId: string, activityId: string) => {
    const updatedStops = trip.stops.map(stop => {
        if (stop.id === stopId) {
            return {
                ...stop,
                activities: stop.activities.filter(a => a.id !== activityId)
            };
        }
        return stop;
    });
    handleUpdateTrip({ ...trip, stops: updatedStops });
  };

  // --- Theme-aware Subcomponents ---

  const AdaptiveButton = ({ onClick, children, variant = 'primary', className = '' }: any) => {
      let baseClass = theme.button;
      if (variant === 'secondary') baseClass = theme.buttonSecondary;
      if (variant === 'danger') baseClass = theme.buttonDanger;
      return <button onClick={onClick} className={`${baseClass} ${className}`}>{children}</button>;
  };

  const AdaptiveCard = ({ children, className = '', noPadding = false }: any) => {
      const pClass = noPadding ? '' : ''; // Padding handled in theme.card string usually, but let's be careful
      return <div className={`${theme.card} ${className}`}>{children}</div>
  }

  const ItineraryView = () => {
      const cities = store.searchCities(citySearchQuery);

      return (
          <div className={`${theme.layoutDensity === 'compact' ? 'space-y-4' : 'space-y-8'}`}>
              {/* City List / Add City */}
              <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
                  {trip.stops.map((stop) => (
                      <div key={stop.id} className={`min-w-[200px] relative group border-r pr-4 last:border-0`}>
                           <div className="flex justify-between items-start">
                                <div>
                                    <div className={`font-bold text-lg ${theme.icons}`}>{stop.city.name}</div>
                                    <div className="text-xs opacity-60 mb-2">{stop.city.country}</div>
                                </div>
                                <button onClick={() => handleRemoveStop(stop.id)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-4 w-4"/></button>
                           </div>
                          <div className={`text-xs ${theme.accentBg} ${theme.accent} px-2 py-1 inline-block ${theme.borderRadius}`}>
                              {new Date(stop.arrivalDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                          </div>
                      </div>
                  ))}
                  
                  <button 
                    onClick={() => setIsAddingCity(true)}
                    className={`min-w-[100px] flex flex-col items-center justify-center border-2 border-dashed border-slate-300 ${theme.borderRadius} text-slate-400 hover:border-current hover:text-current transition-colors p-4`}
                  >
                      <Plus className="h-6 w-6 mb-1"/>
                      <span className="text-sm font-medium">Add City</span>
                  </button>
              </div>

              {isAddingCity && (
                  <AdaptiveCard className="animate-scale-in">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className={theme.headings}>Select a Destination</h3>
                        <button onClick={() => setIsAddingCity(false)} className="opacity-50 hover:opacity-100">Cancel</button>
                      </div>
                      <div className="relative mb-4">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 opacity-50" />
                          <input 
                            className={theme.input + " pl-10"} 
                            placeholder="Search for a city..." 
                            value={citySearchQuery}
                            onChange={e => setCitySearchQuery(e.target.value)}
                            autoFocus
                          />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                          {cities.map(city => (
                              <button 
                                key={city.id}
                                onClick={() => handleAddStop(city)}
                                className={`flex items-center gap-3 p-2 text-left hover:bg-black/5 transition-colors ${theme.borderRadius}`}
                              >
                                  <img src={city.imageUrl} alt={city.name} className={`h-10 w-10 object-cover ${theme.borderRadius}`} />
                                  <div>
                                      <div className="font-medium text-sm">{city.name}</div>
                                      <div className="text-xs opacity-60">{city.country}</div>
                                  </div>
                              </button>
                          ))}
                      </div>
                  </AdaptiveCard>
              )}

              {/* Day by Day View */}
              <div className={`${theme.layoutDensity === 'compact' ? 'space-y-4' : 'space-y-8'}`}>
                  {trip.stops.length === 0 && !isAddingCity && (
                       <div className="text-center py-10 opacity-50">
                           <MapPin className="h-12 w-12 mx-auto mb-3" />
                           <p>No cities added yet.</p>
                       </div>
                  )}

                  {trip.stops.map((stop) => (
                      <div key={stop.id} className={`relative ${trip.spendingStyle !== SpendingStyle.Minimalist ? 'pl-8 border-l-2 border-black/10' : ''} pb-8 last:pb-0 last:border-0`}>
                          {trip.spendingStyle !== SpendingStyle.Minimalist && <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full ${theme.progressBar} ring-4 ring-white`} />}
                          
                          <div className="flex justify-between items-center mb-4">
                             <div>
                                <h3 className={theme.headings}>{stop.city.name}</h3>
                                <p className="opacity-60 text-sm flex items-center mt-1">
                                    <Calendar className="h-3 w-3 mr-1"/> 
                                    {new Date(stop.arrivalDate).toLocaleDateString()} - {new Date(stop.departureDate).toLocaleDateString()}
                                </p>
                             </div>
                             <AdaptiveButton variant="secondary" onClick={() => setSelectedStopId(stop.id)}>
                                 <Plus className="h-3 w-3 mr-1 inline"/> Activity
                             </AdaptiveButton>
                          </div>

                          {/* Activity List - Adapt based on Style */}
                          <div className={`${trip.spendingStyle === SpendingStyle.Minimalist ? 'space-y-1' : 'space-y-3'}`}>
                              {stop.activities.map(activity => (
                                  <div key={activity.id} className={`
                                      flex items-center justify-between group
                                      ${trip.spendingStyle === SpendingStyle.Minimalist 
                                        ? 'py-2 border-b border-dashed border-slate-300' 
                                        : `bg-white/50 p-4 ${theme.borderRadius} shadow-sm border border-transparent hover:border-current/10 transition-colors`
                                      }
                                  `}>
                                      <div className="flex items-center gap-4">
                                          {trip.spendingStyle !== SpendingStyle.Minimalist && (
                                              <div className={`h-8 w-8 rounded-full flex items-center justify-center opacity-80
                                                  ${activity.type === ActivityType.Food ? 'bg-orange-100 text-orange-600' : 
                                                    activity.type === ActivityType.Transport ? 'bg-blue-100 text-blue-600' :
                                                    activity.type === ActivityType.Accommodation ? 'bg-purple-100 text-purple-600' :
                                                    'bg-green-100 text-green-600'}`}>
                                                  {activity.type === ActivityType.Food ? <Utensils className="h-4 w-4"/> :
                                                  activity.type === ActivityType.Transport ? <Bus className="h-4 w-4"/> :
                                                  activity.type === ActivityType.Accommodation ? <Bed className="h-4 w-4"/> :
                                                  <ActivityIcon className="h-4 w-4"/>}
                                              </div>
                                          )}
                                          <div>
                                              <p className="font-medium">{activity.title}</p>
                                              <p className={`text-xs opacity-60 flex items-center ${theme.layoutDensity === 'compact' ? 'font-mono' : ''}`}>
                                                  {activity.startTime && <span className="mr-3">{new Date(activity.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
                                                  <span>${activity.cost}</span>
                                              </p>
                                          </div>
                                      </div>
                                      <button 
                                        onClick={() => handleRemoveActivity(stop.id, activity.id)}
                                        className="opacity-0 group-hover:opacity-50 hover:!opacity-100 text-red-500 transition-opacity"
                                      >
                                          <Trash2 className="h-4 w-4"/>
                                      </button>
                                  </div>
                              ))}
                              
                              {stop.activities.length === 0 && (
                                  <div className="text-sm opacity-40 italic">No activities planned yet.</div>
                              )}
                          </div>
                      </div>
                  ))}
              </div>

               {/* Add Activity Modal/Overlay */}
               {selectedStopId && (
                   <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                       <div className={`${theme.card} w-full max-w-md animate-scale-in relative`}>
                           <h3 className={`${theme.headings} mb-6`}>Add Activity</h3>
                           <div className="space-y-4">
                               <div>
                                   <label className="text-sm font-medium opacity-70 mb-1 block">What are you doing?</label>
                                   <input 
                                     className={theme.input}
                                     placeholder="e.g. Louvre Museum" 
                                     value={newActivity.title || ''}
                                     onChange={e => setNewActivity({...newActivity, title: e.target.value})}
                                   />
                               </div>
                               <div className="grid grid-cols-2 gap-4">
                                   <div>
                                       <label className="text-sm font-medium opacity-70 mb-1 block">Type</label>
                                       <select 
                                         className={theme.input}
                                         value={newActivity.type}
                                         onChange={e => setNewActivity({...newActivity, type: e.target.value as ActivityType})}
                                       >
                                           {Object.values(ActivityType).map(t => <option key={t} value={t}>{t}</option>)}
                                       </select>
                                   </div>
                                   <div>
                                       <label className="text-sm font-medium opacity-70 mb-1 block">Cost ($)</label>
                                       <input 
                                        type="number"
                                        className={theme.input}
                                        value={newActivity.cost || ''}
                                        onChange={e => setNewActivity({...newActivity, cost: Number(e.target.value)})}
                                       />
                                   </div>
                               </div>
                               <div>
                                   <label className="text-sm font-medium opacity-70 mb-1 block">Time</label>
                                   <input 
                                     type="datetime-local"
                                     className={theme.input}
                                     value={newActivity.startTime || ''}
                                     onChange={e => setNewActivity({...newActivity, startTime: e.target.value})}
                                   />
                               </div>
                               <div className="flex justify-end gap-3 mt-8">
                                   <AdaptiveButton variant="secondary" onClick={() => setSelectedStopId(null)}>Cancel</AdaptiveButton>
                                   <AdaptiveButton onClick={handleAddActivity}>Add Activity</AdaptiveButton>
                               </div>
                           </div>
                       </div>
                   </div>
               )}
          </div>
      );
  };

  const BudgetView = () => {
    // Calculate Stats
    const totalCost = trip.stops.reduce((acc, stop) => acc + stop.activities.reduce((sAcc, a) => sAcc + a.cost, 0), 0);
    const byCategory = trip.stops.flatMap(s => s.activities).reduce((acc, curr) => {
        acc[curr.type] = (acc[curr.type] || 0) + curr.cost;
        return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(byCategory).map(([name, value]) => ({ name, value }));
    const barData = trip.stops.map(stop => ({
        name: stop.city.name,
        cost: stop.activities.reduce((acc, a) => acc + a.cost, 0)
    }));

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AdaptiveCard>
                    <p className={theme.subheadings}>Total Trip Cost</p>
                    <p className={`text-3xl ${theme.headings} mt-1`}>${totalCost.toLocaleString()}</p>
                </AdaptiveCard>
                <AdaptiveCard>
                    <p className={theme.subheadings}>Most Expensive City</p>
                    <p className={`text-xl ${theme.headings} mt-1 truncate`}>
                        {barData.sort((a,b) => b.cost - a.cost)[0]?.name || 'N/A'}
                    </p>
                </AdaptiveCard>
                 <AdaptiveCard>
                    <p className={theme.subheadings}>Avg. Daily Cost</p>
                    <p className={`text-xl ${theme.headings} mt-1`}>
                         ${Math.round(totalCost / Math.max(1, (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 3600 * 24))).toLocaleString()}
                    </p>
                </AdaptiveCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AdaptiveCard className="h-80">
                    <h3 className={`${theme.headings} mb-4`}>Cost by Category</h3>
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <div className="h-full flex items-center justify-center opacity-40">No expense data</div>}
                </AdaptiveCard>
                <AdaptiveCard className="h-80">
                    <h3 className={`${theme.headings} mb-4`}>Cost by City</h3>
                     {barData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <RechartsTooltip />
                                <Bar dataKey="cost" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                     ) : <div className="h-full flex items-center justify-center opacity-40">No expense data</div>}
                </AdaptiveCard>
            </div>
        </div>
    );
  };

  const SettingsView = () => {
      const [isCopied, setIsCopied] = useState(false);
      const shareUrl = `${window.location.origin}/#/trips/${trip.id}/shared`;

      const copyToClipboard = () => {
          navigator.clipboard.writeText(shareUrl);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
      };

      const deleteTrip = () => {
          if (confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
              store.deleteTrip(trip.id);
              navigate('/');
          }
      };

      return (
          <div className="space-y-6 max-w-2xl">
              <AdaptiveCard>
                  <h3 className={`${theme.headings} mb-4 flex items-center gap-2`}><Share2 className="h-5 w-5"/> Share Trip</h3>
                  <p className="opacity-60 text-sm mb-4">Make your itinerary visible to friends or the public.</p>
                  
                  <div className="flex items-center gap-2 mb-4">
                      <input 
                        type="checkbox" 
                        checked={trip.isPublic} 
                        onChange={(e) => handleUpdateTrip({...trip, isPublic: e.target.checked})}
                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                      <label className="text-sm font-medium">Make Trip Publicly Viewable</label>
                  </div>

                  <div className="flex gap-2">
                      <input readOnly value={shareUrl} className={theme.input} />
                      <AdaptiveButton onClick={copyToClipboard} variant="secondary">
                          {isCopied ? 'Copied!' : 'Copy'}
                      </AdaptiveButton>
                  </div>
              </AdaptiveCard>

              <AdaptiveCard className="border-red-200">
                  <h3 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h3>
                  <p className="opacity-60 text-sm mb-4">Permanently delete this trip and all its data.</p>
                  <AdaptiveButton variant="danger" onClick={deleteTrip}>Delete Trip</AdaptiveButton>
              </AdaptiveCard>
          </div>
      );
  };

  return (
    <div className={theme.wrapper}>
      {/* Wrapper is min-h-screen, so we need a container inside */}
      <div className={theme.container}>
        <div className="flex items-center gap-2 mb-6">
             <button onClick={() => navigate('/')} className="opacity-50 hover:opacity-100 flex items-center text-sm font-medium transition-opacity">
                <ArrowLeft className="h-4 w-4 mr-1"/> Dashboard
             </button>
        </div>

        {/* Header */}
        <div className={`relative h-64 ${theme.borderRadius} overflow-hidden mb-8 shadow-md`}>
            <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                <div className={`${trip.spendingStyle === SpendingStyle.Luxury ? 'text-center' : ''}`}>
                    <h1 className={`${theme.header} text-white`}>{trip.title}</h1>
                    <div className={`flex items-center text-white/90 gap-4 mt-2 ${trip.spendingStyle === SpendingStyle.Luxury ? 'justify-center' : ''} text-sm font-medium`}>
                        <span className="flex items-center gap-1"><Calendar className="h-4 w-4"/> {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-4 w-4"/> {trip.stops.length} Cities</span>
                        <span className={`px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-xs border border-white/20 uppercase tracking-widest`}>{trip.intent} • {trip.spendingStyle}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-black/10 mb-8 overflow-x-auto">
            {['Itinerary', 'Budget & Analytics', 'Settings'].map((tabLabel) => {
                const tabKey = tabLabel.toLowerCase().split(' ')[0] as any;
                const isActive = activeTab === tabKey;
                return (
                    <button 
                        key={tabKey}
                        onClick={() => setActiveTab(tabKey)}
                        className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 
                            ${isActive 
                                ? `border-current ${theme.accent} opacity-100` 
                                : 'border-transparent opacity-50 hover:opacity-80'
                            }`}
                    >
                        {tabLabel}
                    </button>
                )
            })}
        </div>

        {/* Content */}
        <div className={`animate-fade-in ${theme.animation}`}>
            {activeTab === 'itinerary' && <ItineraryView />}
            {activeTab === 'budget' && <BudgetView />}
            {activeTab === 'settings' && <SettingsView />}
        </div>
      </div>
    </div>
  );
};