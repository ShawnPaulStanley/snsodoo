import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TripIntent, SpendingStyle } from '../types';
import { Waves, Mountain, Briefcase, Trees, Users, Sparkles, Wallet, Crown, Coins, Loader2 } from 'lucide-react';
import { supabase, signInWithGoogle, savePreferences, getSession } from '../services/supabase';

export const Login = () => {
  const [step, setStep] = useState(1);
  const [selectedTheme, setSelectedTheme] = useState<TripIntent | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<SpendingStyle | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  // Check if user is already logged in and handle OAuth callback
  useEffect(() => {
    const handleAuth = async () => {
      // Check if this is an OAuth callback (has access_token in URL)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      
      if (accessToken) {
        // Clear the hash from URL
        window.history.replaceState(null, '', window.location.pathname);
        // Wait a moment for Supabase to process the token
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const session = await getSession();
      if (session) {
        navigate('/dashboard');
        return;
      }
      setCheckingAuth(false);
    };
    handleAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      console.error('Sign in error:', error);
      setLoading(false);
    }
  };

  const handleThemeSelect = (theme: TripIntent) => {
    setSelectedTheme(theme);
    setStep(3);
  };

  const handleBudgetSelect = async (budget: SpendingStyle) => {
    setSelectedBudget(budget);
    setLoading(true);
    
    if (selectedTheme) {
      const session = await getSession();
      if (session?.user) {
        await savePreferences(session.user.id, { 
          intent: selectedTheme, 
          spending_style: budget 
        });
      }
      navigate('/dashboard');
    }
    setLoading(false);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzYzNjZmMSIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-[0.03]"></div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 max-w-2xl w-full relative z-10 animate-fade-in">
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2 text-slate-900 dark:text-white font-display tracking-tight">
                trvl
              </h1>
              <p className="text-slate-500 dark:text-slate-400">Start planning your dream adventure</p>
            </div>
            
            <div className="mt-8">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-4 rounded-2xl font-semibold shadow-sm transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
              
              <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-4">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-slide-in">
            <div className="text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-indigo-500" />
              <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Choose Your Vibe</h2>
              <p className="text-slate-500 dark:text-slate-400">Select the theme that matches your travel style</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
              {themes.map((theme) => {
                const Icon = theme.icon;
                return (
                  <button
                    key={theme.value}
                    onClick={() => handleThemeSelect(theme.value)}
                    className={`group relative p-6 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 transition-all transform hover:scale-105 active:scale-95 bg-white dark:bg-slate-800 overflow-hidden`}
                  >
                    <div className="relative z-10">
                      <Icon className="h-10 w-10 mx-auto mb-3 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                      <p className="font-semibold text-sm text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{theme.label}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-slide-in">
            <div className="text-center">
              <Wallet className="h-12 w-12 mx-auto mb-4 text-indigo-500" />
              <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Set Your Budget Style</h2>
              <p className="text-slate-500 dark:text-slate-400">How do you prefer to travel?</p>
            </div>

            <div className="space-y-4 mt-8">
              {budgets.map((budget) => {
                const Icon = budget.icon;
                return (
                  <button
                    key={budget.value}
                    onClick={() => handleBudgetSelect(budget.value)}
                    disabled={loading}
                    className={`group w-full relative p-6 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 transition-all transform hover:scale-[1.02] active:scale-[0.98] bg-white dark:bg-slate-800 overflow-hidden flex items-center gap-4 disabled:opacity-50`}
                  >
                    <div className="relative z-10 flex items-center gap-4 w-full">
                      <Icon className="h-12 w-12 text-slate-400 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
                      <div className="text-left flex-1">
                        <p className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{budget.label}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">{budget.subtitle}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep(2)}
              className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mx-auto block mt-4"
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
