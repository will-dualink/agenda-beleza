import React, { useState } from 'react';
import { User, Sparkles, Heart } from 'lucide-react';

interface AuthChoiceProps {
  onAdminClick: () => void;
  onClientClick: () => void;
}

export const AuthChoice: React.FC<AuthChoiceProps> = ({ onAdminClick, onClientClick }) => {
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-pink-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-rose-200/30 to-orange-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-gradient-to-br from-amber-100/20 to-purple-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-2xl z-10">
        {/* Premium Header */}
        <div className="text-center mb-12">
          {/* Logo with Premium Touch */}
          <div className="inline-block mb-8">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-300 via-pink-300 to-rose-300 rounded-full blur-lg opacity-60"></div>
              <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-full shadow-2xl">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          {/* Brand Name - Premium Typography */}
          <h1 className="text-6xl md:text-7xl font-light tracking-wide text-gray-900 mb-2">
            Agenda<span className="font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">Beleza</span>
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-purple-400 to-rose-400 mx-auto mb-6 rounded-full"></div>
          <p className="text-lg text-gray-600 font-light tracking-wide">Experiência Premium em Beleza e Bem-estar</p>
        </div>

        {/* Client Card - Main CTA */}
        <div className="mb-8 group">
          <button
            onClick={onClientClick}
            className="w-full relative bg-white rounded-3xl p-8 md:p-12 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-purple-100/50 hover:border-purple-200"
          >
            {/* Gradient Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-pink-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-100/40 to-pink-100/20 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-500"></div>

            <div className="relative">
              {/* Icon - Premium Style */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-8 h-8 text-rose-500" />
              </div>

              {/* Content */}
              <h2 className="text-4xl font-light text-gray-900 mb-3">
                Seu <span className="font-semibold bg-gradient-to-r from-purple-600 to-rose-600 bg-clip-text text-transparent">Momento de Beleza</span>
              </h2>
              <p className="text-gray-600 text-lg font-light mb-8 leading-relaxed">
                Agende seus serviços de forma elegante e rápida. Escolha entre profissionais especializados e aproveite ofertas exclusivas.
              </p>

              {/* Features List - Premium Style */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center">
                  <p className="text-2xl font-semibold text-purple-600 mb-1">12+</p>
                  <p className="text-sm text-gray-600 font-light">Serviços</p>
                </div>
                <div className="text-center border-l border-r border-gray-200">
                  <p className="text-2xl font-semibold text-pink-600 mb-1">8+</p>
                  <p className="text-sm text-gray-600 font-light">Profissionais</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-rose-600 mb-1">5★</p>
                  <p className="text-sm text-gray-600 font-light">Avaliação</p>
                </div>
              </div>

              {/* CTA Button */}
              <button className="w-full py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white font-semibold rounded-2xl hover:shadow-lg hover:shadow-purple-300/50 transition-all duration-300 text-lg group/btn overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-pink-700 to-rose-700 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center justify-center gap-2">
                  Agendar Agora <span className="text-xl">→</span>
                </span>
              </button>
            </div>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          <p className="text-gray-500 text-sm font-light">ou</p>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        </div>

        {/* Admin Access - Very Discrete */}
        <div className="text-center">
          <button
            onClick={() => setShowAdmin(!showAdmin)}
            className="text-gray-400 hover:text-gray-600 text-xs transition-colors font-light tracking-widest uppercase"
          >
            {showAdmin ? '✕' : '●●●'}
          </button>

          {showAdmin && (
            <div className="mt-6 animate-fade-in">
              <button
                onClick={onAdminClick}
                className="px-8 py-2 bg-gray-900 hover:bg-gray-800 text-white font-light rounded-xl transition-all duration-300 text-sm tracking-wide"
              >
                Acesso Admin
              </button>
            </div>
          )}
        </div>

        {/* Premium Footer */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 text-xs font-light tracking-widest uppercase mb-4">Confiança e Qualidade</p>
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <p className="text-xl font-semibold text-gray-800">100%</p>
              <p className="text-xs text-gray-600 font-light">Seguro</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold text-gray-800">24/7</p>
              <p className="text-xs text-gray-600 font-light">Disponível</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold text-gray-800">∞</p>
              <p className="text-xs text-gray-600 font-light">Satisfação</p>
            </div>
          </div>
          <p className="text-gray-500 text-xs font-light">© 2025 AgendaBeleza — Premium Beauty Scheduling</p>
        </div>
      </div>
    </div>
  );
};

export default AuthChoice;
