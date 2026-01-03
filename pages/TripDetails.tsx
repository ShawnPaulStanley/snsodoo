import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { store } from '../services/store';
import { Trip, TripStop, Activity, ActivityType, City } from '../types';
import { Card, Button, Input, Badge } from '../components/ui';
import { MapPin, Calendar, DollarSign, Plus, Trash2, Clock, Utensils, Bed, Bus, Activity as ActivityIcon, Share2, Search } from 'lucide-react';
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

  // --- Components for Tabs ---

  const ItineraryView = () => {
      const cities = store.searchCities(citySearchQuery);

      return (
          <div className="space-y-6">
              {/* City List / Add City */}
              <div className="flex overflow-x-auto gap-4 pb-2 no-scrollbar">
                  {trip.stops.map((stop, index) => (
                      <div key={stop.id} className="min-w-[200px] bg-white border border-slate-200 rounded-xl p-4 relative group">
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleRemoveStop(stop.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 className="h-4 w-4"/></button>
                          </div>
                          <div className="font-bold text-slate-800">{stop.city.name}</div>
                          <div className="text-xs text-slate-500 mb-2">{stop.city.country}</div>
                          <div className="text-xs bg-slate-100 rounded px-2 py-1 inline-block">
                              {new Date(stop.arrivalDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                          </div>
                      </div>
                  ))}
                  
                  <button 
                    onClick={() => setIsAddingCity(true)}
                    className="min-w-[100px] flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl text-slate-400 hover:border-brand-500 hover:text-brand-500 transition-colors p-4"
                  >
                      <Plus className="h-6 w-6 mb-1"/>
                      <span className="text-sm font-medium">Add City</span>
                  </button>
              </div>

              {isAddingCity && (
                  <Card className="bg-slate-50 border-brand-200">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-slate-800">Select a Destination</h3>
                        <button onClick={() => setIsAddingCity(false)} className="text-slate-400 hover:text-slate-600">Cancel</button>
                      </div>
                      <div className="relative mb-4">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <Input 
                            className="pl-10" 
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
                                className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200 hover:border-brand-500 hover:ring-1 hover:ring-brand-500 text-left transition-all"
                              >
                                  <img src={city.imageUrl} alt={city.name} className="h-10 w-10 rounded-md object-cover" />
                                  <div>
                                      <div className="font-medium text-sm text-slate-900">{city.name}</div>
                                      <div className="text-xs text-slate-500">{city.country}</div>
                                  </div>
                              </button>
                          ))}
                      </div>
                  </Card>
              )}

              {/* Day by Day View */}
              <div className="space-y-8">
                  {trip.stops.length === 0 && !isAddingCity && (
                       <div className="text-center py-10 text-slate-500">
                           <MapPin className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                           <p>No cities added yet. Start by adding a destination!</p>
                       </div>
                  )}

                  {trip.stops.map((stop) => (
                      <div key={stop.id} className="relative pl-8 border-l-2 border-slate-200 pb-8 last:pb-0 last:border-0">
                          <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-brand-500 ring-4 ring-white" />
                          <div className="flex justify-between items-start mb-4">
                             <div>
                                <h3 className="text-xl font-bold text-slate-900">{stop.city.name}</h3>
                                <p className="text-slate-500 text-sm flex items-center mt-1">
                                    <Calendar className="h-3 w-3 mr-1"/> 
                                    {new Date(stop.arrivalDate).toLocaleDateString()} - {new Date(stop.departureDate).toLocaleDateString()}
                                </p>
                             </div>
                             <Button size="sm" variant="secondary" onClick={() => setSelectedStopId(stop.id)}>
                                 <Plus className="h-3 w-3 mr-1"/> Add Activity
                             </Button>
                          </div>

                          {/* Activity List */}
                          <div className="space-y-3">
                              {stop.activities.map(activity => (
                                  <div key={activity.id} className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm flex items-center justify-between hover:border-brand-200 transition-colors group">
                                      <div className="flex items-center gap-4">
                                          <div className={`h-10 w-10 rounded-full flex items-center justify-center 
                                              ${activity.type === ActivityType.Food ? 'bg-orange-100 text-orange-600' : 
                                                activity.type === ActivityType.Transport ? 'bg-blue-100 text-blue-600' :
                                                activity.type === ActivityType.Accommodation ? 'bg-purple-100 text-purple-600' :
                                                'bg-green-100 text-green-600'}`}>
                                              {activity.type === ActivityType.Food ? <Utensils className="h-5 w-5"/> :
                                               activity.type === ActivityType.Transport ? <Bus className="h-5 w-5"/> :
                                               activity.type === ActivityType.Accommodation ? <Bed className="h-5 w-5"/> :
                                               <ActivityIcon className="h-5 w-5"/>}
                                          </div>
                                          <div>
                                              <p className="font-medium text-slate-900">{activity.title}</p>
                                              <p className="text-xs text-slate-500 flex items-center">
                                                  {activity.startTime && <span className="flex items-center mr-3"><Clock className="h-3 w-3 mr-1"/> {new Date(activity.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
                                                  <span className="font-medium text-slate-600">${activity.cost}</span>
                                              </p>
                                          </div>
                                      </div>
                                      <button 
                                        onClick={() => handleRemoveActivity(stop.id, activity.id)}
                                        className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                          <Trash2 className="h-4 w-4"/>
                                      </button>
                                  </div>
                              ))}
                              
                              {stop.activities.length === 0 && (
                                  <div className="text-sm text-slate-400 italic">No activities planned yet.</div>
                              )}
                          </div>
                      </div>
                  ))}
              </div>

               {/* Add Activity Modal/Overlay */}
               {selectedStopId && (
                   <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                       <Card className="w-full max-w-md animate-scale-in">
                           <h3 className="text-lg font-bold mb-4">Add Activity</h3>
                           <div className="space-y-4">
                               <Input 
                                 label="What are you doing?" 
                                 placeholder="e.g. Louvre Museum" 
                                 value={newActivity.title || ''}
                                 onChange={e => setNewActivity({...newActivity, title: e.target.value})}
                               />
                               <div className="grid grid-cols-2 gap-4">
                                   <div>
                                       <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                       <select 
                                         className="block w-full rounded-lg border-slate-300 border bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                                         value={newActivity.type}
                                         onChange={e => setNewActivity({...newActivity, type: e.target.value as ActivityType})}
                                       >
                                           {Object.values(ActivityType).map(t => <option key={t} value={t}>{t}</option>)}
                                       </select>
                                   </div>
                                   <Input 
                                     label="Cost ($)" 
                                     type="number"
                                     value={newActivity.cost || ''}
                                     onChange={e => setNewActivity({...newActivity, cost: Number(e.target.value)})}
                                   />
                               </div>
                               <Input 
                                     label="Time (Optional)" 
                                     type="datetime-local"
                                     value={newActivity.startTime || ''}
                                     onChange={e => setNewActivity({...newActivity, startTime: e.target.value})}
                                />
                               <div className="flex justify-end gap-3 mt-6">
                                   <Button variant="ghost" onClick={() => setSelectedStopId(null)}>Cancel</Button>
                                   <Button onClick={handleAddActivity}>Add Activity</Button>
                               </div>
                           </div>
                       </Card>
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
                <Card>
                    <p className="text-slate-500 text-sm">Total Trip Cost</p>
                    <p className="text-3xl font-bold text-slate-900">${totalCost.toLocaleString()}</p>
                </Card>
                <Card>
                    <p className="text-slate-500 text-sm">Most Expensive City</p>
                    <p className="text-xl font-bold text-slate-900 truncate">
                        {barData.sort((a,b) => b.cost - a.cost)[0]?.name || 'N/A'}
                    </p>
                </Card>
                 <Card>
                    <p className="text-slate-500 text-sm">Avg. Daily Cost</p>
                    <p className="text-xl font-bold text-slate-900">
                         ${Math.round(totalCost / Math.max(1, (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 3600 * 24))).toLocaleString()}
                    </p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="h-80">
                    <h3 className="font-semibold mb-4">Cost by Category</h3>
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
                    ) : <div className="h-full flex items-center justify-center text-slate-400">No expense data</div>}
                </Card>
                <Card className="h-80">
                    <h3 className="font-semibold mb-4">Cost by City</h3>
                     {barData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <RechartsTooltip />
                                <Bar dataKey="cost" fill="#0ea5e9" />
                            </BarChart>
                        </ResponsiveContainer>
                     ) : <div className="h-full flex items-center justify-center text-slate-400">No expense data</div>}
                </Card>
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
              <Card>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Share2 className="h-5 w-5"/> Share Trip</h3>
                  <p className="text-slate-500 text-sm mb-4">Make your itinerary visible to friends or the public.</p>
                  
                  <div className="flex items-center gap-2 mb-4">
                      <input 
                        type="checkbox" 
                        checked={trip.isPublic} 
                        onChange={(e) => handleUpdateTrip({...trip, isPublic: e.target.checked})}
                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                      <label className="text-sm font-medium text-slate-900">Make Trip Publicly Viewable</label>
                  </div>

                  <div className="flex gap-2">
                      <Input readOnly value={shareUrl} className="bg-slate-50" />
                      <Button onClick={copyToClipboard} variant="secondary">
                          {isCopied ? 'Copied!' : 'Copy'}
                      </Button>
                  </div>
              </Card>

              <Card className="border-red-100">
                  <h3 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h3>
                  <p className="text-slate-500 text-sm mb-4">Permanently delete this trip and all its data.</p>
                  <Button variant="danger" onClick={deleteTrip}>Delete Trip</Button>
              </Card>
          </div>
      );
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="relative h-64 rounded-xl overflow-hidden mb-8">
          <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-8">
              <h1 className="text-4xl font-bold text-white mb-2">{trip.title}</h1>
              <div className="flex items-center text-white/90 gap-4">
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4"/> {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4"/> {trip.stops.length} Cities</span>
                  {trip.isPublic && <Badge color="green">Public</Badge>}
              </div>
          </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('itinerary')}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'itinerary' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
              Itinerary
          </button>
          <button 
            onClick={() => setActiveTab('budget')}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'budget' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
              Budget & Analytics
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'settings' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
              Share & Settings
          </button>
      </div>

      {/* Content */}
      <div className="animate-fade-in">
          {activeTab === 'itinerary' && <ItineraryView />}
          {activeTab === 'budget' && <BudgetView />}
          {activeTab === 'settings' && <SettingsView />}
      </div>
    </div>
  );
};
