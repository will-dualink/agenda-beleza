import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { StorageService } from '../../services/storage';
import { ServicePackage, Service, LoyaltyReward, Promotion } from '../../types';
import { Plus, Trash2, Gift, Clock, Tag } from 'lucide-react';

const LoyaltyManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PACKAGES' | 'REWARDS' | 'PROMOS'>('PACKAGES');
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  // Simple Create States
  const [newPkgName, setNewPkgName] = useState('');
  const [newPkgPrice, setNewPkgPrice] = useState(0);
  const [newPkgValidity, setNewPkgValidity] = useState(3);
  const [newRewardName, setNewRewardName] = useState('');
  const [newRewardCost, setNewRewardCost] = useState(100);

  useEffect(() => {
    setPackages(StorageService.getServicePackages());
    setRewards(StorageService.getLoyaltyRewards());
    setPromos(StorageService.getPromotions());
    setServices(StorageService.getServices());
  }, []);

  const handleCreatePackage = () => {
    if (!newPkgName || !newPkgPrice) return;
    const newPkg: ServicePackage = {
      id: Math.random().toString(36).substr(2, 9),
      name: newPkgName,
      price: newPkgPrice,
      validityMonths: newPkgValidity,
      items: [] // In a real UI, would have a multi-select for services
    };
    const updated = [...packages, newPkg];
    setPackages(updated);
    StorageService.saveServicePackages(updated);
    setNewPkgName(''); setNewPkgPrice(0);
  };

  const handleCreateReward = () => {
    if (!newRewardName) return;
    const newRew: LoyaltyReward = {
      id: Math.random().toString(36).substr(2, 9),
      name: newRewardName,
      costPoints: newRewardCost,
      active: true
    };
    const updated = [...rewards, newRew];
    setRewards(updated);
    StorageService.saveLoyaltyRewards(updated);
    setNewRewardName(''); setNewRewardCost(100);
  };

  const togglePromo = (id: string) => {
    const updated = promos.map(p => p.id === id ? { ...p, active: !p.active } : p);
    setPromos(updated);
    StorageService.savePromotions(updated);
  };

  return (
    <Layout title="Fidelidade e Promoções" isAdmin showBack>
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('PACKAGES')}
          className={`px-4 py-3 font-bold text-sm border-b-2 transition ${activeTab === 'PACKAGES' ? 'border-rose-600 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Pacotes de Serviços
        </button>
        <button 
          onClick={() => setActiveTab('REWARDS')}
          className={`px-4 py-3 font-bold text-sm border-b-2 transition ${activeTab === 'REWARDS' ? 'border-rose-600 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Recompensas
        </button>
        <button 
          onClick={() => setActiveTab('PROMOS')}
          className={`px-4 py-3 font-bold text-sm border-b-2 transition ${activeTab === 'PROMOS' ? 'border-rose-600 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Promoções Ativas
        </button>
      </div>

      {activeTab === 'PACKAGES' && (
        <div className="space-y-6 animate-fade-in">
           <div className="bg-white p-6 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4">Criar Novo Pacote</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2">
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Pacote</label>
                   <input className="w-full p-2 border rounded-lg" value={newPkgName} onChange={e => setNewPkgName(e.target.value)} placeholder="Ex: Combo Manicure" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Preço (R$)</label>
                   <input type="number" className="w-full p-2 border rounded-lg" value={newPkgPrice} onChange={e => setNewPkgPrice(Number(e.target.value))} />
                </div>
                <button onClick={handleCreatePackage} className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800">Criar</button>
              </div>
              <p className="text-xs text-slate-400 mt-2">* Na versão completa, adicione seleção de serviços inclusos.</p>
           </div>

           <div className="space-y-3">
              {packages.map(pkg => (
                <div key={pkg.id} className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center text-rose-500">
                         <Gift size={20} />
                      </div>
                      <div>
                         <h4 className="font-bold text-slate-900">{pkg.name}</h4>
                         <p className="text-xs text-slate-500">Validade: {pkg.validityMonths} meses • Itens: {pkg.items.length}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <span className="font-bold text-slate-900">R$ {pkg.price}</span>
                      <button className="text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {activeTab === 'REWARDS' && (
        <div className="space-y-6 animate-fade-in">
           <div className="bg-white p-6 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4">Adicionar Recompensa</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2">
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome</label>
                   <input className="w-full p-2 border rounded-lg" value={newRewardName} onChange={e => setNewRewardName(e.target.value)} placeholder="Ex: Hidratação Grátis" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Custo (Pontos)</label>
                   <input type="number" className="w-full p-2 border rounded-lg" value={newRewardCost} onChange={e => setNewRewardCost(Number(e.target.value))} />
                </div>
                <button onClick={handleCreateReward} className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800">Adicionar</button>
              </div>
           </div>

           <div className="space-y-3">
              {rewards.map(r => (
                <div key={r.id} className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500">
                         <Tag size={20} />
                      </div>
                      <h4 className="font-bold text-slate-900">{r.name}</h4>
                   </div>
                   <div className="flex items-center gap-4">
                      <span className="font-bold text-amber-600">{r.costPoints} pts</span>
                      <button className="text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {activeTab === 'PROMOS' && (
        <div className="space-y-4 animate-fade-in">
           {promos.map(promo => (
             <div key={promo.id} className={`bg-white p-6 rounded-xl border transition-all ${promo.active ? 'border-rose-400 shadow-md' : 'border-slate-200 opacity-70'}`}>
                <div className="flex justify-between items-start">
                   <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${promo.active ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'}`}>
                         <Clock size={24} />
                      </div>
                      <div>
                         <h4 className="font-bold text-slate-900 text-lg">{promo.name}</h4>
                         <p className="text-sm text-slate-500 mt-1">
                            {promo.type === 'HAPPY_HOUR' ? 'Desconto automático em horários específicos.' : 'Desconto automático na semana do aniversário.'}
                         </p>
                         <div className="mt-3 flex items-center gap-2">
                            <span className="px-2 py-1 bg-rose-50 text-rose-700 font-bold rounded text-xs">-{promo.discountPercentage}% OFF</span>
                            {promo.rules?.daysOfWeek && <span className="text-xs text-slate-400">Terças (09h - 14h)</span>}
                         </div>
                      </div>
                   </div>
                   
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={promo.active} onChange={() => togglePromo(promo.id)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                   </label>
                </div>
             </div>
           ))}
        </div>
      )}
    </Layout>
  );
};

export default LoyaltyManager;