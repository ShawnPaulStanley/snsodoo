import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { store } from '../services/store';
import { Button, Input, Card } from '../components/ui';
import { Globe } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    await store.login(email);
    setIsLoading(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex flex-col items-center">
        <div className="bg-brand-600 p-3 rounded-2xl text-white mb-4">
          <Globe className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">GlobeTrotter</h1>
        <p className="text-slate-500 mt-2">Your next adventure begins here.</p>
      </div>

      <Card className="w-full max-w-md">
        <h2 className="text-xl font-semibold mb-6">Welcome Back</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-slate-600">
              <input type="checkbox" className="mr-2 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
              Remember me
            </label>
            <a href="#" className="text-brand-600 hover:text-brand-700 font-medium">Forgot password?</a>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-500">
          Don't have an account? <a href="#" className="text-brand-600 font-medium">Sign up</a>
        </div>
      </Card>
      
      <div className="mt-8 text-center text-xs text-slate-400">
        <p>Demo Credentials: Any email & password works.</p>
      </div>
    </div>
  );
};
