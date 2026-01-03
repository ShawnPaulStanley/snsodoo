import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CreateTrip } from './pages/CreateTrip';
import { TripDetails } from './pages/TripDetails';
import { Profile } from './pages/Profile';
import { MyTrips } from './pages/MyTrips';
import { PublicTrip } from './pages/PublicTrip';
import { store } from './services/store';

// Protected Route wrapper - redirects to login if not authenticated
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = store.getCurrentUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Login is the first page (default) */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Login />} />
        
        {/* Public Routes */}
        <Route path="/public/:id" element={<PublicTrip />} />
        
        {/* Protected Routes - require login */}
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/my-trips" element={<ProtectedRoute><Layout><MyTrips /></Layout></ProtectedRoute>} />
        <Route path="/create-trip" element={<ProtectedRoute><Layout><CreateTrip /></Layout></ProtectedRoute>} />
        <Route path="/trip/:id" element={<ProtectedRoute><Layout><TripDetails /></Layout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
