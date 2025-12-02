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
import AdminLayout from './components/AdminLayout';
import AuthChoice from './pages/auth/AuthChoice';
import LoginAdmin from './pages/auth/LoginAdmin';
import LoginClient from './pages/auth/LoginClient';
import { LayoutDashboard, Settings, Users, TrendingUp, LogOut } from 'lucide-react';
import { Role } from './types';

type PageType = 'booking' | 'admin' | 'dashboard' | 'services' | 'team' | 'financial';
type AuthPageType = 'choice' | 'admin-login' | 'client-login';

interface NavItem {
  id: PageType;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'services', label: 'Serviços', icon: <Settings size={20} /> },
  { id: 'team', label: 'Equipe', icon: <Users size={20} /> },
  { id: 'financial', label: 'Financeiro', icon: <TrendingUp size={20} /> },
];

export const Router: React.FC = () => {
  const { user, isLoggedIn, login, logout } = useAuth();
  const [currentPage, setCurrentPage] = React.useState<PageType>('booking');
  const [authPage, setAuthPage] = React.useState<AuthPageType>('choice');
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  // Se não está logado, mostrar páginas de autenticação
  if (!isLoggedIn) {
    if (authPage === 'choice') {
      return (
        <AuthChoice
          onAdminClick={() => setAuthPage('admin-login')}
          onClientClick={() => setAuthPage('client-login')}
        />
      );
    } else if (authPage === 'admin-login') {
      return (
        <LoginAdmin
          onLoginSuccess={(user) => {
            login(user);
            setCurrentPage('dashboard');
          }}
        />
      );
    } else if (authPage === 'client-login') {
      return (
        <LoginClient
          onLoginSuccess={(user) => {
            login(user);
            setCurrentPage('booking');
          }}
          onBack={() => setAuthPage('choice')}
        />
      );
    }
  }

  // Se é cliente, mostrar página de agendamento
  if (user?.role === Role.CLIENT) {
    return <BookingPage />;
  }

  // Se é admin, mostrar layout admin
  const renderAdminPage = () => {
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

  return (
    <AdminLayout 
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      navItems={NAV_ITEMS}
      user={user}
      onLogout={() => {
        logout();
        setAuthPage('choice');
      }}
      sidebarOpen={sidebarOpen}
      onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
    >
      {renderAdminPage()}
    </AdminLayout>
  );
};

export default Router;
