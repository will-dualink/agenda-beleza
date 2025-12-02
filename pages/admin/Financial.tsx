
import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { StorageService } from '../../services/storage';
import { Transaction, Professional, PaymentMethod, Commission, Appointment, Service } from '../../types';
import { DollarSign, TrendingUp, TrendingDown, Calendar, PieChart, BarChart3, Scissors, ArrowUpRight } from 'lucide-react';
import { Masks } from '../../utils/masks';

const Financial: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pros, setPros] = useState<Professional[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [commissionsList, setCommissionsList] = useState<Commission[]>([]);
  
  // Data for Reports
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  useEffect(() => {
    setTransactions(StorageService.getTransactions());
    setPros(StorageService.getProfessionals());
    setPaymentMethods(StorageService.getPaymentMethods());
    setCommissionsList(StorageService.getCommissions());
    setAppointments(StorageService.getAppointments());
    setServices(StorageService.getServices());
  }, []);

  // Filter transactions by selected month
  const filteredTransactions = transactions.filter(t => t.date.startsWith(filterMonth));

  const totalIncome = filteredTransactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
  const profit = totalIncome - totalExpense;

  // --- CHART DATA GENERATION ---
  const dailyRevenueData = React.useMemo(() => {
      const daysInMonth = new Date(parseInt(filterMonth.split('-')[0]), parseInt(filterMonth.split('-')[1]), 0).getDate();
      const data = [];
      let maxVal = 0;

      for (let i = 1; i <= daysInMonth; i++) {
          const dayStr = `${filterMonth}-${i.toString().padStart(2, '0')}`;
          const dayTotal = transactions
            .filter(t => t.date === dayStr && t.type === 'INCOME')
            .reduce((acc, t) => acc + t.amount, 0);
          
          if (dayTotal > maxVal) maxVal = dayTotal;
          
          data.push({ day: i, value: dayTotal, fullDate: dayStr });
      }
      return { data, maxVal };
  }, [transactions, filterMonth]);


  // --- REPORT 1: Commissions ---
  const commissionsReport = pros.map(pro => {
    const proCommissions = commissionsList.filter(c => 
        c.professionalId === pro.id && 
        c.date.startsWith(filterMonth)
    );
    const totalCommissionValue = proCommissions.reduce((acc, c) => acc + c.amount, 0);
    
    return {
        pro,
        commissionAmount: totalCommissionValue,
        count: proCommissions.length
    };
  });

  // --- REPORT 2: Top Services ---
  const servicesReport = React.useMemo(() => {
     const stats: Record<string, { service: Service, count: number, revenue: number }> = {};

     filteredTransactions.forEach(t => {
        // Consider standard Service payments AND Package Usage (to count popularity, even if revenue shows 0 here)
        if (t.category === 'SERVICE' || t.category === 'PACKAGE_USAGE') {
            const app = appointments.find(a => a.id === t.appointmentId);
            if (app) {
                const srv = services.find(s => s.id === app.serviceId);
                if (srv) {
                    if (!stats[srv.id]) {
                        stats[srv.id] = { service: srv, count: 0, revenue: 0 };
                    }
                    stats[srv.id].count += 1;
                    stats[srv.id].revenue += t.amount;
                }
            }
        }
     });

     return Object.values(stats).sort((a, b) => b.count - a.count);
  }, [filteredTransactions, appointments, services]);


  const getPaymentMethodName = (id?: string) => {
     if (!id) return '-';
     return paymentMethods.find(pm => pm.id === id)?.name || id;
  };

  return (
    <Layout title="Financeiro & Comissões" isAdmin showBack>
       {/* Filters */}
       <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                <Calendar size={20} />
            </div>
            <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Período de Análise</p>
                <input 
                    type="month" 
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="border-none outline-none font-bold text-slate-900 bg-transparent text-lg p-0 cursor-pointer hover:text-rose-600 transition"
                />
            </div>
          </div>
          <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-400 font-bold uppercase">Resultado do Mês</p>
              <p className={`font-bold text-lg ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {profit >= 0 ? '+' : ''} {Masks.currency(profit)}
              </p>
          </div>
       </div>

       {/* KPIs */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <TrendingUp size={48} />
             </div>
             <p className="text-emerald-600 text-sm font-bold uppercase tracking-wide flex items-center gap-2 relative z-10">
                <TrendingUp size={16}/> Receita Bruta
             </p>
             <h3 className="text-3xl font-bold text-emerald-800 mt-2 relative z-10">{Masks.currency(totalIncome)}</h3>
          </div>
          <div className="bg-red-50 border border-red-100 p-6 rounded-xl shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <TrendingDown size={48} />
             </div>
             <p className="text-red-600 text-sm font-bold uppercase tracking-wide flex items-center gap-2 relative z-10">
                <TrendingDown size={16}/> Despesas
             </p>
             <h3 className="text-3xl font-bold text-red-800 mt-2 relative z-10">{Masks.currency(totalExpense)}</h3>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <DollarSign size={48} />
             </div>
             <p className="text-indigo-600 text-sm font-bold uppercase tracking-wide flex items-center gap-2 relative z-10">
                <DollarSign size={16}/> Lucro Líquido
             </p>
             <h3 className="text-3xl font-bold text-indigo-800 mt-2 relative z-10">{Masks.currency(profit)}</h3>
          </div>
       </div>

       {/* REVENUE CHART */}
       <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-sm">
           <div className="flex items-center justify-between mb-6">
               <h3 className="font-bold text-slate-900 flex items-center gap-2">
                   <BarChart3 size={20} className="text-rose-500"/> Performance Diária
               </h3>
               <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded">Receita (Entradas)</span>
           </div>
           
           <div className="h-48 flex items-end gap-1 sm:gap-2">
               {dailyRevenueData.data.map((d) => {
                   const heightPercent = dailyRevenueData.maxVal > 0 ? (d.value / dailyRevenueData.maxVal) * 100 : 0;
                   return (
                       <div key={d.day} className="flex-1 flex flex-col justify-end group relative">
                           {/* Tooltip */}
                           <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 font-bold">
                               {d.fullDate.split('-').reverse().slice(0,2).join('/')}: {Masks.currency(d.value)}
                           </div>
                           
                           <div 
                                style={{ height: `${Math.max(heightPercent, 0)}%` }} 
                                className={`w-full min-h-[4px] rounded-t-sm transition-all duration-500 ${d.value > 0 ? 'bg-rose-400 group-hover:bg-rose-600' : 'bg-slate-100'}`}
                           ></div>
                           
                           {/* X Axis Label */}
                           {d.day % 2 !== 0 && ( // Show every other day to prevent clutter
                               <span className="text-[10px] text-slate-400 text-center mt-2 font-medium">{d.day}</span>
                           )}
                       </div>
                   )
               })}
           </div>
       </div>

       {/* Reports Grid */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Commissions Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
             <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                        <PieChart size={20} className="text-rose-500" /> Comissões
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Valores a pagar para a equipe.</p>
                </div>
                <button className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
                    Exportar <ArrowUpRight size={12}/>
                </button>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white text-slate-500 font-medium border-b border-slate-100">
                    <tr>
                        <th className="p-4">Profissional</th>
                        <th className="p-4 text-center">Qtd</th>
                        <th className="p-4 text-right">Total</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {commissionsReport.map(c => (
                        <tr key={c.pro.id} className="hover:bg-slate-50 transition">
                            <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                                <img src={c.pro.avatarUrl} className="w-6 h-6 rounded-full bg-slate-200" alt=""/>
                                <span className="truncate">{c.pro.name}</span>
                            </td>
                            <td className="p-4 text-center text-slate-600">{c.count}</td>
                            <td className="p-4 text-right font-bold text-green-600">{Masks.currency(c.commissionAmount)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
             </div>
          </div>

          {/* Top Services Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
             <div className="p-5 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                    <BarChart3 size={20} className="text-indigo-500" /> Serviços Populares
                </h3>
                <p className="text-xs text-slate-500 mt-1">Ranking por volume de agendamentos.</p>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white text-slate-500 font-medium border-b border-slate-100">
                    <tr>
                        <th className="p-4">Serviço</th>
                        <th className="p-4 text-center">Agendamentos</th>
                        <th className="p-4 text-right">Receita</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {servicesReport.length === 0 ? (
                        <tr><td colSpan={3} className="p-6 text-center text-slate-400">Sem dados neste período.</td></tr>
                    ) : (
                        servicesReport.slice(0, 5).map((item, idx) => (
                            <tr key={item.service.id} className="hover:bg-slate-50 transition">
                                <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                                    <div className={`p-1.5 rounded-lg text-xs font-bold w-6 h-6 flex items-center justify-center ${idx === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {idx + 1}
                                    </div>
                                    <span className="truncate">{item.service.name}</span>
                                </td>
                                <td className="p-4 text-center font-medium">
                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">{item.count}</span>
                                </td>
                                <td className="p-4 text-right font-bold text-slate-700">{Masks.currency(item.revenue)}</td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
             </div>
          </div>

       </div>

       {/* Transactions List */}
       <div>
          <h3 className="font-bold text-slate-900 text-lg mb-4">Extrato de Movimentações</h3>
          <div className="space-y-2">
             {filteredTransactions.length === 0 ? <p className="text-slate-500 text-sm">Sem movimentações neste mês.</p> : filteredTransactions.map(t => (
                <div key={t.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition">
                   <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${t.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                          {t.type === 'INCOME' ? <ArrowUpRight size={20}/> : <TrendingDown size={20}/>}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{t.description}</p>
                        <p className="text-xs text-slate-400 uppercase tracking-wider">{t.date.split('-').reverse().join('/')} • {t.category}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <span className={`block font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {t.type === 'INCOME' ? '+' : '-'} {Masks.currency(t.amount)}
                      </span>
                      {t.paymentMethodId && (
                         <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded inline-block mt-1">
                             {getPaymentMethodName(t.paymentMethodId)}
                         </span>
                      )}
                      {t.category === 'PACKAGE_USAGE' && (
                         <span className="text-xs text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded inline-block mt-1 ml-2">
                             Pacote
                         </span>
                      )}
                   </div>
                </div>
             ))}
          </div>
       </div>
    </Layout>
  );
};

export default Financial;
