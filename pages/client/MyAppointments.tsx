import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { StorageService } from '../../services/storage';
import { Appointment, AppointmentStatus, Service, Professional } from '../../types';
import { Calendar, Clock, AlertTriangle, RefreshCw, XCircle, ChevronRight, User } from 'lucide-react';

const MyAppointments: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [config, setConfig] = useState(StorageService.getConfig());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = StorageService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const allApps = StorageService.getAppointments();
    const myApps = allApps.filter(a => a.clientId === currentUser.id);
    
    myApps.sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());

    setAppointments(myApps);
    setServices(StorageService.getServices());
    setProfessionals(StorageService.getProfessionals());
  }, [navigate]);

  const getServiceName = (id: string) => services.find(s => s.id === id)?.name || 'Serviço';
  const getProName = (id: string) => professionals.find(p => p.id === id)?.name || 'Profissional';
  const getProAvatar = (id: string) => professionals.find(p => p.id === id)?.avatarUrl;

  const handleCancel = (app: Appointment) => {
    const check = StorageService.canCancel(app);
    
    if (!check.allowed) {
      setErrorMsg(check.reason || 'Não é possível cancelar.');
      setTimeout(() => setErrorMsg(null), 4000);
      return;
    }

    if (window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
      StorageService.updateAppointmentStatus(app.id, AppointmentStatus.CANCELLED);
      // Refresh list
      const currentUser = StorageService.getCurrentUser();
      if (!currentUser) return;
      const allApps = StorageService.getAppointments();
      const myApps = allApps.filter(a => a.clientId === currentUser.id);
      myApps.sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());
      setAppointments(myApps);
    }
  };

  const handleReschedule = (app: Appointment) => {
    const check = StorageService.canCancel(app);
    if (!check.allowed) {
      setErrorMsg(`Para reagendar, é necessário estar dentro do prazo. ${check.reason}`);
      setTimeout(() => setErrorMsg(null), 4000);
      return;
    }

    if (window.confirm('Deseja reagendar? Você escolherá uma nova data mantendo o horário atual até a confirmação.')) {
        const service = services.find(s => s.id === app.serviceId);
        const pro = professionals.find(p => p.id === app.professionalId);

        navigate('/client/book', { 
            state: { 
                initialService: service,
                initialProfessional: pro,
                rescheduleAppointmentId: app.id 
            } 
        });
    }
  };

  return (
    <Layout title="Meus Agendamentos" showBack>
      
      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-start gap-3 border border-red-100 shadow-sm animate-fade-in">
           <AlertTriangle className="shrink-0 mt-0.5" size={18} />
           <p className="text-sm font-medium">{errorMsg}</p>
        </div>
      )}

      <div className="space-y-6">
        {appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                <Calendar size={48} className="mb-4 opacity-20 text-rose-500" />
                <p>Nenhum agendamento encontrado.</p>
                <button 
                  onClick={() => navigate('/client/book')}
                  className="mt-6 px-6 py-2 bg-rose-50 text-rose-600 rounded-full font-bold text-sm hover:bg-rose-100 transition"
                >
                    Agendar Agora
                </button>
            </div>
        ) : (
            appointments.map(app => {
                const isCancelled = app.status === AppointmentStatus.CANCELLED;
                const isCompleted = app.status === AppointmentStatus.COMPLETED;
                const isUpcoming = app.status === AppointmentStatus.CONFIRMED || app.status === AppointmentStatus.PENDING;

                return (
                    <div key={app.id} className={`relative overflow-hidden bg-white p-6 rounded-2xl border transition-all duration-300 ${isCancelled ? 'border-slate-100 opacity-60 grayscale-[0.5]' : 'border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]'}`}>
                       
                       <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                              <div className={`w-2 h-10 rounded-full ${
                                  app.status === AppointmentStatus.CONFIRMED ? 'bg-green-400' :
                                  app.status === AppointmentStatus.PENDING ? 'bg-orange-400' :
                                  app.status === AppointmentStatus.CANCELLED ? 'bg-slate-300' : 'bg-blue-400'
                              }`}></div>
                              <div>
                                <h3 className="font-bold text-slate-900 text-lg leading-tight">{getServiceName(app.serviceId)}</h3>
                                <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                    <span className="flex items-center gap-1"><Calendar size={12}/> {app.date.split('-').reverse().join('/')}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                    <span className="flex items-center gap-1"><Clock size={12}/> {app.time}</span>
                                </p>
                              </div>
                          </div>
                          
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                              app.status === AppointmentStatus.CONFIRMED ? 'bg-green-50 text-green-700' :
                              app.status === AppointmentStatus.PENDING ? 'bg-orange-50 text-orange-700' :
                              app.status === AppointmentStatus.CANCELLED ? 'bg-slate-100 text-slate-600' :
                              'bg-blue-50 text-blue-700'
                          }`}>
                              {app.status === AppointmentStatus.CONFIRMED ? 'Confirmado' : 
                               app.status === AppointmentStatus.PENDING ? 'Pendente' :
                               app.status === AppointmentStatus.CANCELLED ? 'Cancelado' : 'Concluído'}
                          </span>
                       </div>

                       <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl mb-5">
                          {getProAvatar(app.professionalId) ? (
                              <img src={getProAvatar(app.professionalId)} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500"><User size={14}/></div>
                          )}
                          <div>
                              <p className="text-xs text-slate-400 uppercase tracking-wide">Profissional</p>
                              <p className="font-semibold text-slate-700 text-sm">{getProName(app.professionalId)}</p>
                          </div>
                       </div>

                       {isUpcoming && (
                           <div className="grid grid-cols-2 gap-3">
                               <button 
                                  onClick={() => handleReschedule(app)}
                                  className="flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 rounded-xl transition"
                               >
                                   <RefreshCw size={14} /> Reagendar
                               </button>
                               <button 
                                  onClick={() => handleCancel(app)}
                                  className="flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-rose-600 bg-rose-50/50 hover:bg-rose-50 border border-rose-100 rounded-xl transition"
                               >
                                   <XCircle size={14} /> Cancelar
                               </button>
                           </div>
                       )}
                       
                       {isUpcoming && (
                           <div className="mt-4 flex items-center gap-2 justify-center">
                               <p className="text-[10px] text-slate-400">
                                   Reagendamento permitido até {config.cancellationWindowHours}h antes.
                               </p>
                           </div>
                       )}
                    </div>
                );
            })
        )}
      </div>
    </Layout>
  );
};

export default MyAppointments;