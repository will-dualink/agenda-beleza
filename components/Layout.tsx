
import React, { useState } from 'react';
import { ArrowLeft, Scissors, Bell } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  isAdmin?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, title, showBack = false, isAdmin = false }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  // We can't access toasts directly here because useToast exposes add/remove, not the list.
  // For a full notification center, we would need to expose the list or use a separate context.
  // For now, we will add the Bell icon as a visual improvement/placeholder for "System Alerts".
  
  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-rose-100 selection:text-rose-900 ${isAdmin ? 'bg-slate-100' : 'bg-gradient-to-br from-rose-50/50 via-white to-slate-50'}`}>
      <header className={`sticky top-0 z-50 transition-all duration-300 ${isAdmin ? 'bg-slate-900 text-white shadow-md' : 'bg-white/80 backdrop-blur-md text-slate-900 border-b border-rose-100/50'}`}>
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             {showBack && (
               <Link to={isAdmin ? "/admin" : "/"} className={`p-2 rounded-full transition duration-200 ${isAdmin ? 'hover:bg-white/10' : 'hover:bg-rose-50 text-slate-600 hover:text-rose-600'}`}>
                 <ArrowLeft size={20} />
               </Link>
             )}
             <Link to={isAdmin ? "/admin" : "/"} className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg shadow-sm ${isAdmin ? 'bg-rose-500 text-white' : 'bg-gradient-to-br from-rose-400 to-rose-600 text-white'}`}>
                  <Scissors size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="font-bold text-lg tracking-tight leading-none">Agenda Beleza</h1>
                  {isAdmin && <span className="text-[10px] font-medium opacity-60 uppercase tracking-wider block mt-0.5">Painel Admin</span>}
                </div>
             </Link>
          </div>
          
          <div className="flex items-center gap-4">
             {title && !isAdmin && (
                <span className="text-sm font-medium text-slate-500 hidden sm:block tracking-wide">{title}</span>
             )}
             {/* Notification Bell (Visual only for now, would connect to Notification Context) */}
             <button className={`p-2 rounded-full transition relative ${isAdmin ? 'hover:bg-white/10 text-white/80' : 'hover:bg-slate-100 text-slate-500'}`}>
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
             </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-8">
        {children}
      </main>

      <footer className="py-8 text-center">
        <p className="text-xs text-slate-400 font-medium">© 2024 Agenda Beleza. Elegância em cada detalhe.</p>
      </footer>
    </div>
  );
};

export default Layout;
