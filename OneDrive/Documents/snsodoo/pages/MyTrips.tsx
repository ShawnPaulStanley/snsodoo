import React, { useEffect, useState } from 'react';
import { store } from '../services/store';
import { Trip } from '../types';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Trash2, Edit, Eye } from 'lucide-react';
import { useAppTheme } from '../hooks/useTripTheme';

export const MyTrips = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const theme = useAppTheme();

  useEffect(() => {
    setTrips(store.getTrips());
    return store.subscribe(() => {
      setTrips(store.getTrips());
    });
  }, []);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      store.deleteTrip(id);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className={theme.header}>My Trips</h1>
        <Link to="/create-trip">
          <button className={theme.button}>Create New Trip</button>
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className={`${theme.card} text-center py-12`}>
          <MapPin className="h-16 w-16 mx-auto opacity-30 mb-4" />
          <p className={`${theme.subheadings} mb-4`}>No trips yet</p>
          <Link to="/create-trip">
            <button className={theme.button}>Plan Your First Trip</button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map(trip => (
            <div key={trip.id} className={`${theme.card} overflow-hidden group hover:shadow-xl transition-shadow`}>
              <div className="relative h-48 bg-gray-200 overflow-hidden">
                {trip.coverImage ? (
                  <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
                    <MapPin className="h-16 w-16 text-white opacity-50" />
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className={`${theme.headings} text-xl mb-2`}>{trip.title}</h3>
                <p className="text-sm opacity-60 mb-3 line-clamp-2">{trip.description}</p>

                <div className="flex items-center gap-2 text-sm opacity-70 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm opacity-70 mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>{trip.stops.length} destination{trip.stops.length !== 1 ? 's' : ''}</span>
                </div>

                <div className="flex gap-2">
                  <Link to={`/trip/${trip.id}`} className="flex-1">
                    <button className={`${theme.button} w-full text-sm flex items-center justify-center gap-2`}>
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                  </Link>
                  <button 
                    onClick={() => handleDelete(trip.id)}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
