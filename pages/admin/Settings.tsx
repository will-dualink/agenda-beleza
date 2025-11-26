
import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { StorageService } from '../../services/storage';
import { SalonConfig, PaymentMethod } from '../../types';
import { Save, CreditCard, Trash2, Plus, Info } from 'lucide-react';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'PAYMENTS'>('GENERAL');
  
  // Config State
  const [config, setConfig] = useState<SalonConfig>(StorageService.getConfig());
  
  // Payments State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [newMethodName, setNewMethodName] = useState('');

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPaymentMethods(StorageService.getPaymentMethods());
  }, []);

  const handleSaveConfig = () => {
    StorageService.saveConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSavePayments = (updatedMethods: PaymentMethod[]) => {
    setPaymentMethods(updatedMethods);
    StorageService.savePaymentMethods(updatedMethods);
  };

  const handleTogglePayment = (id: string) => {
    const updated = paymentMethods.map(pm => pm.id === id ? { ...pm, active: !pm.active } : pm);
    handleSavePayments(updated);
  };

  const handleUpdatePaymentName = (id: string, newName: string) => {
    const updated = paymentMethods.map(pm => pm.id === id ? { ...pm, name: newName } : pm);
    handleSavePayments(updated);
  };

  const handleDeletePayment = (id: string) => {
    if (window.confirm('Tem certeza? Isso pode afetar históricos de transações.')) {
        const updated = paymentMethods.filter(pm => pm.id !== id);
        handleSavePayments(updated);
    }
  };

  const handleAddPayment = () => {
    if (!newMethodName) return;
    const newMethod: PaymentMethod = {
        id: `pm_${Math.random().toString(36).substr(2, 9)}`,
        name: newMethodName,
        active: true
    };
    handleSavePayments([...paymentMethods, newMethod]);
    setNewMethodName('');
  };

  return (
    <Layout title="Configurações do Salão" isAdmin showBack>
       <div className="flex gap-2 mb-6 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('GENERAL')}
          className={`px-4 py-3 font-bold text-sm border-b-2 transition ${activeTab === 'GENERAL' ? 'border-rose-600 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Geral
        </button>
        <button 
          onClick={() => setActiveTab('PAYMENTS')}
          className={`px-4 py-3 font-bold text-sm border-b-2 transition ${activeTab === 'PAYMENTS' ? 'border-rose-600 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Formas de Pagamento
        </button>
      </div>

       {activeTab === 'GENERAL' && (
           <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm animate-fade-in">
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-slate-900">Políticas de Agendamento</h3>
                    <p className="text-sm text-slate-500">Defina as regras para o funcionamento do app do cliente.</p>
                </div>
                
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                        Janela de Cancelamento (Horas)
                        </label>
                        <div className="flex gap-4 items-center">
                            <input 
                            type="number" 
                            min="0"
                            max="72"
                            value={config.cancellationWindowHours}
                            onChange={(e) => setConfig({ ...config, cancellationWindowHours: parseInt(e.target.value) || 0 })}
                            className="w-24 p-3 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                            />
                            <span className="text-slate-500 text-sm">horas de antecedência mínima.</span>
                        </div>
                        
                        {/* Visual Indicator with Dynamic Example */}
                        <div className="mt-4 bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex gap-3 text-indigo-900 text-sm">
                            <Info size={20} className="shrink-0 text-indigo-600 mt-0.5" />
                            <div>
                                <span className="font-bold block mb-1 text-indigo-800">Impacto na Experiência do Cliente</span>
                                <p className="leading-relaxed opacity-90 mb-3">
                                    Isso define o prazo limite para cancelamentos ou reagendamentos automáticos através do aplicativo.
                                </p>
                                <div className="bg-white/60 border border-indigo-100 p-3 rounded-lg text-xs font-medium text-indigo-800">
                                    {(() => {
                                        const h = config.cancellationWindowHours || 0;
                                        const exTime = 14; // Example appointment at 14:00
                                        let cutoff = exTime - h;
                                        let dayStr = "do mesmo dia";
                                        
                                        if (cutoff < 0) {
                                            cutoff += 24;
                                            dayStr = "do dia anterior";
                                        }
                                        
                                        // Handle cases spanning multiple days roughly for the example
                                        while (cutoff < 0) {
                                           cutoff += 24; 
                                        }

                                        const timeStr = `${Math.floor(cutoff).toString().padStart(2, '0')}:00`;

                                        return (
                                            <>
                                                <span className="font-bold">Exemplo Prático:</span> <br/>
                                                Para um agendamento às <strong>14:00</strong>, o cliente só poderá cancelar pelo app até às <strong>{timeStr} {dayStr}</strong>.
                                            </>
                                        )
                                    })()}
                                </div>
                                <p className="mt-2 text-xs opacity-70">
                                    Tentativas de cancelamento após este horário exibirão uma mensagem solicitando que o cliente entre em contato telefônico com o salão.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        {saved ? <span className="text-green-600 font-bold text-sm flex items-center gap-1">Configurações salvas com sucesso!</span> : <span></span>}
                        <button 
                        onClick={handleSaveConfig}
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition font-medium"
                        >
                        <Save size={18} /> Salvar Alterações
                        </button>
                    </div>
                </div>
            </div>
       )}

       {activeTab === 'PAYMENTS' && (
           <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm animate-fade-in">
               <div className="p-6 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <CreditCard size={20} className="text-rose-500"/> Métodos de Pagamento
                    </h3>
                    <p className="text-sm text-slate-500">Gerencie as opções exibidas para o cliente na hora do agendamento.</p>
               </div>

               <div className="p-6 space-y-4">
                   {paymentMethods.map(pm => (
                       <div key={pm.id} className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                           {/* Active Toggle */}
                           <button 
                               onClick={() => handleTogglePayment(pm.id)}
                               className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${pm.active ? 'bg-green-500' : 'bg-slate-300'}`}
                               title={pm.active ? "Desativar" : "Ativar"}
                           >
                               <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 shadow-sm ${pm.active ? 'left-7' : 'left-1'}`}></div>
                           </button>

                           {/* Editable Name */}
                           <div className="flex-1">
                               <input 
                                  value={pm.name}
                                  onChange={(e) => handleUpdatePaymentName(pm.id, e.target.value)}
                                  className="w-full bg-transparent border-none focus:bg-white focus:ring-2 focus:ring-slate-200 rounded p-1 font-medium text-slate-900 outline-none"
                               />
                           </div>

                           {/* Delete */}
                           <button 
                               onClick={() => handleDeletePayment(pm.id)}
                               className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                               title="Excluir"
                           >
                               <Trash2 size={18} />
                           </button>
                       </div>
                   ))}

                   {/* Add New */}
                   <div className="mt-6 flex gap-3 pt-6 border-t border-slate-100">
                       <input 
                          value={newMethodName}
                          onChange={(e) => setNewMethodName(e.target.value)}
                          placeholder="Novo método (Ex: Voucher)"
                          className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-rose-200 outline-none"
                       />
                       <button 
                          onClick={handleAddPayment}
                          className="px-4 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition font-bold"
                       >
                           <Plus size={20} />
                       </button>
                   </div>
               </div>
           </div>
       )}
    </Layout>
  );
};

export default Settings;
