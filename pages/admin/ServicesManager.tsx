
import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { StorageService } from '../../services/storage';
import { GeminiService } from '../../services/gemini';
import { Service, Product, ServiceConsumption, Professional } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { Plus, Trash2, Sparkles, Loader2, Package, Edit3, Users, Clock, DollarSign, ImageIcon, Save, X, MoreHorizontal } from 'lucide-react';

const ServicesManager: React.FC = () => {
  const { addToast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [consumptions, setConsumptions] = useState<ServiceConsumption[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'TEAM' | 'MATERIALS'>('DETAILS');
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
      name: '',
      description: '',
      price: 0,
      durationMinutes: 60,
      bufferMinutes: 0,
      imageUrl: ''
  });

  // Team Selection State (Temporary for the modal)
  const [selectedProIds, setSelectedProIds] = useState<string[]>([]);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setServices(StorageService.getServices());
    setProducts(StorageService.getProducts());
    setProfessionals(StorageService.getProfessionals());
    setConsumptions(StorageService.getProductConsumption());
  };

  const handleOpenModal = (service?: Service) => {
      if (service) {
          setEditingService(service);
          setFormData({
              name: service.name,
              description: service.description,
              price: service.price,
              durationMinutes: service.durationMinutes,
              bufferMinutes: service.bufferMinutes || 0,
              imageUrl: service.imageUrl || ''
          });
          // Find pros who have this service ID
          const prosWithService = professionals
            .filter(p => p.specialties.includes(service.id))
            .map(p => p.id);
          setSelectedProIds(prosWithService);
      } else {
          setEditingService(null);
          setFormData({
              name: '',
              description: '',
              price: 0,
              durationMinutes: 60,
              bufferMinutes: 0,
              imageUrl: `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`
          });
          setSelectedProIds([]);
      }
      setActiveTab('DETAILS');
      setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este serviço?")) return;
    
    // 1. Remove Service
    const updatedServices = services.filter(s => s.id !== id);
    setServices(updatedServices);
    StorageService.saveServices(updatedServices);

    // 2. Remove from Professionals' specialties
    const updatedPros = professionals.map(p => ({
        ...p,
        specialties: p.specialties.filter(sId => sId !== id)
    }));
    setProfessionals(updatedPros);
    StorageService.saveProfessionals(updatedPros);

    addToast('Serviço excluído com sucesso.', 'success');
  };

  const handleSave = () => {
    if (!formData.name) return addToast('O nome é obrigatório', 'error');

    let newServiceId = editingService?.id;

    if (editingService) {
        // UPDATE
        const updatedServices = services.map(s => s.id === editingService.id ? {
            ...s,
            ...formData
        } : s);
        setServices(updatedServices);
        StorageService.saveServices(updatedServices);
        addToast('Serviço atualizado!');
    } else {
        // CREATE
        newServiceId = Math.random().toString(36).substr(2, 9);
        const newService: Service = {
            id: newServiceId,
            ...formData
        };
        const updatedServices = [...services, newService];
        setServices(updatedServices);
        StorageService.saveServices(updatedServices);
        addToast('Serviço criado com sucesso!');
    }

    // UPDATE PROFESSIONALS LINK
    if (newServiceId) {
        const updatedPros = professionals.map(pro => {
            const shouldHaveService = selectedProIds.includes(pro.id);
            const hasService = pro.specialties.includes(newServiceId!);
            
            if (shouldHaveService && !hasService) {
                return { ...pro, specialties: [...pro.specialties, newServiceId!] };
            } else if (!shouldHaveService && hasService) {
                return { ...pro, specialties: pro.specialties.filter(id => id !== newServiceId) };
            }
            return pro;
        });
        setProfessionals(updatedPros);
        StorageService.saveProfessionals(updatedPros);
    }

    setIsModalOpen(false);
  };

  const toggleProSelection = (proId: string) => {
      setSelectedProIds(prev => 
        prev.includes(proId) ? prev.filter(id => id !== proId) : [...prev, proId]
      );
  };

  const generateAiDescription = async () => {
    if (!formData.name) return alert("Digite o nome do serviço primeiro.");
    setLoadingAi(true);
    const desc = await GeminiService.generateServiceDescription(formData.name, "beleza, cuidado, premium");
    setFormData(prev => ({ ...prev, description: desc }));
    setLoadingAi(false);
  };

  // --- Consumption Logic (Inside Modal) ---
  const handleLinkProduct = (serviceId: string, productId: string, qty: number) => {
     StorageService.linkProductToService(serviceId, productId, qty);
     setConsumptions(StorageService.getProductConsumption());
  };

  return (
    <Layout title="Gerenciar Serviços" isAdmin showBack>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900">Catálogo de Serviços</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition font-bold text-sm shadow-lg shadow-rose-200 transform hover:-translate-y-0.5"
        >
          <Plus size={18} /> Novo Serviço
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {services.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                <Package size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 font-medium">Nenhum serviço cadastrado.</p>
                <p className="text-xs text-slate-400 mt-1">Comece adicionando seu primeiro serviço.</p>
            </div>
        ) : (
            services.map(service => {
            const serviceConsumptions = consumptions.filter(c => c.serviceId === service.id);
            const assignedPros = professionals.filter(p => p.specialties.includes(service.id));

            return (
                <div key={service.id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 overflow-hidden flex flex-col">
                    {/* Card Image Header */}
                    <div className="relative h-44 bg-slate-100 overflow-hidden">
                        <img 
                            src={service.imageUrl} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                            alt={service.name} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-80"></div>
                        
                        {/* Title & Price Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="font-bold text-white text-lg leading-tight mb-1 drop-shadow-sm">{service.name}</h3>
                            <div className="flex items-center gap-2">
                                <span className="bg-white/20 backdrop-blur-md text-white px-2 py-0.5 rounded text-xs font-bold border border-white/10">
                                    R$ {service.price.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* Floating Actions */}
                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 translate-y-[-10px] group-hover:translate-y-0">
                             <button 
                                onClick={() => handleOpenModal(service)}
                                className="p-2 bg-white text-slate-700 rounded-full hover:text-rose-600 shadow-lg hover:shadow-xl transition"
                                title="Editar"
                            >
                                <Edit3 size={16} />
                            </button>
                            <button 
                                onClick={() => handleDelete(service.id)}
                                className="p-2 bg-white text-slate-700 rounded-full hover:text-red-600 shadow-lg hover:shadow-xl transition"
                                title="Excluir"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                    
                    {/* Card Content */}
                    <div className="p-5 flex-1 flex flex-col">
                        <p className="text-sm text-slate-500 line-clamp-2 mb-5 flex-1 leading-relaxed">
                            {service.description || "Sem descrição definida."}
                        </p>

                        <div className="space-y-3">
                             <div className="flex items-center justify-between text-xs font-medium text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                <span className="flex items-center gap-1.5">
                                    <Clock size={14} className="text-slate-400"/> Duração
                                </span>
                                <span className="text-slate-900 font-bold">{service.durationMinutes} min</span>
                             </div>

                             <div className="flex items-center gap-3 text-xs text-slate-400 pt-2 border-t border-slate-50">
                                <span className="flex items-center gap-1" title="Profissionais Aptos">
                                    <Users size={12}/> {assignedPros.length}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                <span className="flex items-center gap-1" title="Produtos Vinculados">
                                    <Package size={12}/> {serviceConsumptions.length}
                                </span>
                                {service.bufferMinutes ? (
                                    <>
                                        <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                        <span className="text-orange-400 flex items-center gap-1">
                                            + {service.bufferMinutes}m buffer
                                        </span>
                                    </>
                                ) : null}
                             </div>
                        </div>
                    </div>
                </div>
            )
            })
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
             
             {/* Header */}
             <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <h3 className="text-lg font-bold text-slate-900">
                    {editingService ? 'Editar Serviço' : 'Novo Serviço'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition">
                    <X size={20} />
                </button>
             </div>

             {/* Tabs */}
             <div className="flex border-b border-slate-100 px-6 gap-6 bg-slate-50/50">
                 <button 
                    onClick={() => setActiveTab('DETAILS')}
                    className={`py-3 text-sm font-bold border-b-2 transition ${activeTab === 'DETAILS' ? 'border-rose-600 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                 >
                    Detalhes
                 </button>
                 <button 
                    onClick={() => setActiveTab('TEAM')}
                    className={`py-3 text-sm font-bold border-b-2 transition ${activeTab === 'TEAM' ? 'border-rose-600 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                 >
                    Equipe ({selectedProIds.length})
                 </button>
                 {editingService && (
                    <button 
                        onClick={() => setActiveTab('MATERIALS')}
                        className={`py-3 text-sm font-bold border-b-2 transition ${activeTab === 'MATERIALS' ? 'border-rose-600 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Materiais / Estoque
                    </button>
                 )}
             </div>
             
             {/* Body */}
             <div className="p-6 overflow-y-auto flex-1">
               
               {activeTab === 'DETAILS' && (
                   <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nome do Serviço</label>
                            <input 
                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-300 outline-none transition text-slate-800 font-medium" 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                placeholder="Ex: Corte Bordado"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-1.5">
                                <label className="block text-xs font-bold text-slate-500 uppercase">Descrição</label>
                                <button 
                                onClick={generateAiDescription}
                                disabled={loadingAi}
                                className="text-xs flex items-center gap-1 text-rose-600 font-bold hover:bg-rose-50 px-2 py-0.5 rounded transition disabled:opacity-50"
                                >
                                {loadingAi ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} 
                                Gerar com IA
                                </button>
                            </div>
                            <textarea 
                                className="w-full p-3 border border-slate-200 rounded-xl h-24 text-sm focus:ring-2 focus:ring-rose-200 focus:border-rose-300 outline-none transition resize-none" 
                                value={formData.description} 
                                onChange={e => setFormData({...formData, description: e.target.value})} 
                                placeholder="Descreva os benefícios e etapas do serviço..."
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Preço (R$)</label>
                                <input type="number" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none font-medium" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Duração (min)</label>
                                <input type="number" step="15" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none" value={formData.durationMinutes} onChange={e => setFormData({...formData, durationMinutes: Number(e.target.value)})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5" title="Tempo de limpeza entre clientes">Buffer (min)</label>
                                <input type="number" step="5" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none" value={formData.bufferMinutes} onChange={e => setFormData({...formData, bufferMinutes: Number(e.target.value)})} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">URL da Imagem</label>
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                                    <input 
                                        className="w-full pl-10 p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-200 outline-none transition" 
                                        value={formData.imageUrl} 
                                        onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                                        placeholder="https://exemplo.com/imagem.jpg"
                                    />
                                </div>
                                <div className="w-12 h-12 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shrink-0">
                                    {formData.imageUrl ? (
                                        <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={20}/></div>
                                    )}
                                </div>
                            </div>
                        </div>
                   </div>
               )}

               {activeTab === 'TEAM' && (
                   <div>
                       <p className="text-sm text-slate-500 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                          Selecione os profissionais da sua equipe que estão habilitados a realizar este serviço.
                       </p>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                           {professionals.map(pro => {
                               const isSelected = selectedProIds.includes(pro.id);
                               return (
                                   <div 
                                      key={pro.id}
                                      onClick={() => toggleProSelection(pro.id)}
                                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${isSelected ? 'bg-rose-50 border-rose-500 ring-1 ring-rose-500 shadow-sm' : 'bg-white border-slate-200 hover:border-rose-200 hover:shadow-sm'}`}
                                   >
                                       <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${isSelected ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white border-slate-300'}`}>
                                            {isSelected && <Users size={14} />}
                                       </div>
                                       <div className="flex items-center gap-3">
                                           <img src={pro.avatarUrl} className="w-9 h-9 rounded-full bg-slate-200" alt=""/>
                                           <span className={`text-sm font-bold ${isSelected ? 'text-rose-900' : 'text-slate-700'}`}>{pro.name}</span>
                                       </div>
                                   </div>
                               )
                           })}
                       </div>
                   </div>
               )}

               {activeTab === 'MATERIALS' && editingService && (
                   <div>
                        <div className="bg-indigo-50 p-4 rounded-xl mb-6 text-indigo-800 text-sm flex items-start gap-3 border border-indigo-100">
                             <Package size={18} className="shrink-0 mt-0.5 text-indigo-600" />
                             <p>Os produtos vinculados aqui serão <strong>automaticamente debitados do estoque</strong> sempre que este serviço for concluído na agenda.</p>
                        </div>

                        <div className="space-y-3 mb-6">
                            {consumptions.filter(c => c.serviceId === editingService.id).map(c => {
                                const prod = products.find(p => p.id === c.productId);
                                if (!prod) return null;
                                return (
                                    <div key={c.productId} className="flex justify-between items-center bg-white border border-slate-200 p-3 rounded-xl text-sm shadow-sm">
                                        <div className="flex items-center gap-3">
                                           <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                              {c.quantity}
                                           </div>
                                           <div>
                                              <p className="font-bold text-slate-900">{prod.name}</p>
                                              <p className="text-xs text-slate-500">{c.quantity} {prod.unit} por serviço</p>
                                           </div>
                                        </div>
                                        <button 
                                            onClick={() => handleLinkProduct(editingService.id, c.productId, 0)} 
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                )
                            })}
                            {consumptions.filter(c => c.serviceId === editingService.id).length === 0 && (
                                <p className="text-center text-slate-400 py-4 italic text-sm">Nenhum material vinculado.</p>
                            )}
                        </div>

                        <div className="flex gap-3 items-center pt-5 border-t border-slate-100">
                            <div className="relative flex-1">
                                <select 
                                    className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-200 appearance-none bg-white" 
                                    id="select-prod"
                                >
                                    <option value="">Selecionar Produto do Estoque...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                   <MoreHorizontal size={16} />
                                </div>
                            </div>
                            <input 
                                type="number" 
                                step="0.1"
                                placeholder="Qtd" 
                                className="w-24 p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-200"
                                id="qty-prod"
                            />
                            <button 
                                onClick={() => {
                                    const sel = document.getElementById('select-prod') as HTMLSelectElement;
                                    const inp = document.getElementById('qty-prod') as HTMLInputElement;
                                    if (sel.value && inp.value) {
                                    handleLinkProduct(editingService.id, sel.value, Number(inp.value));
                                    inp.value = '';
                                    sel.value = '';
                                    }
                                }}
                                className="px-5 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition shadow-lg"
                            >
                                Vincular
                            </button>
                        </div>
                   </div>
               )}

             </div>

             {/* Footer */}
             <div className="p-5 border-t border-slate-100 flex gap-3 bg-white">
               <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 text-slate-600 hover:bg-slate-50 rounded-xl font-bold transition">Cancelar</button>
               <button onClick={handleSave} className="flex-1 py-3.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-lg shadow-rose-200 flex items-center justify-center gap-2 transform active:scale-[0.98] transition">
                   <Save size={18} /> Salvar Serviço
               </button>
             </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ServicesManager;
