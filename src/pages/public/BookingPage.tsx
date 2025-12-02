/**
 * Página Pública de Agendamento
 * Interface para clientes agendarem serviços
 */

import React, { useState, useMemo } from 'react';
import { Calendar, Clock, User, Phone, Mail, AlertCircle, Loader2, Check } from 'lucide-react';
import { AppointmentService } from '../../services/appointments';
import { CatalogService } from '../../services/catalog';
import { FinanceService } from '../../services/finance';
import { EmailService } from '../../services/emailService';
import { logger } from '../../utils/logger';
import { masks } from '../../utils/masks';
import { isValidPhone } from '../../utils/validators';
import { AppointmentStatus, TransactionCategory, TransactionType } from '../../types';
import type { Service, Professional, Appointment } from '../../types';

type BookingStep = 'service' | 'date' | 'professional' | 'checkout' | 'confirmation';

interface BookingForm {
  serviceId: string;
  professionalId: string;
  date: string;
  time: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
}

export const BookingPage: React.FC = () => {
  const [step, setStep] = useState<BookingStep>('service');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appointment, setAppointment] = useState<Appointment | null>(null);

  const [form, setForm] = useState<BookingForm>({
    serviceId: '',
    professionalId: '',
    date: '',
    time: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
  });

  const services = useMemo(() => CatalogService.getServices(), []);
  const professionals = useMemo(() => CatalogService.getProfessionals(), []);

  const availableProfessionals = useMemo(() => {
    if (!form.serviceId) return professionals;
    const service = services.find(s => s.id === form.serviceId);
    if (!service) return professionals;
    return professionals.filter(p => p.specialties?.includes(service.id));
  }, [form.serviceId, services, professionals]);

  const availableSlots = useMemo(() => {
    if (!form.serviceId || !form.date) return [];
    const service = services.find(s => s.id === form.serviceId);
    if (!service) return [];
    return AppointmentService.getAvailableSlots(form.date, form.serviceId, undefined, service?.durationMinutes || 60);
  }, [form.serviceId, form.date, services]);

  const service = services.find(s => s.id === form.serviceId);
  const finalPrice = useMemo(() => {
    if (!service) return 0;
    let price = service.price;
    if (form.time && form.date) {
      const appointmentDate = new Date(`${form.date}T${form.time}:00`);
      const hour = appointmentDate.getHours();
      const promos = FinanceService.getPromotions();
      const happyHour = promos.find(p => p.type === 'HAPPY_HOUR' && p.active);
      if (happyHour && happyHour.rules?.startHour && happyHour.rules?.endHour) {
        const startHourNum = Number(happyHour.rules.startHour.split(':')[0]);
        const endHourNum = Number(happyHour.rules.endHour.split(':')[0]);
        if (!Number.isNaN(startHourNum) && !Number.isNaN(endHourNum) && hour >= startHourNum && hour < endHourNum) {
          price = price * (1 - (happyHour.discountPercentage || 0) / 100);
        }
      }
    }
    return price;
  }, [service, form.time, form.date]);

  const handleServiceSelect = (serviceId: string) => {
    setForm(prev => ({ ...prev, serviceId, professionalId: '', date: '', time: '' }));
    setStep('date');
    setError('');
  };

  const handleDateSelect = (dateStr: string) => {
    setForm(prev => ({ ...prev, date: dateStr }));
    setStep('professional');
    setError('');
  };

  const handleProfessionalSelect = (professionalId: string) => {
    setForm(prev => ({ ...prev, professionalId }));
    setError('');
  };

  const handleTimeSelect = (time: string) => {
    setForm(prev => ({ ...prev, time }));
    setStep('checkout');
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBooking = async () => {
    try {
      setLoading(true);
      setError('');

      if (!form.clientName.trim()) throw new Error('Nome obrigatório');
      if (!form.clientEmail.includes('@')) throw new Error('Email inválido');
      if (!isValidPhone(form.clientPhone || '')) {
        throw new Error('Telefone inválido (10-11 dígitos)');
      }
      if (!form.date || !form.time) throw new Error('Data e hora obrigatórias');

      const result = await AppointmentService.api.createAppointment({
        id: `apt-${Date.now()}`,
        clientId: `guest-${Date.now()}`,
        clientName: form.clientName,
        professionalId: form.professionalId,
        serviceId: form.serviceId,
        date: form.date,
        time: form.time,
        status: AppointmentStatus.PENDING,
        notes: 'Agendamento via portal público',
      });

      if (!result.success) {
        throw new Error(result.error || 'Erro ao criar agendamento');
      }

      const svc = services.find(s => s.id === form.serviceId);
      const prof = professionals.find(p => p.id === form.professionalId);
      const appointmentId = result.data?.[0]?.id || `apt-${Date.now()}`;

      FinanceService.addTransaction({
        id: `trans-${Date.now()}`,
        amount: finalPrice,
        type: TransactionType.INCOME,
        category: TransactionCategory.SERVICE,
        description: `${svc?.name} com ${prof?.name}`,
        appointmentId: appointmentId,
        date: form.date,
      });

      await EmailService.sendAppointmentConfirmation(
        { id: `apt-${Date.now()}`, clientId: form.clientName, clientName: form.clientName, professionalId: form.professionalId, serviceId: form.serviceId, date: form.date, time: form.time, status: AppointmentStatus.PENDING },
        form.clientEmail,
        form.clientName,
        svc?.name || 'Serviço',
        prof?.name || 'Profissional'
      );

      setAppointment({
        id: `apt-${Date.now()}`,
        clientId: form.clientName,
        clientName: form.clientName,
        professionalId: form.professionalId,
        serviceId: form.serviceId,
        date: form.date,
        time: form.time,
        status: AppointmentStatus.PENDING,
      });

      setStep('confirmation');
      logger.info('Agendamento realizado com sucesso', { clientEmail: form.clientEmail });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao agendar';
      setError(message);
      logger.error('Erro no agendamento', err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      {/* Premium Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-purple-100/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-light text-gray-900">
            Seu <span className="font-semibold bg-gradient-to-r from-purple-600 to-rose-600 bg-clip-text text-transparent">Momento Premium</span>
          </h1>
          <p className="text-gray-600 mt-2 font-light">Agende com elegância. Escolha a melhor experiência.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 font-light">{error}</p>
          </div>
        )}

        {/* Progress Indicator - Premium */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            {(['service', 'date', 'professional', 'checkout', 'confirmation'] as BookingStep[]).map((s, idx) => (
              <React.Fragment key={s}>
                <button
                  onClick={() => { if (step === 'checkout' && s !== 'checkout') setStep(s); }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${step === s ? 'bg-gradient-to-br from-purple-600 to-rose-600 text-white shadow-lg' : step.localeCompare(s) > 0 ? 'bg-purple-200/50 text-purple-700' : 'bg-gray-200 text-gray-600'}`}
                >
                  {step.localeCompare(s) > 0 ? <Check className="w-5 h-5" /> : idx + 1}
                </button>
                {idx < 4 && (
                  <div className={`flex-1 h-1 mx-2 transition-all duration-300 ${step.localeCompare(s) > 0 ? 'bg-gradient-to-r from-purple-200 to-pink-200' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {step === 'service' && (
          <div>
            <h2 className="text-3xl font-light text-gray-900 mb-8">Escolha seu <span className="font-semibold bg-gradient-to-r from-purple-600 to-rose-600 bg-clip-text text-transparent">Serviço</span></h2>
            <div className="grid md:grid-cols-2 gap-6">
              {services.map(svc => (
                <button key={svc.id} onClick={() => handleServiceSelect(svc.id)} className={`group relative overflow-hidden rounded-2xl transition-all duration-500 cursor-pointer text-left ${form.serviceId === svc.id ? 'ring-2 ring-purple-500 shadow-2xl' : 'hover:shadow-xl'}`}>
                  {/* Card Background */}
                  <div className={`relative h-56 md:h-64 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 ${form.serviceId === svc.id ? 'ring-2 ring-inset ring-purple-400' : ''}`}>
                    <img src={svc.imageUrl || `https://picsum.photos/400/300?random=${svc.id}`} alt={svc.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                    {/* Price Badge */}
                    <div className="absolute top-4 right-4">
                      <span className="inline-block px-4 py-2 bg-white/95 backdrop-blur text-purple-600 font-semibold rounded-full text-lg shadow-lg">
                        {masks.currency(svc.price)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`p-6 ${form.serviceId === svc.id ? 'bg-gradient-to-br from-purple-50 to-pink-50' : 'bg-white'}`}>
                    <h3 className="font-semibold text-xl text-gray-900 mb-2">{svc.name}</h3>
                    <p className="text-sm text-gray-600 font-light mb-4 line-clamp-2">{svc.description}</p>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <span className="text-xs text-gray-500 font-light">⏱ {svc.durationMinutes} minutos</span>
                      <span className={`text-sm font-semibold transition-colors ${form.serviceId === svc.id ? 'text-purple-600' : 'text-purple-400 group-hover:text-purple-600'}`}>
                        Selecionar →
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'date' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Escolha a data</h2>
            <div className="grid md:grid-cols-7 gap-2">
              {Array.from({ length: 30 }).map((_, idx) => {
                const date = new Date();
                date.setDate(date.getDate() + idx);
                const dateStr = date.toISOString().split('T')[0];
                const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' });
                const dayNum = date.getDate();
                const hasSlots = AppointmentService.getAvailableSlots(dateStr, form.serviceId, undefined, service?.durationMinutes || 60).length > 0;
                return (
                  <button key={dateStr} onClick={() => { if (hasSlots) handleDateSelect(dateStr); }} disabled={!hasSlots} className={`p-3 rounded border-2 transition text-center ${hasSlots ? 'border-gray-200 bg-white hover:border-purple-300 cursor-pointer' : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'}`}>
                    <div className="text-xs uppercase text-gray-500">{dayName}</div>
                    <div className="font-semibold text-gray-900">{dayNum}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 'professional' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Escolha o profissional</h2>
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {availableProfessionals.map(prof => (
                <button key={prof.id} onClick={() => handleProfessionalSelect(prof.id)} className={`p-4 rounded-lg border-2 transition ${form.professionalId === prof.id ? 'border-purple-600 bg-purple-50' : 'border-gray-200 bg-white hover:border-purple-300'}`}>
                  <img src={prof.avatarUrl || `https://picsum.photos/200/200?random=${prof.id}`} alt={prof.name} className="w-24 h-24 rounded-full mx-auto mb-2 object-cover" />
                  <h3 className="font-semibold text-center">{prof.name}</h3>
                  <p className="text-sm text-gray-600 text-center">{prof.specialties?.join(', ') || 'Especialista'}</p>
                </button>
              ))}
            </div>
            {form.professionalId && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Escolha o horário</h2>
                <div className="grid md:grid-cols-6 gap-2">
                  {availableSlots.length === 0 ? <p className="text-gray-500 col-span-full">Nenhum horário disponível</p> : availableSlots.map(slot => (
                    <button key={slot} onClick={() => handleTimeSelect(slot)} className={`p-2 rounded border-2 transition text-center font-medium ${form.time === slot ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-200 bg-white hover:border-purple-300'}`}>{slot}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'checkout' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-6">Seus Dados</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                  <input type="text" name="clientName" value={form.clientName} onChange={handleInputChange} placeholder="Seu nome" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1"><Mail className="w-4 h-4 inline mr-1" />Email *</label>
                  <input type="email" name="clientEmail" value={form.clientEmail} onChange={handleInputChange} placeholder="seu@email.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1"><Phone className="w-4 h-4 inline mr-1" />Telefone *</label>
                  <input type="tel" name="clientPhone" value={form.clientPhone} onChange={e => setForm(prev => ({ ...prev, clientPhone: masks.phone(e.target.value) }))} placeholder="(11) 98765-4321" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600" />
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-6">Resumo</h2>
              <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
                <div className="pb-4 border-b"><p className="text-sm text-gray-600">Serviço</p><p className="font-semibold text-gray-900">{service?.name}</p></div>
                <div className="pb-4 border-b"><p className="text-sm text-gray-600 flex items-center gap-2"><Calendar className="w-4 h-4" />Data</p><p className="font-semibold text-gray-900">{form.date ? new Date(form.date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</p></div>
                <div className="pb-4 border-b"><p className="text-sm text-gray-600 flex items-center gap-2"><Clock className="w-4 h-4" />Horário</p><p className="font-semibold text-gray-900">{form.time || '-'}</p></div>
                <div className="pb-4 border-b"><p className="text-sm text-gray-600 flex items-center gap-2"><User className="w-4 h-4" />Profissional</p><p className="font-semibold text-gray-900">{professionals.find(p => p.id === form.professionalId)?.name || '-'}</p></div>
                <div className="pt-4 border-t-2">
                  <div className="flex justify-between items-center mb-2"><span className="text-gray-600">Subtotal</span><span className="font-semibold">{masks.currency(service?.price || 0)}</span></div>
                  {finalPrice < (service?.price || 0) && <div className="flex justify-between items-center mb-2 text-green-600"><span className="text-sm">Desconto (Happy Hour)</span><span className="text-sm font-semibold">-{masks.currency((service?.price || 0) - finalPrice)}</span></div>}
                  <div className="flex justify-between items-center text-lg font-bold text-purple-600"><span>Total</span><span>{masks.currency(finalPrice)}</span></div>
                </div>
                <button onClick={handleBooking} disabled={loading} className="w-full mt-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Agendando...</> : 'Confirmar Agendamento'}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'confirmation' && appointment && (
          <div className="max-w-md mx-auto text-center">
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-8">
              <Check className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Agendamento Confirmado!</h2>
              <p className="text-gray-600 mb-6">Um email de confirmação foi enviado para {form.clientEmail}</p>
              <div className="bg-white p-4 rounded mb-6 text-left space-y-2">
                <p className="text-sm"><span className="text-gray-600">Serviço:</span><span className="font-semibold ml-2">{service?.name}</span></p>
                <p className="text-sm"><span className="text-gray-600">Profissional:</span><span className="font-semibold ml-2">{professionals.find(p => p.id === form.professionalId)?.name}</span></p>
                <p className="text-sm"><span className="text-gray-600">Data:</span><span className="font-semibold ml-2">{new Date(appointment.date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
                <p className="text-sm"><span className="text-gray-600">Horário:</span><span className="font-semibold ml-2">{appointment.time}</span></p>
              </div>
              <button onClick={() => { setForm({ serviceId: '', professionalId: '', date: '', time: '', clientName: '', clientEmail: '', clientPhone: '' }); setStep('service'); setAppointment(null); }} className="w-full py-2 bg-purple-600 text-white font-semibold rounded hover:bg-purple-700 transition">Novo Agendamento</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
