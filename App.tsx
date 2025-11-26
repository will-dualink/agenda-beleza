
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Role } from './types';

import Landing from './pages/Landing';
import Login from './pages/Login';
import AdminLogin from './pages/admin/AdminLogin';
import Register from './pages/client/Register';
import Booking from './pages/client/Booking';
import MyAppointments from './pages/client/MyAppointments';
import Profile from './pages/client/Profile';
import Loyalty from './pages/client/Loyalty';

import AdminDashboard from './pages/admin/Dashboard';
import ServicesManager from './pages/admin/ServicesManager';
import TeamManager from './pages/admin/TeamManager';
import Schedule from './pages/admin/Schedule';
import Settings from './pages/admin/Settings';
import ClientsManager from './pages/admin/ClientsManager';
import ClientDetails from './pages/admin/ClientDetails';
import Financial from './pages/admin/Financial';
import LoyaltyManager from './pages/admin/LoyaltyManager';
import InventoryManager from './pages/admin/InventoryManager';

const App: React.FC = () => {
  return (
    <ToastProvider>
      <HashRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/client/register" element={<Register />} />
          
          {/* Protected Client Routes */}
          <Route path="/client/*" element={
            <ProtectedRoute allowedRoles={[Role.CLIENT, Role.ADMIN]}>
              <Routes>
                 <Route path="book" element={<Booking />} />
                 <Route path="appointments" element={<MyAppointments />} />
                 <Route path="profile" element={<Profile />} />
                 <Route path="loyalty" element={<Loyalty />} />
              </Routes>
            </ProtectedRoute>
          } />
          
          {/* Protected Admin Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={[Role.ADMIN]}>
              <Routes>
                <Route path="" element={<AdminDashboard />} />
                <Route path="services" element={<ServicesManager />} />
                <Route path="team" element={<TeamManager />} />
                <Route path="schedule" element={<Schedule />} />
                <Route path="settings" element={<Settings />} />
                <Route path="clients" element={<ClientsManager />} />
                <Route path="clients/:id" element={<ClientDetails />} />
                <Route path="financial" element={<Financial />} />
                <Route path="loyalty" element={<LoyaltyManager />} />
                <Route path="inventory" element={<InventoryManager />} />
              </Routes>
            </ProtectedRoute>
          } />
        </Routes>
      </HashRouter>
    </ToastProvider>
  );
};

export default App;