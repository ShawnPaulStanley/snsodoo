import React from 'react';
import { store } from '../services/store';
import { Card, Button, Input } from '../components/ui';

export const Profile = () => {
  const user = store.getCurrentUser();

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="text-center">
            <div className="relative inline-block mb-4">
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="h-32 w-32 rounded-full object-cover border-4 border-slate-100"
              />
              <button className="absolute bottom-0 right-0 bg-brand-600 text-white p-2 rounded-full hover:bg-brand-700">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
              </button>
            </div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-slate-500 text-sm mb-4">Travel Enthusiast</p>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <h3 className="text-lg font-semibold mb-6">Personal Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Full Name" defaultValue={user.name} />
                <Input label="Username" defaultValue="alex_w" />
              </div>
              <Input label="Email Address" type="email" defaultValue={user.email} />
              
              <div className="pt-4">
                 <h3 className="text-lg font-semibold mb-4">Preferences</h3>
                 <div className="space-y-3">
                    <div className="flex items-center justify-between">
                       <span className="text-slate-700">Currency</span>
                       <select className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5">
                          <option>USD ($)</option>
                          <option>EUR (€)</option>
                          <option>GBP (£)</option>
                       </select>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-slate-700">Language</span>
                       <select className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5">
                          <option>English</option>
                          <option>Spanish</option>
                          <option>French</option>
                       </select>
                    </div>
                 </div>
              </div>

              <div className="pt-6 flex justify-end gap-3">
                 <Button>Save Changes</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
