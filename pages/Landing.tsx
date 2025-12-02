
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Sparkles, Calendar, LogIn, LogOut, ChevronRight, Crown } from 'lucide-react';
import { StorageService } from '../services/storage';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const user = StorageService.getCurrentUser();

  const handleAction = (path: string) => {
    if (!user && path !== '/login') {
       navigate('/login');
    } else {
       navigate(path);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full text-center space-y-10">
        
        {/* Brand Header */}
        <div className="space-y-4 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-xl shadow-rose-200 mb-2 transform hover:scale-105 transition-transform duration-300">
            <Sparkles size={36} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Agenda Beleza</h1>
            <p className="text-slate-500 text-lg mt-2 font-light">Seu momento de cuidado, simplificado.</p>
          </div>
        </div>

        {/* Welcome Card */}
        {user && (
          <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-rose-100 shadow-sm flex items-center justify-center gap-2">
             <div className="w-2 h-2 rounded-full bg-green-400"></div>
             <p className="text-slate-600 text-sm">Olá, <span className="font-bold text-slate-900">{user.name}</span></p>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid gap-4 w-full">
          <button 
            onClick={() => handleAction('/client/book')}
            className="group relative flex items-center p-5 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 hover:border-rose-200 hover:shadow-[0_8px_30px_rgba(244,63,94,0.1)] transition-all duration-300 w-full text-left"
          >
            <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors duration-300">
              <Sparkles size={24} />
            </div>
            <div className="ml-5 flex-1">
              <h3 className="font-bold text-slate-900 text-lg">Novo Agendamento</h3>
              <p className="text-sm text-slate-500 font-light">Escolha seu serviço e profissional</p>
            </div>
            <ChevronRight className="text-slate-300 group-hover:text-rose-400 transition-colors" size={20} />
          </button>

          <button 
            onClick={() => handleAction('/client/appointments')}
            className="group relative flex items-center p-5 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 hover:border-indigo-200 hover:shadow-[0_8px_30px_rgba(99,102,241,0.1)] transition-all duration-300 w-full text-left"
          >
            <div className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
              <Calendar size={24} />
            </div>
            <div className="ml-5 flex-1">
              <h3 className="font-bold text-slate-900 text-lg">Meus Agendamentos</h3>
              <p className="text-sm text-slate-500 font-light">Consulte ou remarque horários</p>
            </div>
            <ChevronRight className="text-slate-300 group-hover:text-indigo-400 transition-colors" size={20} />
          </button>

          <button 
            onClick={() => handleAction('/client/loyalty')}
            className="group relative flex items-center p-5 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 hover:border-amber-200 hover:shadow-[0_8px_30px_rgba(245,158,11,0.1)] transition-all duration-300 w-full text-left"
          >
            <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
              <Crown size={24} />
            </div>
            <div className="ml-5 flex-1">
              <h3 className="font-bold text-slate-900 text-lg">Clube de Fidelidade</h3>
              <p className="text-sm text-slate-500 font-light">Pontos, Pacotes e Prêmios</p>
            </div>
            <ChevronRight className="text-slate-300 group-hover:text-amber-400 transition-colors" size={20} />
          </button>

          <button 
            onClick={() => handleAction('/client/profile')}
            className="group relative flex items-center p-5 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 hover:border-emerald-200 hover:shadow-[0_8px_30px_rgba(16,185,129,0.1)] transition-all duration-300 w-full text-left"
          >
            <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
              <User size={24} />
            </div>
            <div className="ml-5 flex-1">
              <h3 className="font-bold text-slate-900 text-lg">Meu Perfil</h3>
              <p className="text-sm text-slate-500 font-light">Dados pessoais e preferências</p>
            </div>
            <ChevronRight className="text-slate-300 group-hover:text-emerald-400 transition-colors" size={20} />
          </button>

          <div className="pt-4 px-2">
            {!user ? (
              <Link 
                to="/login"
                className="flex items-center justify-center gap-2 w-full py-3.5 text-slate-600 font-medium hover:text-slate-900 transition-colors text-sm"
              >
                <LogIn size={18} />
                <span>Entrar na minha conta</span>
              </Link>
            ) : (
              <button 
                onClick={() => { StorageService.logout(); navigate(0); }}
                className="flex items-center justify-center gap-2 w-full py-3.5 text-slate-400 font-medium hover:text-rose-500 transition-colors text-sm"
              >
                <LogOut size={18} />
                <span>Sair da conta</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer Link */}
        <div className="mt-8">
            <Link to="/admin/login" className="text-[10px] uppercase tracking-widest text-slate-300 hover:text-slate-400 transition-colors">
               Área Administrativa
            </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;