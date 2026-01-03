import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CreateTrip } from './pages/CreateTrip';
import { TripDetails } from './pages/TripDetails';
import { TripDetailsNew } from './pages/TripDetailsNew';
import { Profile } from './pages/Profile';
import { MyTrips } from './pages/MyTrips';
import { PublicTrip } from './pages/PublicTrip';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Login />} />
        
        {/* Public Routes */}
        <Route path="/public/:id" element={<PublicTrip />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/my-trips" element={<Layout><MyTrips /></Layout>} />
        <Route path="/create-trip" element={<Layout><CreateTrip /></Layout>} />
        <Route path="/trip/:id" element={<Layout><TripDetails /></Layout>} />
        <Route path="/trips/:id" element={<Layout><TripDetailsNew /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
