import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { store } from '../services/store';
import { Trip, TripIntent, SpendingStyle } from '../types';
import { Card, Button, Input } from '../components/ui';
import { Calendar, Palmtree, Mountain, Briefcase, Leaf, Users, DollarSign, Star, Zap, MapPin } from 'lucide-react';
import { useTripTheme } from '../hooks/useTripTheme';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const CreateTrip = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [intent, setIntent] = useState<TripIntent>(TripIntent.Beach);
  const [spendingStyle, setSpendingStyle] = useState<SpendingStyle>(SpendingStyle.Deluxe);
  const [loading, setLoading] = useState(false);

  // Get dynamic theme for live preview
  const previewTheme = useTripTheme(intent, spendingStyle);

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
      isPublic: false,
      intent,
      spendingStyle
    };

    store.addTrip(newTrip);
    
    setTimeout(() => {
        setLoading(false);
        navigate(`/trips/${newTrip.id}`);
    }, 500);
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Plan a New Trip</h1>
        <p className="text-slate-500">Customize the vibe and style of your next adventure.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Trip Details</h3>
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
          </div>

          {/* Theme Selection */}
          <div className="space-y-4">
             <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Vibe & Style (Adaptive UI)</h3>
             
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">What is the intent of this trip?</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                   {[
                     { val: TripIntent.Beach, icon: Palmtree, label: 'Beach' },
                     { val: TripIntent.HillStation, icon: Mountain, label: 'Hills' },
                     { val: TripIntent.Business, icon: Briefcase, label: 'Work' },
                     { val: TripIntent.Nature, icon: Leaf, label: 'Nature' },
                     { val: TripIntent.Family, icon: Users, label: 'Family' },
                   ].map((opt) => (
                     <button
                        key={opt.val}
                        type="button"
                        onClick={() => setIntent(opt.val)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${intent === opt.val ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                     >
                        <opt.icon className="h-6 w-6 mb-2" />
                        <span className="text-xs font-medium">{opt.label}</span>
                     </button>
                   ))}
                </div>
             </div>

             <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">What is your spending style?</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { val: SpendingStyle.Luxury, icon: Star, label: 'Luxury', desc: 'Premium, rich UI & animations' },
                      { val: SpendingStyle.Deluxe, icon: DollarSign, label: 'Deluxe', desc: 'Balanced, modern interface' },
                      { val: SpendingStyle.Minimalist, icon: Zap, label: 'Minimalist', desc: 'Clean, compact, list-based' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setSpendingStyle(opt.val)}
                        className={`flex items-start text-left p-3 rounded-xl border-2 transition-all ${spendingStyle === opt.val ? 'border-brand-600 bg-brand-50' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                         <div className={`p-2 rounded-lg mr-3 ${spendingStyle === opt.val ? 'bg-brand-200 text-brand-800' : 'bg-slate-100 text-slate-500'}`}>
                             <opt.icon className="h-5 w-5" />
                         </div>
                         <div>
                            <div className={`font-medium ${spendingStyle === opt.val ? 'text-brand-900' : 'text-slate-900'}`}>{opt.label}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
                         </div>
                      </button>
                    ))}
                </div>
             </div>

             {/* Live Preview Section */}
             <div className="mt-6 border-t pt-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">Live Theme Preview</label>
                <div className={`p-8 rounded-xl border border-slate-200/60 shadow-inner transition-all duration-500 ${previewTheme.wrapper.replace('min-h-screen', '')}`}>
                    <div className="flex flex-col gap-6">
                        <div>
                            <h4 className={`${previewTheme.header} text-3xl mb-1`}>{title || "Trip to Paradise"}</h4>
                            <p className={previewTheme.subheadings}>Itinerary Preview</p>
                        </div>
                        
                        <div className="flex gap-3">
                             <button type="button" className={previewTheme.button} onClick={(e) => e.preventDefault()}>Primary Action</button>
                             <button type="button" className={previewTheme.buttonSecondary} onClick={(e) => e.preventDefault()}>Secondary</button>
                        </div>
                        
                        <div className={`${previewTheme.card} w-full max-w-sm`}>
                             <div className="flex justify-between items-start mb-3">
                                 <div>
                                     <div className={`${previewTheme.headings} text-lg`}>Destination City</div>
                                     <div className="text-sm opacity-60">Country, Region</div>
                                 </div>
                                 <div className={`p-2 rounded-full ${previewTheme.accentBg} ${previewTheme.accent}`}>
                                     <MapPin className="h-5 w-5" />
                                 </div>
                             </div>
                             <div className="flex items-center gap-2 text-sm opacity-70">
                                 <Calendar className="h-4 w-4" />
                                 <span>Jun 15 - Jun 20</span>
                             </div>
                        </div>
                    </div>
                </div>
                <p className="text-xs text-slate-400 mt-2 text-center">
                    The interface styling, typography, colors, and layout density adapt automatically.
                </p>
             </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t">
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