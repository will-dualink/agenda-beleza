
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { StorageService } from '../../services/storage';
import { Role } from '../../types';
import { ShieldCheck, Lock, ArrowLeft } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const user = StorageService.login(email, password);
    
    if (user) {
      if (user.role === Role.ADMIN) {
        navigate('/admin');
      } else {
        setError('Esta conta não possui privilégios administrativos.');
      }
    } else {
      setError('Credenciais inválidas.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        
        <div className="text-center mb-10 animate-fade-in-up">
           <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 text-rose-500 mb-4 border border-white/5 backdrop-blur-sm">
              <ShieldCheck size={32} />
           </div>
           <h1 className="text-2xl font-bold text-white tracking-tight">Portal Administrativo</h1>
           <p className="text-slate-400 text-sm mt-2">Gestão e Controle - Agenda Beleza</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up delay-100">
           <div className="h-2 bg-gradient-to-r from-rose-500 to-indigo-600"></div>
           <div className="p-8">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 border border-red-100 flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Login Administrativo</label>
                    <input 
                      type="text" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-slate-900"
                      placeholder="admin@salao.com"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Senha de Acesso</label>
                    <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-slate-900"
                        placeholder="••••••••"
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition shadow-lg transform hover:-translate-y-0.5 duration-200"
                >
                    Acessar Painel
                </button>
              </form>
           </div>
           <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
              <Link to="/" className="text-sm text-slate-500 hover:text-slate-800 font-medium flex items-center justify-center gap-2 transition">
                 <ArrowLeft size={14} /> Voltar ao Início
              </Link>
           </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-8">
           Acesso restrito a pessoal autorizado. <br/>
           Todas as ações são monitoradas.
        </p>

      </div>
    </div>
  );
};

// Helper icon component for this file locally if needed, or import
const AlertCircle = ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
);

export default AdminLogin;
