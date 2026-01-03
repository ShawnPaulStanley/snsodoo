import React, { useEffect, useState } from 'react';
import { store } from '../services/store';
import { Trip, City } from '../types';
import { Card, Button, Badge } from '../components/ui';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, Plus } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export const Dashboard = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [popularCities, setPopularCities] = useState<City[]>([]);
  const user = store.getCurrentUser();

  useEffect(() => {
    setTrips(store.getTrips());
    setPopularCities(store.getAllCities().slice(0, 3));
    
    return store.subscribe(() => {
      setTrips(store.getTrips());
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
    { name: 'Remaining', value: 5000 - totalBudget }, // Mock budget limit
  ];
  const COLORS = ['#0284c7', '#e2e8f0'];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-slate-500">You have {trips.length} upcoming trips scheduled.</p>
        </div>
        <Link to="/create-trip">
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Plan New Trip
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-row items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Trips</p>
            <p className="text-2xl font-bold text-slate-900">{trips.length}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-full text-blue-600">
            <MapPin className="h-6 w-6" />
          </div>
        </Card>
        
        <Card className="flex flex-row items-center justify-between">
           <div>
            <p className="text-sm font-medium text-slate-500">Total Budget Est.</p>
            <p className="text-2xl font-bold text-slate-900">${totalBudget.toLocaleString()}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-full text-green-600">
             <div className="h-6 w-6 flex items-center justify-center font-bold">$</div>
          </div>
        </Card>

        <Card className="flex flex-col justify-center h-32 relative" noPadding>
             <div className="absolute inset-0 flex items-center px-6 justify-between z-10">
                <div>
                   <p className="text-sm font-medium text-slate-500">Budget Usage</p>
                   <p className="text-sm text-slate-400">Limit: $5,000</p>
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
        </Card>
      </div>

      {/* Upcoming Trips */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Trips</h2>
        {trips.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
            <div className="mx-auto h-12 w-12 text-slate-400 bg-slate-50 rounded-full flex items-center justify-center mb-3">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-medium text-slate-900">No trips planned yet</h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">Start exploring the world today.</p>
            <Link to="/create-trip"><Button variant="secondary">Create your first trip</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map(trip => (
              <Link to={`/trips/${trip.id}`} key={trip.id} className="group block">
                <Card noPadding className="h-full hover:shadow-md transition-shadow">
                  <div className="h-48 w-full relative">
                    <img src={trip.coverImage || 'https://picsum.photos/400/200'} alt={trip.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3">
                       <Badge color={trip.isPublic ? 'green' : 'gray'}>{trip.isPublic ? 'Public' : 'Private'}</Badge>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="font-semibold text-lg text-slate-900 group-hover:text-brand-600 transition-colors">{trip.title}</h3>
                    </div>
                    <div className="flex items-center text-sm text-slate-500 mb-4">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                      <span className="text-sm text-slate-600">{trip.stops.length} Cities</span>
                      <span className="text-brand-600 text-sm font-medium flex items-center">
                        View Itinerary <ArrowRight className="h-4 w-4 ml-1" />
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Popular Destinations */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Popular Destinations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {popularCities.map(city => (
            <div key={city.id} className="relative rounded-xl overflow-hidden aspect-[4/3] group cursor-pointer">
              <img src={city.imageUrl} alt={city.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                <h3 className="text-white font-bold text-lg">{city.name}</h3>
                <p className="text-white/80 text-sm">{city.country}</p>
                <div className="mt-2 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-xs ${i < city.costIndex ? 'text-yellow-400' : 'text-slate-500'}`}>$</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
