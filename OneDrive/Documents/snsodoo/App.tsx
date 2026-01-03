import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CreateTrip } from './pages/CreateTrip';
import { TripDetails } from './pages/TripDetails';
import { Profile } from './pages/Profile';

// Fake shared page wrapper for the demo
const SharedTrip = () => <div className="p-8 text-center"><h1 className="text-2xl font-bold">Public Shared Trip View</h1><p>This is where non-logged-in users would see the trip.</p></div>;

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/create-trip" element={<Layout><CreateTrip /></Layout>} />
        <Route path="/trips/:id" element={<Layout><TripDetails /></Layout>} />
        <Route path="/trips/:id/shared" element={<SharedTrip />} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
