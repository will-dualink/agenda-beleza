
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { StorageService, timeToMinutes, minutesToTime } from '../../services/storage';
import { Service, Professional, Appointment, AppointmentStatus, ClientProfile, ClientPackage, PaymentMethod } from '../../types';
import { Clock, CheckCircle, RefreshCw, Calendar as CalendarIcon, ChevronRight, AlertCircle, Loader2, Tag, Gift, CreditCard, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Masks } from '../../utils/masks';

const Booking: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<ClientProfile | null>(null);

  const [step, setStep] = useState<number>(1);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [clientPackages, setClientPackages] = useState<ClientPackage[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  
  // Multi-Service Cart
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  
  // Selection State
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('');
  
  // Pricing & Promos
  const [finalPrice, setFinalPrice] = useState(0);
  const [discountReason, setDiscountReason] = useState<string | undefined>(undefined);
  const [applicablePackage, setApplicablePackage] = useState<ClientPackage | null>(null);
  const [usePackageCredit, setUsePackageCredit] = useState(false);

  // Reschedule State
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);

  // Availability
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [nextDays, setNextDays] = useState<Date[]>([]);

  useEffect(() => {
    const user = StorageService.getCurrentUser();
    if (!user) {
        navigate('/login');
        return;
    }
    setCurrentUser(user);

    setServices(StorageService.getServices());
    setProfessionals(StorageService.getProfessionals());
    setClientPackages(StorageService.getClientPackages(user.id));
    setPaymentMethods(StorageService.getPaymentMethods().filter(pm => pm.active));

    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        dates.push(d);
    }
    setNextDays(dates);

    if (location.state) {
        const { initialService, initialProfessional, rescheduleAppointmentId } = location.state as any;
        if (initialService) {
            handleServiceToggle(initialService);
            if (initialProfessional) {
                setSelectedProfessional(initialProfessional);
            }
        }
        if (rescheduleAppointmentId) {
            setRescheduleId(rescheduleAppointmentId);
        }
    }
  }, [location.state, navigate]);

  // Recalculate price
  useEffect(() => {
    if (selectedServices.length > 0) {
        let total = 0;
        let reasons = [];
        
        // Calculate price for each service
        selectedServices.forEach(srv => {
           if (selectedDate && selectedTime) {
              const calc = StorageService.calculatePrice(srv, selectedDate, selectedTime, currentUser?.id);
              total += calc.finalPrice;
              if (calc.discountReason) reasons.push(calc.discountReason);
           } else {
              total += srv.price;
           }
        });

        setFinalPrice(total);
        setDiscountReason(reasons.length > 0 ? reasons.join(', ') : undefined);
    }
  }, [selectedServices, selectedDate, selectedTime, currentUser]);

  // Check Packages
  useEffect(() => {
    if (selectedServices.length === 1 && clientPackages.length > 0) {
      const srv = selectedServices[0];
      const pkg = clientPackages.find(p => p.remainingItems.some(i => i.serviceId === srv.id && i.count > 0));
      setApplicablePackage(pkg || null);
      if (pkg) setUsePackageCredit(true);
    } else {
      setApplicablePackage(null); // Simple package logic: only works for single service booking for now
      setUsePackageCredit(false);
    }
  }, [selectedServices, clientPackages]);

  // Filter Pros who can do ALL selected services (Simplified logic)
  const availableProfessionals = selectedServices.length > 0
    ? professionals.filter(p => selectedServices.every(srv => p.specialties.includes(srv.id)))
    : [];

  const handleServiceToggle = (service: Service) => {
    const exists = selectedServices.find(s => s.id === service.id);
    if (exists) {
        setSelectedServices(prev => prev.filter(s => s.id !== service.id));
    } else {
        setSelectedServices(prev => [...prev, service]);
    }
  };

  const handleProfessionalSelect = (prof: Professional | null) => {
    setSelectedProfessional(prof);
    setStep(3);
    if (selectedDate) {
        checkAvailability(selectedDate, prof);
    }
  };

  const checkAvailability = (date: string, proOverride?: Professional | null) => {
    setSelectedDate(date);
    setSelectedTime('');
    if (selectedServices.length === 0) return;

    setIsLoadingSlots(true);
    setTimeout(() => {
        const proIdToCheck = proOverride !== undefined ? proOverride?.id : selectedProfessional?.id;
        
        // Pass Array of IDs or explicit total duration
        const totalDuration = selectedServices.reduce((acc, s) => acc + s.durationMinutes + (s.bufferMinutes || 0), 0);
        
        const slots = StorageService.getAvailableSlots(
            date, 
            selectedServices.map(s => s.id),
            proIdToCheck,
            totalDuration
        );
        setAvailableSlots(slots);
        setIsLoadingSlots(false);
    }, 400);
  };

  const handleDateClick = (date: Date) => {
      const dateStr = date.toISOString().split('T')[0];
      checkAvailability(dateStr);
  };

  const handleConfirm = async () => {
    if (selectedServices.length === 0 || !selectedDate || !selectedTime || !currentUser) return;
    if (!usePackageCredit && !selectedPaymentMethodId) {
       alert("Por favor, selecione uma forma de pagamento.");
       return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Determine Professional
    let finalProId = selectedProfessional?.id;
    if (!finalProId) {
       // Find any pro who is free for the TOTAL duration
       const totalDuration = selectedServices.reduce((acc, s) => acc + s.durationMinutes + (s.bufferMinutes || 0), 0);
       const freePro = professionals.find(p => {
          if (!selectedServices.every(srv => p.specialties.includes(srv.id))) return false;
          const slots = StorageService.getAvailableSlots(selectedDate, selectedServices.map(s => s.id), p.id, totalDuration);
          return slots.includes(selectedTime);
       });
       if (freePro) finalProId = freePro.id;
    }

    if (!finalProId) {
        setIsProcessing(false);
        alert("Erro ao confirmar: Profissional não encontrado ou horário indisponível.");
        return;
    }

    // Create SEQUENTIAL Appointments
    let currentStartTimeMin = timeToMinutes(selectedTime);

    for (const service of selectedServices) {
        const startTimeStr = minutesToTime(currentStartTimeMin);
        
        const newAppointment: Appointment = {
            id: Math.random().toString(36).substr(2, 9),
            clientId: currentUser.id, 
            clientName: currentUser.name,
            professionalId: finalProId,
            serviceId: service.id,
            date: selectedDate,
            time: startTimeStr,
            status: AppointmentStatus.PENDING,
            packageId: usePackageCredit && applicablePackage ? applicablePackage.id : undefined
        };

        const servicePrice = StorageService.calculatePrice(service, selectedDate, startTimeStr, currentUser.id).finalPrice;

        StorageService.addAppointment(
            newAppointment, 
            usePackageCredit && applicablePackage ? applicablePackage.id : undefined,
            selectedPaymentMethodId,
            servicePrice
        );

        // Advance time cursor
        currentStartTimeMin += service.durationMinutes + (service.bufferMinutes || 0);
    }

    if (rescheduleId) {
        StorageService.updateAppointmentStatus(rescheduleId, AppointmentStatus.CANCELLED);
    }

    setIsProcessing(false);
    setStep(5);
  };

  const ProgressBar = () => (
    <div className="flex gap-2 mb-8 px-1">
      {[1, 2, 3, 4].map(s => (
        <div 
          key={s} 
          className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-rose-500' : 'bg-slate-200'}`} 
        />
      ))}
    </div>
  );

  return (
    <Layout title={rescheduleId ? "Reagendar" : "Novo Agendamento"} showBack>
      {rescheduleId && step < 5 && (
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mb-6 flex items-start gap-3 text-indigo-800 text-sm shadow-sm">
            <RefreshCw size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Modo de Reagendamento</p>
              <p className="opacity-80">Seu horário atual está garantido até você confirmar o novo.</p>
            </div>
        </div>
      )}

      {step < 5 && <ProgressBar />}

      {/* Step 1: Select Service(s) */}
      {step === 1 && (
        <div className="space-y-6 animate-fade-in pb-20">
          <h2 className="text-2xl font-bold text-slate-900">Selecione os serviços</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {services.map(service => {
              const isSelected = selectedServices.some(s => s.id === service.id);
              return (
                <button 
                    key={service.id}
                    onClick={() => handleServiceToggle(service)}
                    className={`group flex flex-col items-start p-0 bg-white border rounded-2xl transition-all duration-300 text-left overflow-hidden active:scale-[0.98] relative shadow-sm
                        ${isSelected ? 'border-rose-500 ring-2 ring-rose-200 shadow-xl' : 'border-slate-100 hover:border-rose-200 hover:shadow-lg'}
                    `}
                >
                    <div className="w-full h-40 overflow-hidden bg-slate-100 relative">
                        <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
                        
                        <div className="absolute top-3 right-3 z-10">
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isSelected ? 'bg-rose-500 border-rose-500 text-white scale-110 shadow-lg' : 'bg-black/20 border-white/70 text-transparent backdrop-blur-sm'}`}>
                                <CheckCircle size={18} strokeWidth={3} />
                            </div>
                        </div>

                        <div className="absolute bottom-0 left-0 w-full p-5">
                            <h3 className="text-white font-bold text-xl leading-tight mb-2 drop-shadow-md">{service.name}</h3>
                            <div className="flex items-center gap-2">
                                <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-lg text-sm font-bold border border-white/10 shadow-sm flex items-center gap-1">
                                    {Masks.currency(service.price)}
                                </span>
                                <span className="text-slate-300 text-xs flex items-center gap-1 bg-black/30 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/5">
                                    <Clock size={12}/> {service.durationMinutes} min
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="p-5 w-full bg-white flex-1">
                         <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed font-medium">
                            {service.description || "Sem descrição disponível."}
                         </p>
                    </div>
                </button>
              )
            })}
          </div>

          {/* Floating Cart Bar */}
          {selectedServices.length > 0 && (
             <div className="fixed bottom-6 left-6 right-6 z-40 max-w-3xl mx-auto">
                 <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between animate-fade-in-up border border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-rose-500 w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-lg shadow-rose-900/20">
                            {selectedServices.length}
                        </div>
                        <div>
                            <p className="font-bold text-sm">Serviços Selecionados</p>
                            <p className="text-xs text-slate-400">
                                Total: {Masks.currency(selectedServices.reduce((a, b) => a + b.price, 0))}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setStep(2)}
                        className="bg-white text-slate-900 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-100 transition shadow-md"
                    >
                        Continuar
                    </button>
                 </div>
             </div>
          )}
        </div>
      )}

      {/* Step 2: Select Pro */}
      {step === 2 && (
        <div className="space-y-6 animate-fade-in">
          <h2 className="text-2xl font-bold text-slate-900">Escolha o profissional</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <button 
                onClick={() => handleProfessionalSelect(null)}
                className="flex items-center p-4 bg-gradient-to-br from-slate-50 to-white border border-slate-200 border-dashed rounded-2xl hover:border-rose-300 hover:bg-rose-50/30 transition-all text-left group active:scale-[0.98]"
            >
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-rose-500 transition-colors">
                    <Clock size={24} />
                </div>
                <div className="ml-4 flex-1">
                    <h3 className="font-bold text-slate-900 text-lg">Qualquer Disponível</h3>
                    <p className="text-sm text-slate-400">Ver o horário mais próximo</p>
                </div>
                <ChevronRight className="text-slate-200 group-hover:text-rose-300 transition-colors" />
            </button>

            {availableProfessionals.map(prof => (
              <button 
                key={prof.id}
                onClick={() => handleProfessionalSelect(prof)}
                className="flex items-center p-4 bg-white border border-slate-100 rounded-2xl hover:border-rose-200 hover:shadow-lg hover:shadow-rose-500/5 transition-all duration-300 text-left group active:scale-[0.98]"
              >
                <img src={prof.avatarUrl} alt={prof.name} className="w-16 h-16 rounded-full object-cover border-4 border-slate-50 group-hover:border-rose-50 transition-colors" />
                <div className="ml-4 flex-1">
                  <h3 className="font-bold text-slate-900 text-lg group-hover:text-rose-600 transition-colors">{prof.name}</h3>
                  <p className="text-sm text-slate-400">Especialista</p>
                </div>
                <ChevronRight className="text-slate-200 group-hover:text-rose-300 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Date & Time */}
      {step === 3 && (
        <div className="space-y-6 animate-fade-in">
          <h2 className="text-2xl font-bold text-slate-900">Data e Hora</h2>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">
               <CalendarIcon size={16} className="text-rose-500" /> Selecione o dia
            </label>
            <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2 no-scrollbar scroll-smooth">
                {nextDays.map((date) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const isSelected = selectedDate === dateStr;
                    const isToday = dateStr === new Date().toISOString().split('T')[0];
                    return (
                        <button 
                            key={dateStr}
                            onClick={() => handleDateClick(date)}
                            className={`min-w-[4.5rem] p-3 rounded-2xl flex flex-col items-center justify-center border transition-all duration-300 active:scale-95 relative
                                ${isSelected 
                                ? 'bg-rose-500/95 backdrop-blur-sm text-white border-rose-500 shadow-[0_8px_20px_-6px_rgba(244,63,94,0.4)] scale-105 z-10' 
                                : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-white hover:border-rose-200 hover:shadow-sm'
                                }
                            `}
                        >
                            <span className={`text-xs font-medium uppercase mb-1 ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                                {isToday ? 'Hoje' : date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                            </span>
                            <span className="text-xl font-bold leading-none">{date.getDate()}</span>
                        </button>
                    )
                })}
            </div>
          </div>

          {selectedDate && (
            <div className="space-y-3 animate-fade-in-up">
               <label className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider">
                   <Clock size={16} className="text-rose-500" /> Horários disponíveis
               </label>
               
               {isLoadingSlots ? (
                   <div className="flex justify-center py-8 text-rose-500">
                       <Loader2 className="animate-spin" size={32} />
                   </div>
               ) : (
                   <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {availableSlots.length > 0 ? availableSlots.map(time => {
                        const isSelected = selectedTime === time;
                        return (
                            <button
                                key={time}
                                onClick={() => { setSelectedTime(time); setStep(4); }}
                                className={`py-3 px-2 rounded-xl border font-medium transition-all duration-200 shadow-sm active:scale-95
                                    ${isSelected 
                                        ? 'bg-rose-600 text-white border-rose-600 shadow-rose-200' 
                                        : 'border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-700'
                                    }
                                `}
                            >
                                {time}
                            </button>
                        );
                    }) : (
                        <div className="col-span-full py-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <p className="mb-2">Sem horários para esta duração.</p>
                            <p className="text-xs">Tente dividir o agendamento ou escolher outro dia.</p>
                        </div>
                    )}
                   </div>
               )}
            </div>
          )}
        </div>
      )}

      {/* Step 4: Checkout */}
      {step === 4 && (
        <div className="space-y-8 animate-fade-in">
           <h2 className="text-2xl font-bold text-slate-900">Revise e Pague</h2>
           
           <div className="bg-white p-0 rounded-2xl border border-slate-200 shadow-[0_10px_40px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="bg-slate-900 p-6 text-white text-center relative">
                  <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Total a Pagar</p>
                  
                  {usePackageCredit && applicablePackage ? (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-3xl font-bold text-emerald-400 flex items-center gap-2">
                            <Gift size={24} /> 0,00
                        </span>
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded text-white">
                           Coberto pelo pacote
                        </span>
                      </div>
                  ) : (
                      <div className="flex flex-col items-center">
                         <span className="text-3xl font-bold">{Masks.currency(finalPrice)}</span>
                      </div>
                  )}

                  {discountReason && !usePackageCredit && (
                     <div className="absolute top-4 right-4 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">
                        PROMO ATIVA
                     </div>
                  )}
              </div>
              
              <div className="p-8 space-y-6">
                 {/* Promo Highlight */}
                 {discountReason && !usePackageCredit && (
                    <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg flex items-center gap-3 text-rose-800 text-sm">
                       <Tag size={16} />
                       <span className="font-bold">{discountReason}</span>
                    </div>
                 )}

                 {/* Cart Summary */}
                 <div>
                    <h4 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2">
                        <ShoppingBag size={16} className="text-rose-500"/> Resumo do Pedido
                    </h4>
                    <ul className="space-y-3">
                        {selectedServices.map(srv => (
                            <li key={srv.id} className="flex justify-between text-sm border-b border-slate-100 pb-2 last:border-0">
                                <span>{srv.name}</span>
                                <span className="font-bold">{Masks.currency(srv.price)}</span>
                            </li>
                        ))}
                    </ul>
                 </div>

                 {/* Payment Method Selector (if not using package) */}
                 {!usePackageCredit && (
                     <div>
                        <h4 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2">
                            <CreditCard size={16} className="text-rose-500"/> Forma de Pagamento
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                           {paymentMethods.map(pm => (
                               <button
                                  key={pm.id}
                                  onClick={() => setSelectedPaymentMethodId(pm.id)}
                                  className={`p-3 rounded-lg border text-sm font-medium transition-all
                                     ${selectedPaymentMethodId === pm.id 
                                        ? 'border-rose-500 bg-rose-50 text-rose-700' 
                                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                                     }
                                  `}
                               >
                                  {pm.name}
                               </button>
                           ))}
                        </div>
                     </div>
                 )}

                 <div className="space-y-2 pt-2 text-center text-sm text-slate-500">
                    <p>Agendamento para <strong>{selectedDate.split('-').reverse().join('/')}</strong> às <strong>{selectedTime}</strong></p>
                 </div>
              </div>
           </div>

           <button 
             onClick={handleConfirm}
             disabled={isProcessing}
             className={`w-full py-4 text-white rounded-xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.98] shadow-lg flex items-center justify-center gap-2
                ${usePackageCredit ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' : 'bg-gradient-to-r from-rose-500 to-rose-600 hover:shadow-rose-500/30'}
                ${isProcessing ? 'opacity-80 cursor-wait' : ''}
             `}
           >
             {isProcessing ? (
                 <>
                   <Loader2 size={24} className="animate-spin" /> Processando...
                 </>
             ) : (
                 usePackageCredit ? 'Confirmar Resgate' : 'Confirmar Agendamento'
             )}
           </button>
        </div>
      )}

      {/* Step 5: Success */}
      {step === 5 && (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-6 animate-fade-in-up">
          <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-2 shadow-sm">
            <CheckCircle size={48} strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">Tudo pronto!</h2>
            <p className="text-slate-500 max-w-xs mx-auto">
                Seus agendamentos foram confirmados com sucesso.
            </p>
          </div>
          
          <div className="w-full max-w-xs pt-8 space-y-3">
              <button 
                 onClick={() => navigate('/client/appointments')} 
                 className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition shadow-lg shadow-slate-200"
              >
                Ver Meus Agendamentos
              </button>
              <button 
                 onClick={() => navigate('/')} 
                 className="w-full py-3.5 text-slate-500 hover:text-slate-900 font-semibold"
              >
                Voltar ao Início
              </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Booking;
