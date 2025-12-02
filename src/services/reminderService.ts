/**
 * Reminder Service
 * Gerencia lembretes automáticos de agendamentos (24h antes)
 */

import { logger } from '../utils/logger';
import { AppointmentService } from './appointments';
import { CatalogService } from './catalog';
import { EmailService } from './emailService';
import type { Appointment } from '../types';

export const ReminderService = {
  /**
   * Inicia o serviço de lembretes
   * Checa a cada hora se há agendamentos para lembrar
   */
  startReminderService(): void {
    logger.info('Serviço de lembretes iniciado');

    // Checa a cada hora
    setInterval(() => {
      this.checkAndSendReminders();
    }, 60 * 60 * 1000); // 1 hora

    // Também checa ao inicializar
    this.checkAndSendReminders();
  },

  /**
   * Verifica e envia lembretes para agendamentos em 24h
   */
  async checkAndSendReminders(): Promise<void> {
    try {
      const appointments = AppointmentService.getAppointments();
      const now = new Date();
      const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const remindersToSend = appointments.filter((apt: Appointment) => {
        // Se status não é confirmado ou pendente, pula
        if (apt.status !== 'CONFIRMED' && apt.status !== 'PENDING') return false;

        const appointmentTime = new Date(`${apt.date}T${apt.time}`);

        // Se está no período de 24h antes (com margem de 1h)
        return (
          appointmentTime > now &&
          appointmentTime <= in24h &&
          appointmentTime.getTime() - now.getTime() < 25 * 60 * 60 * 1000
        );
      });

      for (const apt of remindersToSend) {
        await this.sendReminder(apt);
      }

      if (remindersToSend.length > 0) {
        logger.info(`${remindersToSend.length} lembretes enviados`);
      }
    } catch (error) {
      logger.error('Erro ao verificar lembretes', error instanceof Error ? error : new Error(String(error)));
    }
  },

  /**
   * Envia lembrete para um agendamento específico
   */
  async sendReminder(appointment: Appointment): Promise<boolean> {
    try {
      const professionals = CatalogService.getProfessionals();
      const services = CatalogService.getServices();

      const professional = professionals.find(p => p.id === appointment.professionalId);
      const service = services.find(s => s.id === appointment.serviceId);

      const success = await EmailService.sendAppointmentReminder(
        appointment,
        appointment.clientEmail || 'client@example.com',
        appointment.clientName,
        service?.name || 'Serviço',
        professional?.name || 'Profissional'
      );

      if (success) {
        logger.info('Lembrete enviado com sucesso', {
          appointmentId: appointment.id,
          clientEmail: appointment.clientEmail,
        });
      }

      return success;
    } catch (error) {
      logger.error('Erro ao enviar lembrete', error instanceof Error ? error : new Error(String(error)), { id: appointment.id });
      return false;
    }
  },

  /**
   * Envia lembretes manuais (admin)
   */
  async sendManualReminder(appointmentId?: string): Promise<boolean> {
    try {
      const appointment = appointmentId ? AppointmentService.getAppointments().find(a => a.id === appointmentId) : null;
      if (!appointment) throw new Error('Agendamento não encontrado');

      return this.sendReminder(appointment);
    } catch (error) {
      logger.error('Erro ao enviar lembrete manual', error instanceof Error ? error : new Error(String(error)), { id: appointmentId });
      return false;
    }
  },
};

export default ReminderService;
