import React, { useState } from 'react';
import { store } from '../services/store';
import { TripIntent, SpendingStyle } from '../types';
import { Waves, Mountain, Briefcase, Trees, Users, Crown, Wallet, Coins, Sparkles, MapPin } from 'lucide-react';
import { buildTheme } from '../services/theme';

export const OnboardingModal = () => {
  const [intent, setIntent] = useState<TripIntent>(TripIntent.Beach);
  const [style, setStyle] = useState<SpendingStyle>(SpendingStyle.Deluxe);
  const [step, setStep] = useState(1);

  // Live theme preview
  const previewTheme = buildTheme(intent, style);

  const handleSave = () => {
    store.savePreferences({ intent, spendingStyle: style });
  };

  const themes = [
    { val: TripIntent.Beach, icon: Waves, label: 'Beach', desc: 'Relaxed, tropical vibes', color: 'from-cyan-400 to-blue-500' },
    { val: TripIntent.HillStation, icon: Mountain, label: 'Mountains', desc: 'Fresh, nature-inspired', color: 'from-emerald-500 to-teal-600' },
    { val: TripIntent.Business, icon: Briefcase, label: 'Business', desc: 'Professional, minimal', color: 'from-slate-700 to-gray-900' },
    { val: TripIntent.Nature, icon: Trees, label: 'Nature', desc: 'Earthy, organic feel', color: 'from-green-600 to-emerald-700' },
    { val: TripIntent.Family, icon: Users, label: 'Family', desc: 'Fun, friendly, colorful', color: 'from-orange-400 to-pink-500' },
  ];

  const styles = [
    { val: SpendingStyle.Luxury, icon: Crown, label: 'Luxury', desc: 'Premium visuals, elegant typography' },
    { val: SpendingStyle.Deluxe, icon: Wallet, label: 'Balanced', desc: 'Modern, clean interface' },
    { val: SpendingStyle.Minimalist, icon: Coins, label: 'Minimalist', desc: 'Compact, efficient design' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-purple-500" />
            <h2 className="text-2xl font-bold text-slate-900">Personalize Your Experience</h2>
          </div>
          <p className="text-slate-500">Choose your vibe and style - this will change the entire look of the app!</p>
          
          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className={`h-2 w-20 rounded-full transition-all ${step >= 1 ? 'bg-purple-500' : 'bg-slate-200'}`}></div>
            <div className={`h-2 w-20 rounded-full transition-all ${step >= 2 ? 'bg-purple-500' : 'bg-slate-200'}`}></div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Selection Side */}
          <div className="flex-1 p-6">
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">What's your travel vibe?</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {themes.map((t) => (
                    <button
                      key={t.val}
                      onClick={() => setIntent(t.val)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] ${
                        intent === t.val 
                          ? 'border-purple-500 shadow-lg shadow-purple-500/20' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center mb-3`}>
                        <t.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="font-semibold text-slate-900">{t.label}</div>
                      <div className="text-xs text-slate-500 mt-1">{t.desc}</div>
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setStep(2)}
                  className="mt-6 w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/30"
                >
                  Continue →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Choose your UI style</h3>
                <div className="space-y-3">
                  {styles.map((s) => (
                    <button
                      key={s.val}
                      onClick={() => setStyle(s.val)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
                        style === s.val 
                          ? 'border-purple-500 bg-purple-50 shadow-lg' 
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`p-3 rounded-xl ${style === s.val ? 'bg-purple-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <s.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{s.label}</div>
                        <div className="text-sm text-slate-500">{s.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(1)} className="px-6 py-3 text-slate-500 font-medium hover:text-slate-800">
                    ← Back
                  </button>
                  <button 
                    onClick={handleSave}
                    className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/30"
                  >
                    Apply & Start Exploring
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Live Preview Side */}
          <div className={`flex-1 p-6 ${previewTheme.pageBackground} transition-all duration-500 rounded-br-3xl`}>
            <div className="text-center mb-4">
              <span className={`text-xs font-medium ${previewTheme.accent} uppercase tracking-wider`}>Live Preview</span>
            </div>
            
            {/* Mini UI Preview */}
            <div className={`${previewTheme.card} ${previewTheme.cardHover} mb-4`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 ${previewTheme.borderRadius} ${previewTheme.accentBg}`}>
                  <MapPin className={`h-5 w-5 ${previewTheme.accent}`} />
                </div>
                <div>
                  <div className={`${previewTheme.headerFont} font-semibold ${previewTheme.textColor}`}>Trip to Paradise</div>
                  <div className={`text-xs ${previewTheme.mutedText}`}>Your next adventure</div>
                </div>
              </div>
              <button className={`w-full ${previewTheme.buttonPrimary}`}>
                View Itinerary
              </button>
            </div>

            <div className={`${previewTheme.card} text-center`}>
              <p className={`text-sm ${previewTheme.textColor}`}>
                This is how your app will look!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};