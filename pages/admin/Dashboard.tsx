
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { StorageService } from '../../services/storage';
import { GeminiService } from '../../services/gemini';
import { Appointment, AppointmentStatus } from '../../types';
import { CalendarDays, Users, TrendingUp, Sparkles, Settings, SlidersHorizontal, Bell, User, Briefcase, DollarSign, Crown, Package } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    const data = StorageService.getAppointments();
    setAppointments(data);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const pendingCount = appointments.filter(a => a.status === AppointmentStatus.PENDING).length;
  const todayCount = appointments.filter(a => a.date === todayStr && a.status !== AppointmentStatus.CANCELLED).length;
  
  const totalRevenue = appointments
     .filter(a => a.status === AppointmentStatus.COMPLETED)
     .reduce((acc, curr) => {
         const services = StorageService.getServices();
         const service = services.find(s => s.id === curr.serviceId);
         return acc + (service ? service.price : 0);
     }, 0);

  const cancelledToday = appointments.filter(a => 
      a.status === AppointmentStatus.CANCELLED && 
      a.date === todayStr
  );

  const handleAiAnalysis = async () => {
    setLoadingAi(true);
    const todayAppointments = appointments
        .filter(a => a.date === todayStr)
        .map(a => `${a.time}: ${a.clientName} (${a.status})`)
        .join(', ');
        
    const analysis = await GeminiService.analyzeDailySchedule(todayAppointments || "Sem agendamentos hoje.");
    setAiInsight(analysis);
    setLoadingAi(false);
  };

  return (
    <Layout title="Painel de Controle" isAdmin showBack>
      {cancelledToday.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
           <div className="p-2 bg-white rounded-full text-red-500 shadow-sm">
             <Bell size={20} />
           </div>
           <div>
              <h3 className="font-bold text-red-800">Atenção: Cancelamentos Hoje</h3>
              <p className="text-sm text-red-600 mt-1">
                 {cancelledToday.length} agendamento(s) foram cancelados ou reagendados para hoje. Verifique a agenda para preencher as lacunas.
              </p>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Agendamentos Hoje</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{todayCount}</h3>
            </div>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><CalendarDays size={20} /></div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Pendentes</p>
              <h3 className="text-3xl font-bold text-orange-500 mt-2">{pendingCount}</h3>
            </div>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Users size={20} /></div>
          </div>
        </div>

        <Link to="/admin/financial" className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-300 transition block">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Receita Acumulada</p>
              <h3 className="text-3xl font-bold text-emerald-600 mt-2">R$ {totalRevenue.toFixed(0)}</h3>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp size={20} /></div>
          </div>
        </Link>
      </div>

      <div className="bg-gradient-to-r from-violet-900 to-indigo-900 rounded-xl p-6 text-white mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
             <Sparkles className="text-yellow-400" size={20} />
             <h3 className="font-bold text-lg">Assistente Inteligente</h3>
          </div>
          <p className="text-indigo-100 text-sm mb-4 max-w-lg">
            Use IA para analisar a eficiência da sua agenda de hoje e identificar oportunidades.
          </p>
          
          {aiInsight ? (
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm text-sm leading-relaxed border border-white/20">
              {aiInsight}
            </div>
          ) : (
            <button 
                onClick={handleAiAnalysis}
                disabled={loadingAi}
                className="bg-white text-indigo-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 transition"
            >
                {loadingAi ? 'Analisando...' : 'Gerar Análise Diária'}
            </button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Link to="/admin/schedule" className="group p-5 bg-white border border-slate-200 rounded-xl hover:shadow-md transition flex items-center justify-between">
           <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                <CalendarDays size={20} />
             </div>
             <div className="text-left">
                <h4 className="font-bold text-slate-900">Agenda Operacional</h4>
                <p className="text-xs text-slate-500">Visualizar e gerenciar horários</p>
             </div>
           </div>
        </Link>

        <Link to="/admin/financial" className="group p-5 bg-white border border-slate-200 rounded-xl hover:shadow-md transition flex items-center justify-between">
           <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                <DollarSign size={20} />
             </div>
             <div className="text-left">
                <h4 className="font-bold text-slate-900">Financeiro & Comissões</h4>
                <p className="text-xs text-slate-500">Receita, despesas e pagamentos</p>
             </div>
           </div>
        </Link>
        
        <Link to="/admin/inventory" className="group p-5 bg-white border border-slate-200 rounded-xl hover:shadow-md transition flex items-center justify-between">
           <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                <Package size={20} />
             </div>
             <div className="text-left">
                <h4 className="font-bold text-slate-900">Estoque & Materiais</h4>
                <p className="text-xs text-slate-500">Produtos, consumo e custos</p>
             </div>
           </div>
        </Link>

        <Link to="/admin/loyalty" className="group p-5 bg-white border border-slate-200 rounded-xl hover:shadow-md transition flex items-center justify-between">
           <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                <Crown size={20} />
             </div>
             <div className="text-left">
                <h4 className="font-bold text-slate-900">Fidelidade & Promoções</h4>
                <p className="text-xs text-slate-500">Pacotes, pontos e campanhas</p>
             </div>
           </div>
        </Link>

        <Link to="/admin/clients" className="group p-5 bg-white border border-slate-200 rounded-xl hover:shadow-md transition flex items-center justify-between">
           <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                <User size={20} />
             </div>
             <div className="text-left">
                <h4 className="font-bold text-slate-900">Gestão de Clientes</h4>
                <p className="text-xs text-slate-500">CRM, Histórico e Notas</p>
             </div>
           </div>
        </Link>

        <Link to="/admin/team" className="group p-5 bg-white border border-slate-200 rounded-xl hover:shadow-md transition flex items-center justify-between">
           <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                <Briefcase size={20} />
             </div>
             <div className="text-left">
                <h4 className="font-bold text-slate-900">Profissionais & Equipe</h4>
                <p className="text-xs text-slate-500">Escalas, comissões e cadastro</p>
             </div>
           </div>
        </Link>
        
        <Link to="/admin/services" className="group p-5 bg-white border border-slate-200 rounded-xl hover:shadow-md transition flex items-center justify-between">
           <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                <Settings size={20} />
             </div>
             <div className="text-left">
                <h4 className="font-bold text-slate-900">Catálogo de Serviços</h4>
                <p className="text-xs text-slate-500">Preços e duração</p>
             </div>
           </div>
        </Link>
        
        <Link to="/admin/settings" className="group p-5 bg-white border border-slate-200 rounded-xl hover:shadow-md transition flex items-center justify-between">
           <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                <SlidersHorizontal size={20} />
             </div>
             <div className="text-left">
                <h4 className="font-bold text-slate-900">Configurações</h4>
                <p className="text-xs text-slate-500">Políticas de cancelamento</p>
             </div>
           </div>
        </Link>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
