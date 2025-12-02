/**
 * Email Service
 * Integração com Resend para envio de emails (confirmações, lembretes, recibos)
 */

import { logger } from '../utils/logger';
import type { Appointment, SalonConfig } from '../types';

// Simula Resend API (substituir com chave real em .env)
const RESEND_API_KEY = (import.meta as any)?.env?.VITE_RESEND_API_KEY || '';
const RESEND_API_URL = 'https://api.resend.com/emails';

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

/**
 * Serviço de Email
 */
export const EmailService = {
  /**
   * Envia email genérico (abstração para Resend)
   */
  async send(template: EmailTemplate): Promise<boolean> {
    try {
      if (!RESEND_API_KEY) {
        logger.warn('VITE_RESEND_API_KEY não configurada, emails não serão enviados', {
          to: template.to,
          subject: template.subject,
        });
        return false;
      }

      const response = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: template.from || 'noreply@agendabeleza.com.br',
          to: template.to,
          subject: template.subject,
          html: template.html,
          reply_to: template.replyTo,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao enviar email');
      }

      logger.info('Email enviado com sucesso', { to: template.to, subject: template.subject });
      return true;
    } catch (error) {
      logger.error('Erro ao enviar email', error instanceof Error ? error : new Error(String(error)), {
        to: template.to,
        subject: template.subject,
      });
      return false;
    }
  },

  /**
   * Email de confirmação de agendamento
   */
  async sendAppointmentConfirmation(
    appointment: Appointment,
    clientEmail: string,
    clientName: string,
    serviceName: string,
    professionalName: string,
    salonName: string = 'Agenda Beleza'
  ): Promise<boolean> {
    const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
    const formattedDate = appointmentDate.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = appointmentDate.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #e0e0e0; }
          .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #667eea; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
          .button { background: #667eea; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Agendamento Confirmado!</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${clientName}</strong>,</p>
            <p>Seu agendamento foi confirmado com sucesso em <strong>${salonName}</strong>!</p>
            
            <div class="details">
              <h3>Detalhes do Agendamento</h3>
              <p><strong>Serviço:</strong> ${serviceName}</p>
              <p><strong>Profissional:</strong> ${professionalName}</p>
              <p><strong>Data:</strong> ${formattedDate}</p>
              <p><strong>Horário:</strong> ${formattedTime}</p>
              <p><strong>ID do Agendamento:</strong> <code>${appointment.id}</code></p>
            </div>

            <p style="color: #666; font-size: 14px;">
              <strong>⏰ Importante:</strong> Chegue 5 minutos antes do horário marcado. 
              Cancelamentos devem ser feitos com 12 horas de antecedência.
            </p>

            <p style="text-align: center; margin: 20px 0;">
              <a href="mailto:contato@agendabeleza.com.br?subject=Dúvida sobre agendamento ${appointment.id}" class="button">
                Enviar Dúvida
              </a>
            </p>
          </div>
          <div class="footer">
            <p>Este é um email automático. Não responda diretamente.</p>
            <p>&copy; 2025 Agenda Beleza. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.send({
      to: clientEmail,
      subject: `Agendamento confirmado para ${formattedDate}`,
      html,
      replyTo: 'contato@agendabeleza.com.br',
    });
  },

  /**
   * Email de lembrete (24h antes)
   */
  async sendAppointmentReminder(
    appointment: Appointment,
    clientEmail: string,
    clientName: string,
    serviceName: string,
    professionalName: string
  ): Promise<boolean> {
    const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
    const formattedTime = appointmentDate.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ff9800; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #e0e0e0; }
          .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #ff9800; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Lembrete: Seu Agendamento é Amanhã!</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${clientName}</strong>,</p>
            <p>Este é um lembrete do seu agendamento amanhã!</p>
            
            <div class="details">
              <h3>Detalhes</h3>
              <p><strong>Serviço:</strong> ${serviceName}</p>
              <p><strong>Profissional:</strong> ${professionalName}</p>
              <p><strong>Horário:</strong> ${formattedTime}</p>
            </div>

            <p>Confirmamos sua presença? Se precisar cancelar ou remarcar, avise-nos com antecedência.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Agenda Beleza. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.send({
      to: clientEmail,
      subject: `Lembrete: Agendamento amanhã às ${formattedTime}`,
      html,
    });
  },

  /**
   * Email de recibo de pagamento
   */
  async sendPaymentReceipt(
    clientEmail: string,
    clientName: string,
    serviceName: string,
    amount: number,
    paymentDate: Date,
    transactionId: string
  ): Promise<boolean> {
    const formattedAmount = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);

    const formattedDate = paymentDate.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4caf50; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #e0e0e0; }
          .receipt { background: white; padding: 15px; margin: 15px 0; border: 1px dashed #999; }
          .amount { font-size: 24px; font-weight: bold; color: #4caf50; margin: 15px 0; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💳 Recibo de Pagamento</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${clientName}</strong>,</p>
            <p>Obrigado pela sua confiança! Segue seu recibo de pagamento:</p>
            
            <div class="receipt">
              <p><strong>Serviço:</strong> ${serviceName}</p>
              <div class="amount">${formattedAmount}</div>
              <p><strong>Data:</strong> ${formattedDate}</p>
              <p><strong>ID da Transação:</strong> <code>${transactionId}</code></p>
            </div>

            <p style="color: #666; font-size: 14px;">
              Guarde este email como comprovante. Qualquer dúvida, entre em contato conosco.
            </p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Agenda Beleza. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.send({
      to: clientEmail,
      subject: `Recibo de pagamento - ${serviceName}`,
      html,
      replyTo: 'contato@agendabeleza.com.br',
    });
  },

  /**
   * Email de cancelamento de agendamento
   */
  async sendCancellationNotice(
    clientEmail: string,
    clientName: string,
    serviceName: string,
    appointmentDate: Date,
    refundAmount?: number
  ): Promise<boolean> {
    const formattedDate = appointmentDate.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const formattedTime = appointmentDate.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const refundText = refundAmount
      ? `<p>Um reembolso de <strong>${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(refundAmount)}</strong> será processado em 3-5 dias úteis.</p>`
      : '';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f44336; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #e0e0e0; }
          .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #f44336; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✗ Agendamento Cancelado</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${clientName}</strong>,</p>
            <p>Seu agendamento foi cancelado com sucesso.</p>
            
            <div class="details">
              <h3>Detalhes do Cancelamento</h3>
              <p><strong>Serviço:</strong> ${serviceName}</p>
              <p><strong>Data Original:</strong> ${formattedDate} às ${formattedTime}</p>
            </div>

            ${refundText}

            <p style="color: #666; font-size: 14px;">
              Se cancelou por engano, entre em contato conosco para reagendar.
            </p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Agenda Beleza. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.send({
      to: clientEmail,
      subject: `Agendamento cancelado: ${serviceName}`,
      html,
      replyTo: 'contato@agendabeleza.com.br',
    });
  },
};

export default EmailService;
