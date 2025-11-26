import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { StorageService } from '../services/storage';
import { Role } from '../types';
import { Sparkles } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = StorageService.login(loginInput, password);
    
    if (user) {
      if (user.role === Role.ADMIN) {
        navigate('/admin');
      } else {
        navigate('/client/book');
      }
    } else {
      setError('Credenciais inválidas. Tente novamente.');
    }
  };

  return (
    <Layout title="" showBack>
      <div className="max-w-sm mx-auto mt-10">
        
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-lg shadow-rose-200 mb-4">
               <Sparkles size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Bem-vindo de volta</h2>
            <p className="text-slate-500 text-sm">Acesse sua conta para agendar</p>
        </div>

        <div className="bg-white/70 backdrop-blur-md p-8 rounded-3xl border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-6 text-center border border-red-100 font-medium">
                {error}
            </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">E-mail ou Telefone</label>
                <input 
                type="text" 
                required
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-300 outline-none transition text-slate-900 font-medium"
                placeholder="Ex: seu@email.com"
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Senha</label>
                <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-300 outline-none transition text-slate-900 font-medium"
                placeholder="••••••••"
                />
            </div>

            <button 
                type="submit" 
                className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg shadow-slate-200 transform hover:-translate-y-0.5 duration-200"
            >
                Entrar
            </button>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-slate-100">
            <p className="text-slate-500 text-sm mb-2">Ainda não tem cadastro?</p>
            <Link to="/client/register" className="text-rose-600 font-bold hover:text-rose-700 hover:underline">
                Criar conta gratuitamente
            </Link>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;