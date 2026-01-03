import React, { useState, useEffect } from 'react';
import { store } from '../services/store';
import { buildTheme, ThemeConfig } from '../services/theme';
import { TripIntent, SpendingStyle } from '../types';
import { Camera, User, Mail, Globe, Wallet, Settings, RefreshCw, DollarSign } from 'lucide-react';
import { getCurrencyRates } from '../services/api';

export const Profile = () => {
  const user = store.getCurrentUser();
  const prefs = store.getPreferences();
  const [theme, setTheme] = useState<ThemeConfig>(buildTheme(prefs?.intent, prefs?.spendingStyle));
  const [currencies, setCurrencies] = useState<Record<string, number>>({});
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [loadingCurrency, setLoadingCurrency] = useState(false);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const newPrefs = store.getPreferences();
      setTheme(buildTheme(newPrefs?.intent, newPrefs?.spendingStyle));
    });
    return unsubscribe;
  }, []);

  // Load currency rates
  useEffect(() => {
    const loadCurrencies = async () => {
      setLoadingCurrency(true);
      try {
        const rates = await getCurrencyRates('USD');
        if (rates) setCurrencies(rates);
      } catch (e) {
        console.error('Failed to load currencies', e);
      }
      setLoadingCurrency(false);
    };
    loadCurrencies();
  }, []);

  if (!user) return null;

  const popularCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'CNY'];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className={`text-3xl ${theme.headerFont} ${theme.textColor}`}>My Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avatar Card */}
        <div className="md:col-span-1">
          <div className={`${theme.card} text-center`}>
            <div className="relative inline-block mb-4">
              <img 
                src={user.avatar} 
                alt={user.name} 
                className={`h-32 w-32 rounded-full object-cover border-4 border-white/20 ${theme.shadow}`}
              />
              <button className={`absolute bottom-0 right-0 ${theme.buttonPrimary} !p-3 !rounded-full`}>
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <h2 className={`text-xl ${theme.headerFont} ${theme.textColor}`}>{user.name}</h2>
            <p className={`text-sm ${theme.mutedText} mb-4`}>Travel Enthusiast</p>
            
            {/* Current Theme Badge */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${theme.accentBg} ${theme.accent} ${theme.borderRadius} text-sm`}>
              <Settings className="h-4 w-4" />
              <span className="font-medium">{prefs?.intent || 'Default'} • {prefs?.spendingStyle || 'Deluxe'}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Info Card */}
          <div className={theme.card}>
            <h3 className={`text-lg ${theme.headerFont} ${theme.textColor} mb-6 flex items-center gap-2`}>
              <User className={`h-5 w-5 ${theme.accent}`} />
              Personal Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`text-sm font-medium ${theme.mutedText} mb-1 block`}>Full Name</label>
                  <input className={theme.input} defaultValue={user.name} />
                </div>
                <div>
                  <label className={`text-sm font-medium ${theme.mutedText} mb-1 block`}>Username</label>
                  <input className={theme.input} defaultValue="alex_w" />
                </div>
              </div>
              <div>
                <label className={`text-sm font-medium ${theme.mutedText} mb-1 block`}>Email Address</label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-3 h-4 w-4 ${theme.mutedText}`} />
                  <input className={`${theme.input} pl-10`} type="email" defaultValue={user.email} />
                </div>
              </div>
            </div>
          </div>

          {/* Currency Conversion Card - Uses FreeCurrencyAPI */}
          <div className={theme.card}>
            <h3 className={`text-lg ${theme.headerFont} ${theme.textColor} mb-6 flex items-center gap-2`}>
              <DollarSign className={`h-5 w-5 ${theme.accent}`} />
              Currency Preferences
              {loadingCurrency && <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className={`text-sm font-medium ${theme.mutedText} mb-2 block`}>Default Currency</label>
                <select 
                  className={theme.input}
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                >
                  {popularCurrencies.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Live Exchange Rates */}
              {Object.keys(currencies).length > 0 && (
                <div className={`p-4 ${theme.accentBg} ${theme.borderRadius}`}>
                  <p className={`text-sm font-medium ${theme.textColor} mb-3`}>Live Exchange Rates (1 USD =)</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {popularCurrencies.filter(c => c !== 'USD').slice(0, 4).map(currency => (
                      <div key={currency} className={`p-3 bg-white/80 ${theme.borderRadius} text-center`}>
                        <div className={`text-xs ${theme.mutedText}`}>{currency}</div>
                        <div className={`font-bold ${theme.textColor}`}>
                          {currencies[currency]?.toFixed(2) || '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preferences Card */}
          <div className={theme.card}>
            <h3 className={`text-lg ${theme.headerFont} ${theme.textColor} mb-6 flex items-center gap-2`}>
              <Globe className={`h-5 w-5 ${theme.accent}`} />
              App Preferences
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={theme.textColor}>Language</span>
                <select className={theme.input + " w-40"}>
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className={theme.textColor}>Date Format</span>
                <select className={theme.input + " w-40"}>
                  <option>MM/DD/YYYY</option>
                  <option>DD/MM/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <button className={theme.buttonSecondary}>Cancel</button>
            <button className={theme.buttonPrimary}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
};
