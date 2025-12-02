import React from 'react';
import { Menu, X, LogOut, Sparkles } from 'lucide-react';
import { ClientProfile } from '../types';

interface AdminLayoutProps {
  currentPage: string;
  onPageChange: (page: any) => void;
  navItems: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
  }>;
  user: ClientProfile | null;
  onLogout: () => void;
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentPage,
  onPageChange,
  navItems,
  user,
  onLogout,
  sidebarOpen,
  onSidebarToggle,
  children,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-64 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 transition-all duration-300 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo/Brand */}
        <div className="flex items-center gap-3 p-6 border-b border-slate-700">
          <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-600 rounded-lg flex items-center justify-center">
            <Sparkles size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">AgendaBeleza</h1>
            <p className="text-xs text-slate-400">Admin Panel</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onPageChange(item.id);
                if (window.innerWidth < 768) {
                  onSidebarToggle();
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left font-medium ${
                currentPage === item.id
                  ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/50'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-slate-700 p-4 space-y-4">
          {user && (
            <div className="px-4 py-3 bg-slate-700/30 rounded-lg">
              <p className="text-xs text-slate-400">Usuário logado</p>
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            </div>
          )}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 font-medium"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-slate-800/95 backdrop-blur border-b border-slate-700">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={onSidebarToggle}
              className="p-2 hover:bg-slate-700 rounded-lg text-slate-300 transition"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-slate-400">Bem-vindo(a),</p>
                <p className="font-semibold text-white">{user?.name || 'Usuário'}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-80px)] p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onSidebarToggle}
        />
      )}
    </div>
  );
};

export default AdminLayout;
