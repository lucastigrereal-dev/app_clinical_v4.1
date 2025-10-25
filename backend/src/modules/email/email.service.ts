import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: any[];
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Em produção, use SMTP real (Gmail, SendGrid, etc)
    // Para desenvolvimento, use Ethereal Email (testing)
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || 'ethereal.user@ethereal.email',
        pass: process.env.SMTP_PASS || 'ethereal-password',
      },
    });

    this.logger.log('📧 Email service initialized');
  }

  /**
   * Envia um email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || '"Clinic Companion" <noreply@clinic.com>',
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`✅ Email sent: ${info.messageId}`);

      // Para Ethereal, log preview URL
      if (process.env.NODE_ENV === 'development') {
        this.logger.log(`📧 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }

      return true;
    } catch (error) {
      this.logger.error(`❌ Email send failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Email de boas-vindas para novo paciente
   */
  async sendWelcomeEmail(patientName: string, email: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 Bem-vindo ao Clinic Companion!</h1>
          </div>
          <div class="content">
            <h2>Olá, ${patientName}!</h2>
            <p>É um prazer tê-lo(a) conosco. Estamos aqui para acompanhar sua jornada de recuperação com o melhor cuidado possível.</p>

            <h3>O que você pode fazer:</h3>
            <ul>
              <li>📸 Enviar fotos do seu pós-operatório</li>
              <li>🤖 Receber análises de IA em tempo real</li>
              <li>📅 Agendar consultas</li>
              <li>💬 Suporte emocional personalizado</li>
              <li>📊 Acompanhar seu progresso</li>
            </ul>

            <p>Nossa equipe está disponível 24/7 para ajudá-lo(a).</p>

            <a href="http://localhost:3000" class="button">Acessar Plataforma</a>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Clinic Companion. Todos os direitos reservados.</p>
            <p>Se você não criou esta conta, por favor ignore este email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: '🏥 Bem-vindo ao Clinic Companion!',
      html,
    });
  }

  /**
   * Lembrete de consulta
   */
  async sendAppointmentReminder(
    patientEmail: string,
    patientName: string,
    appointmentDate: Date,
    doctorName: string,
  ): Promise<boolean> {
    const formattedDate = appointmentDate.toLocaleDateString('pt-BR', {
      weekday: 'long',
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
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .appointment-box { background: white; border-left: 4px solid #4CAF50; padding: 20px; margin: 20px 0; }
          .important { color: #d32f2f; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Lembrete de Consulta</h1>
          </div>
          <div class="content">
            <h2>Olá, ${patientName}!</h2>
            <p>Este é um lembrete da sua consulta agendada:</p>

            <div class="appointment-box">
              <p><strong>📅 Data e Hora:</strong> ${formattedDate}</p>
              <p><strong>👨‍⚕️ Médico:</strong> Dr(a). ${doctorName}</p>
            </div>

            <p class="important">⚠️ Por favor, chegue com 15 minutos de antecedência.</p>

            <h3>Recomendações:</h3>
            <ul>
              <li>Traga seus documentos pessoais</li>
              <li>Liste suas dúvidas e preocupações</li>
              <li>Traga exames anteriores (se houver)</li>
            </ul>

            <p>Se precisar reagendar, entre em contato conosco o quanto antes.</p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #777; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Clinic Companion</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: patientEmail,
      subject: `📅 Lembrete: Consulta em ${appointmentDate.toLocaleDateString('pt-BR')}`,
      html,
    });
  }

  /**
   * Alerta de análise de IA detectou complicação
   */
  async sendAnalysisAlert(
    patientEmail: string,
    patientName: string,
    analysisId: string,
    severity: string,
    findings: string[],
  ): Promise<boolean> {
    const severityColors = {
      low: '#FFA726',
      medium: '#FF7043',
      high: '#E53935',
      critical: '#B71C1C',
    };

    const color = severityColors[severity.toLowerCase()] || '#FF7043';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${color}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert-box { background: white; border-left: 4px solid ${color}; padding: 20px; margin: 20px 0; }
          .findings { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Alerta de Análise de IA</h1>
          </div>
          <div class="content">
            <h2>Olá, ${patientName}!</h2>
            <p>Nossa análise de IA detectou alguns pontos que requerem atenção:</p>

            <div class="alert-box">
              <p><strong>🔍 ID da Análise:</strong> ${analysisId}</p>
              <p><strong>⚠️ Severidade:</strong> ${severity.toUpperCase()}</p>
            </div>

            <div class="findings">
              <h3>Achados:</h3>
              <ul>
                ${findings.map((finding) => `<li>${finding}</li>`).join('')}
              </ul>
            </div>

            <p><strong>⚕️ Próximos Passos:</strong></p>
            <ul>
              <li>Nossa equipe médica foi notificada</li>
              <li>Você receberá contato em breve</li>
              <li>Mantenha os cuidados recomendados</li>
              <li>Em caso de urgência, procure atendimento imediato</li>
            </ul>

            <p>Não se preocupe - estamos monitorando sua recuperação de perto.</p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #777; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Clinic Companion</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: patientEmail,
      subject: `⚠️ Alerta: Análise de IA - Severidade ${severity.toUpperCase()}`,
      html,
    });
  }

  /**
   * Confirmar agendamento de consulta
   */
  async sendAppointmentConfirmation(
    patientEmail: string,
    patientName: string,
    appointmentDate: Date,
    doctorName: string,
    appointmentType: string,
  ): Promise<boolean> {
    const formattedDate = appointmentDate.toLocaleDateString('pt-BR', {
      weekday: 'long',
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
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2196F3; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .confirmation-box { background: white; border: 2px solid #4CAF50; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .checkmark { color: #4CAF50; font-size: 48px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="checkmark">✓</div>
            <h1>Consulta Confirmada!</h1>
          </div>
          <div class="content">
            <h2>Olá, ${patientName}!</h2>
            <p>Sua consulta foi confirmada com sucesso:</p>

            <div class="confirmation-box">
              <p><strong>📅 Data e Hora:</strong> ${formattedDate}</p>
              <p><strong>👨‍⚕️ Médico:</strong> Dr(a). ${doctorName}</p>
              <p><strong>🏥 Tipo:</strong> ${appointmentType}</p>
            </div>

            <p>Você receberá um lembrete antes da consulta.</p>
            <p>Aguardamos você!</p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #777; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Clinic Companion</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: patientEmail,
      subject: '✓ Consulta Confirmada - Clinic Companion',
      html,
    });
  }
}
