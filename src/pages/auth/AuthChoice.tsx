import React from 'react';
import { Lock, User, Sparkles } from 'lucide-react';

interface AuthChoiceProps {
  onAdminClick: () => void;
  onClientClick: () => void;
}

export const AuthChoice: React.FC<AuthChoiceProps> = ({ onAdminClick, onClientClick }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-400 to-pink-600 rounded-full mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">AgendaBeleza</h1>
          <p className="text-xl text-slate-400">Sistema de Agendamentos de Serviços de Beleza</p>
        </div>

        {/* Choice Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Admin Card */}
          <button
            onClick={onAdminClick}
            className="group relative bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 hover:border-rose-500/50 hover:bg-slate-800/70 transition-all duration-300 overflow-hidden"
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/0 to-pink-600/0 group-hover:from-rose-500/10 group-hover:to-pink-600/10 transition-all duration-300"></div>

            <div className="relative">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-600 rounded-full mb-6 group-hover:shadow-lg group-hover:shadow-rose-500/50 transition-all duration-300">
                <Lock className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <h2 className="text-2xl font-bold text-white mb-3">Administrador</h2>
              <p className="text-slate-400 mb-6">
                Acesse o painel administrativo para gerenciar serviços, equipe, agendamentos e financeiro.
              </p>

              {/* Features */}
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-slate-300">
                  <div className="w-1.5 h-1.5 bg-rose-400 rounded-full"></div>
                  Gerenciar serviços
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-300">
                  <div className="w-1.5 h-1.5 bg-rose-400 rounded-full"></div>
                  Gerenciar equipe
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-300">
                  <div className="w-1.5 h-1.5 bg-rose-400 rounded-full"></div>
                  Relatórios financeiros
                </li>
              </ul>

              {/* Button */}
              <div className="inline-block px-6 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold rounded-lg group-hover:shadow-lg group-hover:shadow-rose-500/50 transition-all duration-300">
                Entrar como Admin
              </div>
            </div>
          </button>

          {/* Client Card */}
          <button
            onClick={onClientClick}
            className="group relative bg-white/5 backdrop-blur-xl border border-slate-600 rounded-2xl p-8 hover:border-pink-500/50 hover:bg-white/10 transition-all duration-300 overflow-hidden"
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-rose-600/0 group-hover:from-pink-500/10 group-hover:to-rose-600/10 transition-all duration-300"></div>

            <div className="relative">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-full mb-6 group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300">
                <User className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <h2 className="text-2xl font-bold text-white mb-3">Cliente</h2>
              <p className="text-slate-400 mb-6">
                Faça seu agendamento de forma rápida e fácil. Escolha seus serviços preferidos.
              </p>

              {/* Features */}
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-slate-300">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                  Agendar serviços
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-300">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                  Ver profissionais
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-300">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                  Gerenciar agendamentos
                </li>
              </ul>

              {/* Button */}
              <div className="inline-block px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-lg group-hover:shadow-lg group-hover:shadow-cyan-500/50 transition-all duration-300">
                Agendar Agora
              </div>
            </div>
          </button>
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
