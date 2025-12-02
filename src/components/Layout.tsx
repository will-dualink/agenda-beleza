import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface LayoutProps {
  title: string;
  subtitle?: string;
  isAdmin?: boolean;
  showBack?: boolean;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  title,
  subtitle,
  isAdmin = false,
  showBack = false,
  children
}) => {
  const goBack = () => window.history.back();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {showBack && (
                <button
                  onClick={goBack}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition"
                  title="Voltar"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
              </div>
            </div>
            <div className="text-right text-xs text-slate-400">
              {isAdmin && (
                <span className="inline-block px-3 py-1 bg-rose-100 text-rose-700 rounded-full font-bold">
                  ADMIN
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm text-slate-500">
            <p>&copy; 2025 AgendaBeleza. Todos os direitos reservados.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-slate-700 transition">Política de Privacidade</a>
              <a href="#" className="hover:text-slate-700 transition">Termos de Serviço</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
