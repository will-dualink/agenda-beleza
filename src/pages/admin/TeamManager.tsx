import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { StorageService } from '../../services/storage';
import { Professional, Service, WorkSchedule } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { Clock, DollarSign, Save, Plus, X, Loader2, Trash2, Edit3, CheckCircle2 } from 'lucide-react';

const TeamManager: React.FC = () => {
  const { addToast } = useToast();
  const [pros, setPros] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProId, setEditingProId] = useState<string | null>(null);
  
  const initialSchedule: WorkSchedule = { workDays: [1, 2, 3, 4, 5], workStart: '09:00', workEnd: '18:00', breakStart: '12:00', breakEnd: '13:00' };
  const [formData, setFormData] = useState({
      id: '',
      name: '',
      avatar: '',
      commission: 50,
      specialties: [] as string[],
      schedule: initialSchedule
  });

  const daysOfWeekLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
        const [fetchedPros, fetchedServices] = await Promise.all([
            StorageService.api.getProfessionals(),
            StorageService.api.getServices()
        ]);
        setPros(fetchedPros);
        setServices(fetchedServices);
    } catch (error) {
        addToast("Erro ao carregar equipe.", "error");
    } finally {
        setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      avatar: '',
      commission: 50,
      specialties: [],
      schedule: initialSchedule
    });
    setEditingProId(null);
  };

  const handleOpenModal = (pro?: Professional) => {
    if (pro) {
      setEditingProId(pro.id);
      setFormData({
        id: pro.id,
        name: pro.name,
        avatar: pro.avatarUrl,
        commission: pro.commissionPercentage,
        specialties: pro.specialties,
        schedule: pro.schedule
      });
    } else {
      resetForm();
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || formData.specialties.length === 0) {
      return addToast('Nome e especialidade obrigatórios.', 'error');
    }
    
    setIsSaving(true);
    try {
      const proId = editingProId || Math.random().toString(36).substr(2, 9);
      const newPro: Professional = {
        id: proId,
        name: formData.name,
        commissionPercentage: formData.commission,
        specialties: formData.specialties,
        schedule: formData.schedule,
        avatarUrl: formData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}`
      };

      await StorageService.api.upsertProfessional(newPro);
      
      if (editingProId) {
        setPros(pros.map(p => p.id === editingProId ? newPro : p));
        addToast('Profissional atualizado!', 'success');
      } else {
        setPros([...pros, newPro]);
        addToast('Profissional adicionado!', 'success');
      }
      
      setModalOpen(false);
      resetForm();
    } catch (error) {
      addToast(editingProId ? 'Erro ao atualizar profissional.' : 'Erro ao criar profissional.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja remover este profissional?")) return;
    
    setIsSaving(true);
    try {
      await StorageService.api.deleteProfessional(id);
      setPros(pros.filter(p => p.id !== id));
      addToast('Profissional removido.', 'success');
    } catch (error) {
      addToast('Erro ao remover profissional.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSpecialty = (sid: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(sid)
        ? prev.specialties.filter(id => id !== sid)
        : [...prev.specialties, sid]
    }));
  };

  const toggleWorkDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        workDays: prev.schedule.workDays.includes(day)
          ? prev.schedule.workDays.filter(d => d !== day)
          : [...prev.schedule.workDays, day].sort()
      }
    }));
  };

  return (
    <Layout title="Equipe" isAdmin showBack>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900">Equipe</h2>
        <button 
          onClick={() => handleOpenModal()} 
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition font-bold text-sm shadow-lg shadow-rose-200"
        >
          <Plus size={18} /> Novo Profissional
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="animate-spin text-rose-500 mb-4" />
          <p className="text-slate-500 font-medium">Carregando equipe...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pros.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
              <p className="text-slate-500 font-medium">Nenhum profissional cadastrado.</p>
            </div>
          ) : (
            pros.map(pro => (
              <div key={pro.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-5 flex justify-between items-center group">
                <div className="flex items-center gap-4 flex-1">
                  <img src={pro.avatarUrl} alt={pro.name} className="w-14 h-14 rounded-full bg-slate-100 object-cover" />
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-lg">{pro.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs bg-rose-50 text-rose-600 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1">
                        <DollarSign size={12} /> {pro.commissionPercentage}% comissão
                      </span>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-medium">
                        {pro.specialties.length} especialidade{pro.specialties.length !== 1 ? 's' : ''}
                      </span>
                      <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1">
                        <Clock size={12} /> {pro.schedule.workDays.length} dias
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleOpenModal(pro)}
                    className="p-2 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(pro.id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl animate-fade-in-up my-8 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl">
              <h3 className="text-xl font-bold text-slate-900">
                {editingProId ? 'Editar Profissional' : 'Novo Profissional'}
              </h3>
              <button 
                onClick={() => { setModalOpen(false); resetForm(); }}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Seção: Informações Básicas */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Informações Básicas</h4>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nome Completo</label>
                  <input 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none transition" 
                    placeholder="Ex: Maria Silva"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Comissão (%)</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="100"
                      value={formData.commission} 
                      onChange={e => setFormData({...formData, commission: Number(e.target.value)})}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Avatar URL (opcional)</label>
                    <input 
                      value={formData.avatar} 
                      onChange={e => setFormData({...formData, avatar: e.target.value})}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none" 
                      placeholder="https://exemplo.com/foto.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Seção: Especialidades */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Especialidades</h4>
                <div className="flex flex-wrap gap-2">
                  {services.map(service => (
                    <button
                      key={service.id}
                      onClick={() => toggleSpecialty(service.id)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold border transition ${
                        formData.specialties.includes(service.id)
                          ? 'bg-rose-500 text-white border-rose-500 ring-2 ring-rose-200'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-rose-300'
                      }`}
                    >
                      {formData.specialties.includes(service.id) && <CheckCircle2 size={12} className="inline mr-1" />}
                      {service.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seção: Horário de Trabalho */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Horário de Trabalho</h4>
                
                {/* Dias da Semana */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Dias de Trabalho</label>
                  <div className="grid grid-cols-7 gap-2">
                    {daysOfWeekLabels.map((day, idx) => (
                      <button
                        key={idx}
                        onClick={() => toggleWorkDay(idx)}
                        className={`py-2 px-1 rounded-lg text-xs font-bold border transition ${
                          formData.schedule.workDays.includes(idx)
                            ? 'bg-rose-500 text-white border-rose-500 ring-2 ring-rose-200'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-rose-300'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Horários */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Início do Expediente</label>
                    <input 
                      type="time"
                      value={formData.schedule.workStart}
                      onChange={e => setFormData({
                        ...formData,
                        schedule: {...formData.schedule, workStart: e.target.value}
                      })}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Fim do Expediente</label>
                    <input 
                      type="time"
                      value={formData.schedule.workEnd}
                      onChange={e => setFormData({
                        ...formData,
                        schedule: {...formData.schedule, workEnd: e.target.value}
                      })}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none"
                    />
                  </div>
                </div>

                {/* Intervalo */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Intervalo: Início</label>
                    <input 
                      type="time"
                      value={formData.schedule.breakStart || '12:00'}
                      onChange={e => setFormData({
                        ...formData,
                        schedule: {...formData.schedule, breakStart: e.target.value}
                      })}
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Intervalo: Fim</label>
                    <input 
                      type="time"
                      value={formData.schedule.breakEnd || '13:00'}
                      onChange={e => setFormData({
                        ...formData,
                        schedule: {...formData.schedule, breakEnd: e.target.value}
                      })}
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-200 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-200 flex gap-3 bg-white sticky bottom-0 rounded-b-2xl">
              <button 
                onClick={() => { setModalOpen(false); resetForm(); }}
                className="flex-1 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-bold transition"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin" size={18} /> Salvando...
                  </>
                ) : (
                  <>
                    <Save size={18} /> {editingProId ? 'Atualizar' : 'Salvar'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default TeamManager;