import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { store } from '../services/store';
import { Trip } from '../types';
import { Card, Button, Input } from '../components/ui';
import { Calendar } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid'; // Actually we don't have uuid package, use mock random

const generateId = () => Math.random().toString(36).substr(2, 9);

export const CreateTrip = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      isPublic: false
    };

    store.addTrip(newTrip);
    
    setTimeout(() => {
        setLoading(false);
        navigate(`/trips/${newTrip.id}`);
    }, 500);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Plan a New Trip</h1>
        <p className="text-slate-500">Start by defining the basics of your next adventure.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Trip Name"
            placeholder="e.g. Summer in Italy"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              className="block w-full rounded-lg border-slate-300 border bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              rows={3}
              placeholder="What's the goal of this trip?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
             <Input
              label="End Date"
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => navigate('/')}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create & Start Planning'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
