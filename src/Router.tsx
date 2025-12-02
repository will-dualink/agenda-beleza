/**
 * Router Component
 * Gerencia navegação entre páginas públicas e admin
 */

import React from 'react';
import { useAuth } from './hooks/useAuth';
import BookingPage from './pages/public/BookingPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import TeamManager from './pages/admin/TeamManager';
import ServicesManager from './pages/admin/ServicesManager';
import Financial from './pages/admin/Financial';

type PageType = 'booking' | 'admin' | 'dashboard' | 'services' | 'team' | 'financial';

export const Router: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const [currentPage, setCurrentPage] = React.useState<PageType>('booking');

  // Redireciona para admin se autenticado
  React.useEffect(() => {
    if (isLoggedIn && currentPage === 'booking') {
      setCurrentPage('dashboard');
    }
  }, [isLoggedIn, currentPage]);

  // Renderiza página pública
  if (!isLoggedIn) {
    return <BookingPage />;
  }

  // Renderiza pages admin
  switch (currentPage) {
    case 'dashboard':
      return <AdminDashboard />;
    case 'services':
      return <ServicesManager />;
    case 'team':
      return <TeamManager />;
    case 'financial':
      return <Financial />;
    default:
      return <AdminDashboard />;
  }
};

export default Router;
