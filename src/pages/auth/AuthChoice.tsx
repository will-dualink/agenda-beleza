import React, { useState } from 'react';
import { User, Sparkles } from 'lucide-react';

interface AuthChoiceProps {
  onAdminClick: () => void;
  onClientClick: () => void;
}

export const AuthChoice: React.FC<AuthChoiceProps> = ({ onAdminClick, onClientClick }) => {
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-400 to-pink-600 rounded-full mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">AgendaBeleza</h1>
          <p className="text-xl text-slate-400">Sistema de Agendamentos de Serviços de Beleza</p>
        </div>

        {/* Client Card - Destaque Principal */}
        <div className="mb-8">
          <button
            onClick={onClientClick}
            className="w-full group relative bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-10 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 overflow-hidden"
          >
            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
                <User className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-3xl font-bold text-white mb-3">Agendar Serviço</h2>
              <p className="text-white/90 text-lg">
                Faça seu agendamento de forma rápida e fácil
              </p>

              <div className="mt-6 inline-block px-8 py-3 bg-white text-blue-600 font-bold rounded-lg group-hover:shadow-lg transition-all duration-300">
                Continuar →
              </div>
            </div>
          </button>
        </div>

        {/* Admin Toggle - Discreto */}
        <div className="text-center">
          <button
            onClick={() => setShowAdmin(!showAdmin)}
            className="text-slate-500 hover:text-slate-400 text-sm transition-colors"
          >
            {showAdmin ? '✕ Esconder acesso administrativo' : '⋮ Acesso administrativo'}
          </button>

          {showAdmin && (
            <div className="mt-6 animate-fade-in">
              <button
                onClick={onAdminClick}
                className="inline-block px-6 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white font-medium rounded-lg transition-all duration-300 border border-slate-600 hover:border-slate-500"
              >
                Painel Admin
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-slate-500">
          <p className="text-sm">© 2025 AgendaBeleza. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthChoice;
