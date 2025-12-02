import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { StorageService } from '../../services/storage';
import { ClientProfile, ServicePackage, ClientPackage, LoyaltyReward } from '../../types';
import { Crown, Gift, Tag, ChevronRight, PackageCheck, AlertCircle } from 'lucide-react';

const Loyalty: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<ClientProfile | null>(null);
  const [points, setPoints] = useState(0);
  const [myPackages, setMyPackages] = useState<ClientPackage[]>([]);
  const [shopPackages, setShopPackages] = useState<ServicePackage[]>([]);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);

  useEffect(() => {
    const currentUser = StorageService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    setPoints(currentUser.loyaltyPoints || 0);

    setMyPackages(StorageService.getClientPackages(currentUser.id));
    setShopPackages(StorageService.getServicePackages());
    setRewards(StorageService.getLoyaltyRewards());
  }, [navigate]);

  const handleBuyPackage = (pkg: ServicePackage) => {
    if (!user) return;
    if (window.confirm(`Deseja comprar o pacote "${pkg.name}" por R$ ${pkg.price}?`)) {
      StorageService.buyPackage(user.id, pkg);
      alert('Pacote comprado com sucesso! Seus créditos já estão disponíveis para agendamento.');
      setMyPackages(StorageService.getClientPackages(user.id));
    }
  };

  const handleRedeem = (reward: LoyaltyReward) => {
    if (points < reward.costPoints) return;
    if (window.confirm(`Resgatar "${reward.name}" por ${reward.costPoints} pontos?`)) {
       // Logic to deduct points would go here
       alert('Resgate realizado! Apresente este código na recepção: #LOYAL-' + Math.floor(Math.random()*1000));
    }
  };

  return (
    <Layout title="Clube de Fidelidade" showBack>
      
      {/* Points Balance Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl mb-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4">
            <Crown size={120} />
         </div>
         <div className="relative z-10">
            <p className="text-slate-300 text-sm font-medium uppercase tracking-wider mb-1">Meu Saldo de Pontos</p>
            <div className="flex items-baseline gap-2">
               <h2 className="text-5xl font-bold text-amber-400">{points}</h2>
               <span className="text-amber-200 font-medium">pts</span>
            </div>
            <p className="text-xs text-slate-400 mt-4">Ganhe 1 ponto a cada R$ 10,00 em serviços.</p>
         </div>
      </div>

      {/* My Active Packages */}
      <div className="mb-8">
         <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
            <PackageCheck size={20} className="text-rose-500" /> Meus Pacotes Ativos
         </h3>
         
         {myPackages.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 text-sm">
               Você não possui pacotes ativos.
            </div>
         ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
               {myPackages.map(pkg => {
                 const totalItems = pkg.remainingItems.reduce((acc, i) => acc + i.count, 0);
                 return (
                    <div key={pkg.id} className="min-w-[240px] bg-white border border-rose-100 rounded-xl p-4 shadow-sm relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-16 h-16 bg-rose-50 rounded-bl-full -mr-8 -mt-8 z-0"></div>
                       <div className="relative z-10">
                          <h4 className="font-bold text-slate-900 mb-1">{pkg.name}</h4>
                          <p className="text-xs text-slate-500 mb-3">Vence em: {pkg.expirationDate.split('-').reverse().join('/')}</p>
                          <div className="bg-rose-50 text-rose-700 px-3 py-1 rounded-lg text-xs font-bold inline-block">
                             {totalItems} serviços restantes
                          </div>
                       </div>
                    </div>
                 )
               })}
            </div>
         )}
      </div>

      {/* Rewards Catalog */}
      <div className="mb-8">
         <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
            <Gift size={20} className="text-amber-500" /> Recompensas
         </h3>
         <div className="space-y-3">
            {rewards.map(reward => {
               const canAfford = points >= reward.costPoints;
               return (
                  <div key={reward.id} className={`flex items-center justify-between p-4 rounded-xl border ${canAfford ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                     <div>
                        <h4 className="font-bold text-slate-900">{reward.name}</h4>
                        <span className="text-xs font-bold text-amber-600">{reward.costPoints} pontos</span>
                     </div>
                     <button 
                        disabled={!canAfford}
                        onClick={() => handleRedeem(reward)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition ${canAfford ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                     >
                        Resgatar
                     </button>
                  </div>
               )
            })}
         </div>
      </div>

      {/* Buy Packages Store */}
      <div>
         <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
            <Tag size={20} className="text-indigo-500" /> Comprar Pacotes (Economize)
         </h3>
         <div className="grid gap-4">
            {shopPackages.map(pkg => (
               <div key={pkg.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-indigo-200 transition">
                  <div className="flex justify-between items-start mb-2">
                     <h4 className="font-bold text-slate-900 text-lg">{pkg.name}</h4>
                     <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-1 rounded text-xs">-{Math.round(Math.random() * 10 + 10)}% OFF</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-4">
                     Validade de {pkg.validityMonths} meses. Inclui {pkg.items.reduce((a,b)=>a+b.count,0)} serviços.
                  </p>
                  <button 
                     onClick={() => handleBuyPackage(pkg)}
                     className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 flex justify-between px-4"
                  >
                     <span>Comprar Agora</span>
                     <span>R$ {pkg.price}</span>
                  </button>
               </div>
            ))}
         </div>
      </div>

    </Layout>
  );
};

export default Loyalty;