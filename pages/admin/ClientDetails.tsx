
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { StorageService } from '../../services/storage';
import { ClientProfile, Appointment } from '../../types';
import { Save, Lock, History, MessageCircle, Calendar, Send } from 'lucide-react';

const ClientDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<ClientProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [formData, setFormData] = useState<Partial<ClientProfile>>({});
  
  useEffect(() => {
    const users = StorageService.getUsers();
    const found = users.find(u => u.id === id);
    if (!found) {
       navigate('/admin/clients');
       return;
    }
    setClient(found);
    setFormData(found);

    const allApps = StorageService.getAppointments();
    setAppointments(allApps.filter(a => a.clientId === found.id));
  }, [id, navigate]);

  const handleSave = () => {
    if (client && formData) {
      const updated = { ...client, ...formData };
      StorageService.saveUser(updated);
      setClient(updated);
      alert('Dados salvos!');
    }
  };

  const handleResetPassword = () => {
      // Logic to send email would go here
      alert(`Link de redefinição enviado para ${client?.email} (Simulado)`);
  };

  const openWhatsApp = (type: 'REMINDER' | 'PROMO' | 'PAYMENT') => {
      if (!client?.phone) return alert("Cliente sem telefone cadastrado.");
      
      const cleanPhone = client.phone.replace(/\D/g, '');
      let message = '';
      const firstName = client.name.split(' ')[0];

      switch(type) {
          case 'REMINDER':
              message = `Olá ${firstName}! Tudo bem? Passando para lembrar do seu horário conosco no Agenda Beleza. Podemos confirmar? ✨`;
              break;
          case 'PROMO':
              message = `Oi ${firstName}! 💖 Estamos com uma promoção especial essa semana no Agenda Beleza. Que tal agendar um horário?`;
              break;
          case 'PAYMENT':
              message = `Olá ${firstName}, identificamos uma pendência no seu cadastro. Poderia entrar em contato? Obrigado!`;
              break;
      }

      window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (!client) return null;

  return (
    <Layout title={`Cliente: ${client.name}`} isAdmin showBack>
       <div className="grid md:grid-cols-3 gap-6">
          
          {/* Main Info Form */}
          <div className="md:col-span-2 space-y-6">
             {/* QUICK ACTIONS BAR */}
             <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex flex-wrap gap-3 items-center">
                <span className="text-green-800 font-bold text-sm flex items-center gap-2 mr-2">
                    <MessageCircle size={18} /> Contato Rápido:
                </span>
                <button 
                    onClick={() => openWhatsApp('REMINDER')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white text-green-700 text-xs font-bold rounded-lg border border-green-200 hover:bg-green-100 transition shadow-sm"
                >
                    <Calendar size={12} /> Confirmar Horário
                </button>
                <button 
                    onClick={() => openWhatsApp('PROMO')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white text-green-700 text-xs font-bold rounded-lg border border-green-200 hover:bg-green-100 transition shadow-sm"
                >
                    <Send size={12} /> Enviar Promo
                </button>
             </div>

             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Lock size={16} className="text-rose-500" /> Dados Pessoais
                </h3>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                            <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                            <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2 border rounded-lg" />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 border rounded-lg" />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nascimento</label>
                            <input type="date" value={formData.birthDate || ''} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="w-full p-2 border rounded-lg" />
                        </div>
                        <div className="col-span-2">
                             <label className="block text-sm font-medium text-slate-700 mb-1">Profissão</label>
                             <input value={formData.profession || ''} onChange={e => setFormData({...formData, profession: e.target.value})} className="w-full p-2 border rounded-lg" />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition">
                            <Save size={16} /> Salvar Dados
                        </button>
                        <button onClick={handleResetPassword} className="px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition">
                            Resetar Senha
                        </button>
                    </div>
                </div>
             </div>

             {/* Internal Notes (Admin Only) */}
             <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 shadow-sm">
                <h3 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                   <Lock size={16} /> Notas Internas (Confidencial)
                </h3>
                <p className="text-xs text-yellow-700 mb-3">Visível apenas para administradores. Use para alergias, preferências, etc.</p>
                <textarea 
                   rows={4} 
                   value={formData.internalNotes || ''} 
                   onChange={e => setFormData({...formData, internalNotes: e.target.value})}
                   className="w-full p-3 border border-yellow-300 rounded-lg bg-white focus:ring-2 focus:ring-yellow-400 outline-none text-sm"
                   placeholder="Ex: Alérgica a amônia..."
                />
                <button onClick={handleSave} className="mt-3 text-xs font-bold text-yellow-800 hover:underline">Salvar Nota</button>
             </div>
          </div>

          {/* Sidebar: History */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
             <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                 <History size={16} /> Histórico
             </h3>
             <div className="space-y-3">
                {appointments.length === 0 ? (
                    <p className="text-sm text-slate-500">Nenhum agendamento.</p>
                ) : (
                    appointments.map(app => (
                        <div key={app.id} className="text-sm border-b border-slate-100 pb-2 last:border-0">
                            <div className="flex justify-between font-medium">
                                <span>{app.date.split('-').reverse().join('/')}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${app.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{app.status}</span>
                            </div>
                            <p className="text-slate-500">{app.time}</p>
                        </div>
                    ))
                )}
             </div>
          </div>

       </div>
    </Layout>
  );
};

export default ClientDetails;
