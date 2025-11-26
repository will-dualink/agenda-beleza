import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { StorageService } from '../../services/storage';
import { Professional, Service, WorkSchedule } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { Clock, DollarSign, Save, Plus, X, CheckSquare, Square, Image as ImageIcon, User } from 'lucide-react';

const TeamManager: React.FC = () => {
  const { addToast } = useToast();
  const [pros, setPros] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // New Professional Form State
  const initialSchedule: WorkSchedule = {
      workDays: [1, 2, 3, 4, 5], // Mon-Fri default
      workStart: '09:00',
      workEnd: '18:00',
      breakStart: '12:00',
      breakEnd: '13:00'
  };

  const [newProName, setNewProName] = useState('');
  const [newProAvatar, setNewProAvatar] = useState('');
  const [newProCommission, setNewProCommission] = useState(50);
  const [newProSpecialties, setNewProSpecialties] = useState<string[]>([]);
  const [newProSchedule, setNewProSchedule] = useState<WorkSchedule>(initialSchedule);

  useEffect(() => {
    setPros(StorageService.getProfessionals());
    setServices(StorageService.getServices());
  }, []);

  const handleUpdate = (updatedPro: Professional) => {
    const newPros = pros.map(p => p.id === updatedPro.id ? updatedPro : p);
    setPros(newPros);
    StorageService.saveProfessionals(newPros);
    setEditingId(null);
    addToast('Dados do profissional atualizados com sucesso!');
  };

  const handleCreate = () => {
      if (!newProName) {
        addToast('O nome do profissional é obrigatório.', 'error');
        return;
      }
      if (newProSpecialties.length === 0) {
        addToast('Selecione pelo menos uma especialidade.', 'warning');
        return;
      }

      const avatarToUse = newProAvatar.trim() || `https://ui-avatars.com/api/?name=${encodeURIComponent(newProName)}&background=random`;

      const newPro: Professional = {
          id: Math.random().toString(36).substr(2, 9),
          name: newProName,
          commissionPercentage: newProCommission,
          specialties: newProSpecialties,
          schedule: newProSchedule,
          avatarUrl: avatarToUse
      };

      const updatedPros = [...pros, newPro];
      setPros(updatedPros);
      StorageService.saveProfessionals(updatedPros);
      
      // Reset and Close
      setIsAddModalOpen(false);
      setNewProName('');
      setNewProAvatar('');
      setNewProCommission(50);
      setNewProSpecialties([]);
      setNewProSchedule(initialSchedule);
      
      addToast('Profissional adicionado à equipe!', 'success');
  };

  const toggleNewSpecialty = (serviceId: string) => {
      setNewProSpecialties(prev => 
          prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
      );
  };

  const toggleNewDay = (day: number) => {
      setNewProSchedule(prev => {
          const currentDays = prev.workDays;
          const newDays = currentDays.includes(day) 
             ? currentDays.filter(d => d !== day)
             : [...currentDays, day];
          return { ...prev, workDays: newDays };
      });
  };

  const daysMap = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <Layout title="Profissionais & Equipe" isAdmin showBack>
       <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">Equipe</h2>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition font-medium text-sm shadow-md shadow-rose-200 transform hover:-translate-y-0.5"
          >
            <Plus size={16} /> Novo Profissional
          </button>
       </div>

       <div className="space-y-6">
          {pros.map(pro => {
             const isEditing = editingId === pro.id;
             
             return (
               <div key={pro.id} className={`bg-white rounded-2xl border transition-all ${isEditing ? 'border-rose-400 shadow-lg ring-1 ring-rose-100' : 'border-slate-200 shadow-sm'}`}>
                  {/* Header */}
                  <div className="p-6 flex flex-col sm:flex-row items-center gap-4 border-b border-slate-100">
                     <img src={pro.avatarUrl} className="w-16 h-16 rounded-full object-cover bg-slate-100" alt="" />
                     <div className="flex-1 text-center sm:text-left">
                        <h3 className="font-bold text-lg text-slate-900">{pro.name}</h3>
                        <p className="text-sm text-slate-500">
                           {pro.specialties.map(sid => services.find(s=>s.id === sid)?.name).join(', ')}
                        </p>
                     </div>
                     {!isEditing && (
                        <button 
                           onClick={() => setEditingId(pro.id)}
                           className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg"
                        >
                           Editar Dados
                        </button>
                     )}
                  </div>

                  {/* Details / Edit Form */}
                  <div className="p-6">
                     <div className="grid md:grid-cols-2 gap-8">
                        
                        {/* Commission */}
                        <div>
                           <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                              <DollarSign size={16} className="text-emerald-500"/> Comissionamento
                           </h4>
                           <div className="flex items-center gap-3">
                              <label className="text-sm text-slate-600">Porcentagem por serviço:</label>
                              {isEditing ? (
                                 <input 
                                   type="number" 
                                   value={pro.commissionPercentage} 
                                   onChange={e => {
                                      const val = parseFloat(e.target.value);
                                      setPros(pros.map(p => p.id === pro.id ? {...p, commissionPercentage: val} : p));
                                   }}
                                   className="w-20 p-2 border rounded-lg font-bold text-center outline-none focus:ring-2 focus:ring-rose-200"
                                 />
                              ) : (
                                 <span className="font-bold text-slate-900 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg">
                                    {pro.commissionPercentage}%
                                 </span>
                              )}
                           </div>
                        </div>

                        {/* Schedule */}
                        <div>
                           <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                              <Clock size={16} className="text-indigo-500"/> Horário de Trabalho
                           </h4>
                           
                           <div className="space-y-3 text-sm">
                              <div className="flex justify-between items-center">
                                 <span className="text-slate-500">Jornada:</span>
                                 {isEditing ? (
                                    <div className="flex gap-2 items-center">
                                       <input type="time" value={pro.schedule.workStart} onChange={e => {
                                           setPros(pros.map(p => p.id === pro.id ? {...p, schedule: {...p.schedule, workStart: e.target.value}} : p));
                                       }} className="border rounded p-1 outline-none focus:ring-2 focus:ring-indigo-100" />
                                       <span className="text-xs">às</span>
                                       <input type="time" value={pro.schedule.workEnd} onChange={e => {
                                           setPros(pros.map(p => p.id === pro.id ? {...p, schedule: {...p.schedule, workEnd: e.target.value}} : p));
                                       }} className="border rounded p-1 outline-none focus:ring-2 focus:ring-indigo-100" />
                                    </div>
                                 ) : (
                                    <span className="font-medium">{pro.schedule.workStart} - {pro.schedule.workEnd}</span>
                                 )}
                              </div>

                              <div className="flex justify-between items-center">
                                 <span className="text-slate-500">Pausa (Almoço):</span>
                                 {isEditing ? (
                                    <div className="flex gap-2 items-center">
                                       <input type="time" value={pro.schedule.breakStart || ''} onChange={e => {
                                           setPros(pros.map(p => p.id === pro.id ? {...p, schedule: {...p.schedule, breakStart: e.target.value}} : p));
                                       }} className="border rounded p-1 outline-none focus:ring-2 focus:ring-indigo-100" />
                                       <span className="text-xs">às</span>
                                       <input type="time" value={pro.schedule.breakEnd || ''} onChange={e => {
                                           setPros(pros.map(p => p.id === pro.id ? {...p, schedule: {...p.schedule, breakEnd: e.target.value}} : p));
                                       }} className="border rounded p-1 outline-none focus:ring-2 focus:ring-indigo-100" />
                                    </div>
                                 ) : (
                                    <span className="font-medium text-slate-500">{pro.schedule.breakStart || '--'} - {pro.schedule.breakEnd || '--'}</span>
                                 )}
                              </div>

                              <div>
                                 <span className="text-slate-500 block mb-2">Dias Ativos:</span>
                                 <div className="flex gap-1">
                                    {[0,1,2,3,4,5,6].map(day => {
                                       const isActive = pro.schedule.workDays.includes(day);
                                       return (
                                          <button
                                             key={day}
                                             disabled={!isEditing}
                                             onClick={() => {
                                                 const currentDays = pro.schedule.workDays;
                                                 const newDays = currentDays.includes(day) 
                                                    ? currentDays.filter(d => d !== day)
                                                    : [...currentDays, day];
                                                 setPros(pros.map(p => p.id === pro.id ? {...p, schedule: {...p.schedule, workDays: newDays}} : p));
                                             }}
                                             className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition ${isActive ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-400'}`}
                                          >
                                             {daysMap[day][0]}
                                          </button>
                                       )
                                    })}
                                 </div>
                              </div>
                           </div>
                        </div>

                     </div>

                     {isEditing && (
                        <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end gap-3">
                           <button onClick={() => { setEditingId(null); setPros(StorageService.getProfessionals()); }} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg font-medium transition">Cancelar</button>
                           <button onClick={() => handleUpdate(pro)} className="px-6 py-2 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 flex items-center gap-2 shadow-lg shadow-rose-200">
                              <Save size={18} /> Salvar Alterações
                           </button>
                        </div>
                     )}
                  </div>
               </div>
             )
          })}
       </div>

       {/* Add Professional Modal */}
       {isAddModalOpen && (
           <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
                   <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                       <h3 className="text-xl font-bold text-slate-900">Novo Profissional</h3>
                       <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition"><X size={20}/></button>
                   </div>
                   
                   <div className="p-6 space-y-8">
                       
                       {/* Profile Photo & Basic Info */}
                       <div className="flex flex-col sm:flex-row gap-6">
                           <div className="flex flex-col items-center gap-3">
                               <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative group shadow-inner">
                                   {newProAvatar ? (
                                       <img src={newProAvatar} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Error&background=random'}} />
                                   ) : (
                                       <User size={32} className="text-slate-300" />
                                   )}
                               </div>
                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Foto de Perfil</span>
                           </div>

                           <div className="flex-1 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Nome Completo</label>
                                    <input 
                                        value={newProName} 
                                        onChange={e => setNewProName(e.target.value)} 
                                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none transition" 
                                        placeholder="Ex: João Silva"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Comissão (%)</label>
                                        <div className="relative">
                                            <input 
                                                type="number"
                                                value={newProCommission} 
                                                onChange={e => setNewProCommission(Number(e.target.value))} 
                                                className="w-full p-3 pl-8 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none transition" 
                                            />
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">URL da Foto</label>
                                        <div className="relative">
                                            <ImageIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input 
                                                value={newProAvatar} 
                                                onChange={e => setNewProAvatar(e.target.value)} 
                                                className="w-full pl-9 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none text-sm transition" 
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                </div>
                           </div>
                       </div>

                       <div className="h-px bg-slate-100"></div>

                       {/* Specialties */}
                       <div>
                           <label className="block text-sm font-bold text-slate-700 mb-3">Especialidades (Serviços Realizados)</label>
                           <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                               {services.map(s => {
                                   const isSelected = newProSpecialties.includes(s.id);
                                   return (
                                       <button 
                                          key={s.id}
                                          onClick={() => toggleNewSpecialty(s.id)}
                                          className={`flex items-center gap-2 p-3 rounded-xl border text-sm text-left transition duration-200 ${isSelected ? 'border-rose-500 bg-rose-50 text-rose-700 font-bold shadow-sm' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                                       >
                                           {isSelected ? <CheckSquare size={18} className="shrink-0 text-rose-500"/> : <Square size={18} className="shrink-0 text-slate-300"/>}
                                           <span className="truncate">{s.name}</span>
                                       </button>
                                   )
                               })}
                           </div>
                       </div>

                       <div className="h-px bg-slate-100"></div>

                       {/* Schedule Config */}
                       <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                           <h4 className="font-bold text-slate-900 text-sm mb-5 flex items-center gap-2">
                               <Clock size={18} className="text-slate-500"/> Configuração de Agenda
                           </h4>
                           
                           <div className="grid sm:grid-cols-2 gap-8">
                               <div>
                                   <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Jornada de Trabalho</label>
                                   <div className="flex items-center gap-3">
                                       <input type="time" className="p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-slate-200" value={newProSchedule.workStart} onChange={e => setNewProSchedule({...newProSchedule, workStart: e.target.value})} />
                                       <span className="text-slate-400 font-medium">até</span>
                                       <input type="time" className="p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-slate-200" value={newProSchedule.workEnd} onChange={e => setNewProSchedule({...newProSchedule, workEnd: e.target.value})} />
                                   </div>
                               </div>
                               <div>
                                   <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Pausa / Almoço</label>
                                   <div className="flex items-center gap-3">
                                       <input type="time" className="p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-slate-200" value={newProSchedule.breakStart || ''} onChange={e => setNewProSchedule({...newProSchedule, breakStart: e.target.value})} />
                                       <span className="text-slate-400 font-medium">até</span>
                                       <input type="time" className="p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-slate-200" value={newProSchedule.breakEnd || ''} onChange={e => setNewProSchedule({...newProSchedule, breakEnd: e.target.value})} />
                                   </div>
                               </div>
                           </div>

                           <div className="mt-6">
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Dias da Semana Ativos</label>
                               <div className="flex flex-wrap gap-2">
                                    {[0,1,2,3,4,5,6].map(day => {
                                       const isActive = newProSchedule.workDays.includes(day);
                                       return (
                                          <button
                                             key={day}
                                             onClick={() => toggleNewDay(day)}
                                             className={`w-11 h-11 rounded-xl text-sm font-bold flex items-center justify-center transition shadow-sm ${isActive ? 'bg-slate-800 text-white transform -translate-y-0.5' : 'bg-white border border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-600'}`}
                                          >
                                             {daysMap[day]}
                                          </button>
                                       )
                                    })}
                               </div>
                           </div>
                       </div>
                   </div>

                   <div className="p-6 border-t border-slate-100 flex gap-4 sticky bottom-0 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
                       <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3.5 text-slate-600 hover:bg-slate-50 rounded-xl font-bold transition">Cancelar</button>
                       <button onClick={handleCreate} className="flex-1 py-3.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition shadow-lg shadow-rose-200 transform active:scale-[0.98]">Salvar Profissional</button>
                   </div>
               </div>
           </div>
       )}
    </Layout>
  );
};

export default TeamManager;
