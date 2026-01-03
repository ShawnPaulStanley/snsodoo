import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { store } from '../services/store';
import { Trip, ActivityType } from '../types';
import { MapPin, Calendar, Share2, Copy, Check } from 'lucide-react';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const PublicTrip = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | undefined>();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const found = store.getTrip(id || '');
    if (found && found.isPublic) {
      setTrip(found);
    } else {
      navigate('/');
    }
  }, [id, navigate]);

  if (!trip) return <div className="max-w-4xl mx-auto p-8">Trip not found or private.</div>;

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyTrip = () => {
    const newTrip: Trip = {
      ...trip,
      id: generateId(),
      title: `Copy of ${trip.title}`,
      userId: store.getCurrentUser()?.id || 'guest',
      isPublic: false
    };
    store.createTrip(newTrip);
    navigate(`/trip/${newTrip.id}`);
  };

  const totalCost = trip.stops.reduce((acc, stop) => 
    acc + stop.activities.reduce((sum, act) => sum + act.cost, 0), 0
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="relative h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
        {trip.coverImage && (
          <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover" />
        )}
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2">{trip.title}</h1>
          <p className="text-lg opacity-70">{trip.description}</p>
          <div className="flex gap-4 mt-4 text-sm opacity-60">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {trip.stops.length} stops
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
          >
            {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Share'}
          </button>
          <button
            onClick={handleCopyTrip}
            className="px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy Trip
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-2xl font-bold mb-4">Itinerary</h2>
        <div className="space-y-6">
          {trip.stops.map((stop, idx) => (
            <div key={stop.id} className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-xl font-bold mb-1">
                {idx + 1}. {stop.city.name}, {stop.city.country}
              </h3>
              <p className="text-sm opacity-60 mb-3">
                {new Date(stop.arrivalDate).toLocaleDateString()} - {new Date(stop.departureDate).toLocaleDateString()}
              </p>

              {stop.activities.length > 0 && (
                <div className="space-y-2">
                  {stop.activities.map(activity => (
                    <div key={activity.id} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-xs opacity-60">{activity.type}</p>
                      </div>
                      <span className="text-sm font-bold">${activity.cost}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-xl font-bold mb-2">Total Estimated Cost</h3>
        <p className="text-3xl font-bold text-blue-600">${totalCost.toLocaleString()}</p>
      </div>
    </div>
  );
};
