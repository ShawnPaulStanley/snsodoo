import React, { useState } from 'react';
import { store } from '../services/store';
import { TripIntent, SpendingStyle } from '../types';
import { Palmtree, Mountain, Briefcase, Leaf, Users, Star, DollarSign, Zap } from 'lucide-react';

export const OnboardingModal = () => {
  const [intent, setIntent] = useState<TripIntent | null>(null);
  const [style, setStyle] = useState<SpendingStyle | null>(null);
  const [step, setStep] = useState(1);

  const handleSave = () => {
    if (intent && style) {
      store.savePreferences({ intent, spendingStyle: style });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col md:flex-row h-[500px] md:h-auto">
        {/* Visual Side */}
        <div className="w-full md:w-1/3 bg-slate-900 p-8 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://picsum.photos/600/800?grayscale')] bg-cover bg-center"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold font-serif mb-2">Welcome to GlobeTrotter</h2>
            <p className="text-slate-300 text-sm">Let's personalize your experience.</p>
          </div>
          <div className="relative z-10 mt-8">
             <div className="flex gap-2 mb-4">
                 <div className={`h-2 w-8 rounded-full ${step >= 1 ? 'bg-brand-500' : 'bg-slate-700'}`}></div>
                 <div className={`h-2 w-8 rounded-full ${step >= 2 ? 'bg-brand-500' : 'bg-slate-700'}`}></div>
             </div>
             <p className="text-xs text-slate-400">Step {step} of 2</p>
          </div>
        </div>

        {/* Form Side */}
        <div className="w-full md:w-2/3 p-8 flex flex-col bg-white overflow-y-auto">
          {step === 1 && (
            <div className="animate-scale-in flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-slate-900 mb-6">What's your usual travel vibe?</h3>
              <div className="grid grid-cols-2 gap-4 flex-1">
                 {[
                   { val: TripIntent.Beach, icon: Palmtree, label: 'Beach & Relax' },
                   { val: TripIntent.HillStation, icon: Mountain, label: 'Hills & Scenic' },
                   { val: TripIntent.Business, icon: Briefcase, label: 'Business' },
                   { val: TripIntent.Nature, icon: Leaf, label: 'Nature' },
                   { val: TripIntent.Family, icon: Users, label: 'Family Fun' },
                 ].map((opt) => (
                   <button
                     key={opt.val}
                     onClick={() => setIntent(opt.val)}
                     className={`p-4 rounded-xl border-2 text-left transition-all hover:scale-[1.02] flex flex-col gap-2
                       ${intent === opt.val ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-100 hover:border-brand-200 hover:bg-slate-50 text-slate-600'}`}
                   >
                     <opt.icon className="h-6 w-6" />
                     <span className="font-medium text-sm">{opt.label}</span>
                   </button>
                 ))}
              </div>
              <button 
                disabled={!intent}
                onClick={() => setStep(2)}
                className="mt-6 w-full py-3 bg-brand-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-700 transition-colors"
              >
                Next
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-scale-in flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-slate-900 mb-6">How do you prefer to experience it?</h3>
              <div className="space-y-4 flex-1">
                  {[
                    { val: SpendingStyle.Luxury, icon: Star, label: 'Luxury', desc: 'Premium, rich visuals, high-end details.' },
                    { val: SpendingStyle.Deluxe, icon: DollarSign, label: 'Deluxe', desc: 'Balanced, modern, clear interface.' },
                    { val: SpendingStyle.Minimalist, icon: Zap, label: 'Minimalist', desc: 'Clean, efficient, list-based.' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => setStyle(opt.val)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all hover:scale-[1.01] flex items-center gap-4
                        ${style === opt.val ? 'border-brand-600 bg-brand-50' : 'border-slate-100 hover:border-brand-200 hover:bg-slate-50'}`}
                    >
                      <div className={`p-3 rounded-full ${style === opt.val ? 'bg-brand-200 text-brand-700' : 'bg-slate-100 text-slate-500'}`}>
                        <opt.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <div className={`font-bold ${style === opt.val ? 'text-brand-900' : 'text-slate-900'}`}>{opt.label}</div>
                        <div className="text-sm text-slate-500">{opt.desc}</div>
                      </div>
                    </button>
                  ))}
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={() => setStep(1)} className="px-6 py-3 text-slate-500 font-medium hover:text-slate-800">Back</button>
                <button 
                    disabled={!style}
                    onClick={handleSave}
                    className="flex-1 py-3 bg-brand-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/30"
                >
                    Personalize GlobeTrotter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};