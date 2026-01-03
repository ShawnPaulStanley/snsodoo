import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { store } from '../services/store';
import { TripIntent, SpendingStyle } from '../types';
import { Waves, Mountain, Briefcase, Trees, Users, Sparkles, Wallet, Crown, Coins } from 'lucide-react';

export const Login = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<TripIntent | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<SpendingStyle | null>(null);
  const navigate = useNavigate();

  const themes = [
    { value: TripIntent.Beach, label: 'Beach', icon: Waves, color: 'from-cyan-500 to-blue-500' },
    { value: TripIntent.HillStation, label: 'Mountain', icon: Mountain, color: 'from-green-600 to-emerald-700' },
    { value: TripIntent.Business, label: 'Business', icon: Briefcase, color: 'from-slate-700 to-gray-900' },
    { value: TripIntent.Nature, label: 'Nature', icon: Trees, color: 'from-green-500 to-teal-600' },
    { value: TripIntent.Family, label: 'Family', icon: Users, color: 'from-orange-500 to-pink-500' },
  ];

  const budgets = [
    { value: SpendingStyle.Minimalist, label: 'Budget', subtitle: 'Smart spending', icon: Coins, color: 'from-emerald-500 to-green-600' },
    { value: SpendingStyle.Deluxe, label: 'Moderate', subtitle: 'Balanced comfort', icon: Wallet, color: 'from-blue-500 to-indigo-600' },
    { value: SpendingStyle.Luxury, label: 'Luxury', subtitle: 'Premium experience', icon: Crown, color: 'from-purple-500 to-pink-600' },
  ];

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setStep(2);
  };

  const handleThemeSelect = (theme: TripIntent) => {
    setSelectedTheme(theme);
    setStep(3);
  };

  const handleBudgetSelect = async (budget: SpendingStyle) => {
    setSelectedBudget(budget);
    if (selectedTheme) {
      await store.login(email);
      store.savePreferences({ intent: selectedTheme, spendingStyle: budget });
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>

      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-2xl w-full relative z-10 animate-fade-in">
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                GlobeTrotter
              </h1>
              <p className="text-gray-600">Start planning your dream adventure</p>
            </div>
            
            <form onSubmit={handleEmailSubmit} className="space-y-6 mt-8">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="you@example.com"
                  required
                  autoFocus
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-2xl font-semibold hover:shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Continue
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-slide-in">
            <div className="text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-500" />
              <h2 className="text-3xl font-bold mb-2">Choose Your Vibe</h2>
              <p className="text-gray-600">Select the theme that matches your travel style</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
              {themes.map((theme) => {
                const Icon = theme.icon;
                return (
                  <button
                    key={theme.value}
                    onClick={() => handleThemeSelect(theme.value)}
                    className={`group relative p-6 rounded-2xl border-2 border-gray-200 hover:border-transparent hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 bg-gradient-to-br ${theme.color} hover:text-white overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-white opacity-90 group-hover:opacity-0 transition-opacity rounded-2xl"></div>
                    <div className="relative z-10">
                      <Icon className="h-10 w-10 mx-auto mb-3 group-hover:text-white text-gray-700 transition-colors" />
                      <p className="font-semibold text-sm group-hover:text-white text-gray-800 transition-colors">{theme.label}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep(1)}
              className="text-sm text-gray-500 hover:text-gray-700 mx-auto block mt-4"
            >
              Go back
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-slide-in">
            <div className="text-center">
              <Wallet className="h-12 w-12 mx-auto mb-4 text-purple-500" />
              <h2 className="text-3xl font-bold mb-2">Set Your Budget Style</h2>
              <p className="text-gray-600">How do you prefer to travel?</p>
            </div>

            <div className="space-y-4 mt-8">
              {budgets.map((budget) => {
                const Icon = budget.icon;
                return (
                  <button
                    key={budget.value}
                    onClick={() => handleBudgetSelect(budget.value)}
                    className={`group w-full relative p-6 rounded-2xl border-2 border-gray-200 hover:border-transparent hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r ${budget.color} hover:text-white overflow-hidden flex items-center gap-4`}
                  >
                    <div className="absolute inset-0 bg-white opacity-90 group-hover:opacity-0 transition-opacity rounded-2xl"></div>
                    <div className="relative z-10 flex items-center gap-4 w-full">
                      <Icon className="h-12 w-12 group-hover:text-white text-gray-700 transition-colors flex-shrink-0" />
                      <div className="text-left flex-1">
                        <p className="font-bold text-lg group-hover:text-white text-gray-800 transition-colors">{budget.label}</p>
                        <p className="text-sm group-hover:text-white/90 text-gray-600 transition-colors">{budget.subtitle}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep(2)}
              className="text-sm text-gray-500 hover:text-gray-700 mx-auto block mt-4"
            >
              Go back
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-slide-in {
          animation: slide-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};
