import { Appointment, AppointmentStatus, SalonConfig, TransactionType, TransactionCategory } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { get, set, timeToMinutes, minutesToTime } from './persistence';
import { CatalogService } from './catalog';
import { FinanceService } from './finance';
import { isValidDate, isValidTime, isValidAmount, retryWithBackoff, generateSecureId } from '../utils/security';

// --- Validation Helpers ---

const validateAppointment = (app: Appointment): { valid: boolean; error?: string } => {
  if (!app.clientId || app.clientId.trim() === '') {
    return { valid: false, error: 'Client ID is required.' };
  }
  if (!app.professionalId || app.professionalId.trim() === '') {
    return { valid: false, error: 'Professional ID is required.' };
  }
  if (!app.serviceId || app.serviceId.trim() === '') {
    return { valid: false, error: 'Service ID is required.' };
  }
  if (!isValidDate(app.date)) {
    return { valid: false, error: 'Invalid appointment date.' };
  }
  if (!isValidTime(app.time)) {
    return { valid: false, error: 'Invalid appointment time.' };
  }
  if (!app.clientName || app.clientName.trim() === '') {
    return { valid: false, error: 'Client name is required.' };
  }
  return { valid: true };
};

// --- Local Helpers (Defined first) ---

const getAppointments = (): Appointment[] => get('appointments', []);
const saveAppointments = (apps: Appointment[]) => set('appointments', apps);
const getConfig = (): SalonConfig => get('salon_config', { cancellationWindowHours: 12 });
const saveConfig = (config: SalonConfig) => set('salon_config', config);

const addAppointmentLocal = (app: Appointment, usePackageId?: string, paymentMethodId?: string, finalPrice?: number) => {
    // Validate appointment
    const validation = validateAppointment(app);
    if (!validation.valid) {
      console.error(`Invalid appointment: ${validation.error}`);
      throw new Error(validation.error);
    }

    // Validate final price if provided
    if (finalPrice !== undefined && !isValidAmount(finalPrice)) {
      throw new Error('Invalid final price amount.');
    }

    // Verificar conflito de horário
    const apps = getAppointments();
    const services = CatalogService.getServices();
    const appService = services.find(s => s.id === app.serviceId);
    if (!appService) throw new Error(`Service ${app.serviceId} not found.`);

    const appointmentDuration = app.customDuration || (appService.durationMinutes + (appService.bufferMinutes || 0));
    const appointmentStart = timeToMinutes(app.time);
    const appointmentEnd = appointmentStart + appointmentDuration;

    // Verificar se há conflito com outros agendamentos do mesmo profissional na mesma data
    const conflictingAppt = apps.find(existingApp => 
      existingApp.professionalId === app.professionalId &&
      existingApp.date === app.date &&
      existingApp.status !== AppointmentStatus.CANCELLED &&
      existingApp.status !== AppointmentStatus.COMPLETED
    );

    if (conflictingAppt) {
      const existingService = services.find(s => s.id === conflictingAppt.serviceId);
      const existingDuration = conflictingAppt.customDuration || (existingService?.durationMinutes || 60) + (existingService?.bufferMinutes || 0);
      const existingStart = timeToMinutes(conflictingAppt.time);
      const existingEnd = existingStart + existingDuration;

      if (!(appointmentEnd <= existingStart || appointmentStart >= existingEnd)) {
        throw new Error(`Conflict: Professional has another appointment from ${minutesToTime(existingStart)} to ${minutesToTime(existingEnd)}`);
      }
    }

    apps.push(app);
    saveAppointments(apps);

    const txId = generateSecureId();
    
    if (usePackageId) {
      FinanceService.consumePackageItem(usePackageId, app.serviceId);
      FinanceService.addTransaction({
        id: txId, date: app.date, description: `Uso de Pacote: ${appService.name}`, amount: 0, 
        type: TransactionType.INCOME, category: TransactionCategory.PACKAGE_USAGE, appointmentId: app.id, clientPackageId: usePackageId
      });
      FinanceService.recordCommission(app.professionalId, txId, appService.price, app.date);
    } else {
      const points = Math.floor(appService.price / 10);
      FinanceService.addLoyaltyPoints(app.clientId, points, txId, `Pontos por serviço: ${appService.name}`);

      FinanceService.addTransaction({
        id: txId, date: app.date, description: `Serviço: ${appService.name}`, 
        amount: finalPrice !== undefined ? finalPrice : appService.price, 
        type: TransactionType.INCOME, category: TransactionCategory.SERVICE, appointmentId: app.id, paymentMethodId: paymentMethodId
      });

      FinanceService.recordCommission(app.professionalId, txId, finalPrice !== undefined ? finalPrice : appService.price, app.date);
    }
};

// --- Export ---

export const AppointmentService = {
  getAppointments,
  saveAppointments,
  getConfig,
  saveConfig,

  syncAppointmentsByDate: async (dateStr: string): Promise<void> => {
    if (!isSupabaseConfigured()) return;
    
    if (!isValidDate(dateStr)) {
      throw new Error('Invalid date format.');
    }

    try {
      await retryWithBackoff(async () => {
        const { data, error } = await supabase.from('appointments').select('*').eq('appointment_date', dateStr);
        if (error) throw error;
        if (data) {
            const fetchedApps: Appointment[] = data.map((a: any) => ({
                id: a.id,
                clientId: a.client_id,
                clientName: 'Cliente (Sync)', 
                professionalId: a.professional_id,
                serviceId: a.service_id,
                date: a.appointment_date,
                time: a.appointment_time.substring(0, 5),
                status: a.status as AppointmentStatus,
                notes: a.notes || ''
            }));
            const currentApps = getAppointments();
            const otherApps = currentApps.filter(a => a.date !== dateStr);
            saveAppointments([...otherApps, ...fetchedApps]);
        }
      }, 3);
    } catch (e) { 
      console.error('Failed to sync appointments:', e);
      throw new Error('Failed to synchronize appointments.');
    }
  },

  getAvailableSlots: (dateStr: string, serviceIds: string | string[], professionalId?: string, explicitDuration?: number): string[] => {
    const services = CatalogService.getServices();
    const allPros = CatalogService.getProfessionals();
    const allApps = getAppointments();

    const serviceIdArray = Array.isArray(serviceIds) ? serviceIds : [serviceIds];
    const primaryServiceId = serviceIdArray[0];

    let totalDuration = 0;
    if (explicitDuration) {
        totalDuration = explicitDuration;
    } else {
        serviceIdArray.forEach(sid => {
            const s = services.find(serv => serv.id === sid);
            if (s) totalDuration += s.durationMinutes + (s.bufferMinutes || 0);
        });
    }

    if (totalDuration === 0) return [];
    const dayOfWeek = new Date(dateStr).getDay(); 

    let eligiblePros = allPros.filter(p => p.specialties.includes(primaryServiceId));
    if (serviceIdArray.length > 1) {
       eligiblePros = allPros.filter(p => serviceIdArray.every(sid => p.specialties.includes(sid)));
    }
    if (professionalId) {
      eligiblePros = eligiblePros.filter(p => p.id === professionalId);
    }
    eligiblePros = eligiblePros.filter(p => p.schedule.workDays.includes(dayOfWeek));

    if (eligiblePros.length === 0) return [];

    const possibleSlots: Set<string> = new Set();
    const SLOT_INTERVAL = 15;

    eligiblePros.forEach(pro => {
      const workStart = timeToMinutes(pro.schedule.workStart);
      const workEnd = timeToMinutes(pro.schedule.workEnd);
      const breakStart = pro.schedule.breakStart ? timeToMinutes(pro.schedule.breakStart) : -1;
      const breakEnd = pro.schedule.breakEnd ? timeToMinutes(pro.schedule.breakEnd) : -1;

      const proApps = allApps.filter(a => 
        a.professionalId === pro.id && 
        a.date === dateStr && 
        a.status !== AppointmentStatus.CANCELLED
      );

      for (let time = workStart; time + totalDuration <= workEnd; time += SLOT_INTERVAL) {
        const slotEnd = time + totalDuration;
        if (breakStart !== -1 && breakEnd !== -1) {
          if (time < breakEnd && slotEnd > breakStart) continue; 
        }

        let isBlocked = false;
        for (const app of proApps) {
          const appService = services.find(s => s.id === app.serviceId);
          const durationToUse = app.customDuration || ((appService?.durationMinutes || 60) + (appService?.bufferMinutes || 0));
          const appStart = timeToMinutes(app.time);
          const appEnd = appStart + durationToUse;

          if (time < appEnd && slotEnd > appStart) {
            isBlocked = true;
            break;
          }
        }
        if (!isBlocked) possibleSlots.add(minutesToTime(time));
      }
    });

    return Array.from(possibleSlots).sort();
  },

  canCancel: (appointment: Appointment): { allowed: boolean; reason?: string } => {
    if (appointment.status === AppointmentStatus.CANCELLED || appointment.status === AppointmentStatus.COMPLETED) {
      return { allowed: false, reason: 'Status inválido.' };
    }
    const config = getConfig();
    const appDate = new Date(`${appointment.date}T${appointment.time}`);
    const now = new Date();
    const diffHours = (appDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < config.cancellationWindowHours) {
      return { allowed: false, reason: `Mínimo de ${config.cancellationWindowHours}h de antecedência.` };
    }
    return { allowed: true };
  },

  addAppointment: addAppointmentLocal,

  updateAppointmentStatus: async (id: string, status: AppointmentStatus) => {
    if (isSupabaseConfigured()) {
        try { await supabase.from('appointments').update({ status }).eq('id', id); } catch (e) {}
    }
    const apps = getAppointments();
    const appIndex = apps.findIndex(a => a.id === id);
    if (appIndex === -1) return;
    const oldStatus = apps[appIndex].status;
    apps[appIndex].status = status;
    saveAppointments(apps);
    if (oldStatus !== AppointmentStatus.COMPLETED && status === AppointmentStatus.COMPLETED) {
       FinanceService.triggerServiceStockConsumption(apps[appIndex].serviceId);
    }
  },

  addBlock: async (date: string, time: string, durationMinutes: number, professionalId: string, reason: string) => {
     // Validate inputs
     if (!isValidDate(date)) throw new Error('Invalid date format.');
     if (!isValidTime(time)) throw new Error('Invalid time format.');
     if (!Number.isInteger(durationMinutes) || durationMinutes < 15 || durationMinutes > 480) {
       throw new Error('Duration must be between 15 and 480 minutes.');
     }
     if (!professionalId || professionalId.trim() === '') throw new Error('Professional ID is required.');
     if (!reason || reason.trim() === '') throw new Error('Block reason is required.');

     const blockId = generateSecureId();
     const apps = getAppointments();
     apps.push({
         id: blockId,
         clientId: 'ADMIN_BLOCK', clientName: reason, professionalId, serviceId: 'BLOCK',
         date, time, status: AppointmentStatus.BLOCKED, customDuration: durationMinutes
     });
     saveAppointments(apps);
  },

  moveAppointment: async (id: string, newDate: string, newTime: string, newProfessionalId: string) => {
      // Validate inputs
      if (!id || id.trim() === '') throw new Error('Appointment ID is required.');
      if (!isValidDate(newDate)) throw new Error('Invalid new date format.');
      if (!isValidTime(newTime)) throw new Error('Invalid new time format.');
      if (!newProfessionalId || newProfessionalId.trim() === '') throw new Error('Professional ID is required.');

      if (isSupabaseConfigured()) {
          try {
              await retryWithBackoff(async () => {
                await supabase.from('appointments').update({
                    date: newDate, time: newTime, professional_id: newProfessionalId
                }).eq('id', id);
              }, 2);
          } catch (e) {
            console.error('Failed to sync appointment move:', e);
          }
      }
      const apps = getAppointments();
      const appIndex = apps.findIndex(a => a.id === id);
      if (appIndex === -1) throw new Error('Appointment not found.');
      apps[appIndex].date = newDate;
      apps[appIndex].time = newTime;
      apps[appIndex].professionalId = newProfessionalId;
      saveAppointments(apps);
  },

  updateAppointmentDuration: (id: string, newDurationMinutes: number) => {
    const apps = getAppointments();
    const appIndex = apps.findIndex(a => a.id === id);
    if (appIndex === -1) return;
    if (newDurationMinutes < 15) newDurationMinutes = 15;
    apps[appIndex].customDuration = newDurationMinutes;
    saveAppointments(apps);
  },

  api: {
    createAppointment: async (app: Appointment) => {
       // Validate appointment
       const validation = validateAppointment(app);
       if (!validation.valid) {
         return { success: false, error: validation.error };
       }

       if (!isSupabaseConfigured()) {
           try {
             addAppointmentLocal(app);
             return { success: true, local: true };
           } catch (error) {
             return { success: false, error: (error as Error).message };
           }
       }

       try {
          console.log('Attempting Supabase insert...');
          const result = await retryWithBackoff(async () => {
            const query = supabase.from('appointments');
            console.log('Query object:', query);
            if (!query || !query.insert) {
              throw new Error('Supabase from() returned invalid object');
            }
            return await query.insert([{
               client_id: app.clientId,
               professional_id: app.professionalId,
               service_id: app.serviceId,
               date: app.date,
               time: app.time,
               status: app.status || 'scheduled'
            }]).select();
          }, 2, 500);

          console.log('Supabase result:', result);
          const { data, error } = result || {};
          if (error) throw error;
          
          try {
            addAppointmentLocal(app);
          } catch (localError) {
            console.warn('Failed to save locally after cloud sync:', localError);
          }
          
          return { success: true, data };
       } catch (err) {
          console.error("Failed to sync appointment", err);
          try {
            addAppointmentLocal(app);
            return { success: true, local: true };
          } catch (localError) {
            return { success: false, error: (localError as Error).message };
          }
       }
    }
  }
};