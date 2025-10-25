import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { EmailService } from '../../email/email.service';

export interface EmailJob {
  type: 'welcome' | 'appointment_reminder' | 'appointment_confirmation' | 'analysis_alert' | 'custom';
  data: any;
}

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailService: EmailService) {}

  @Process('send-welcome')
  async handleWelcomeEmail(job: Job<EmailJob>) {
    this.logger.log(`📧 Processing welcome email job: ${job.id}`);

    const { patientName, email } = job.data.data;

    try {
      await this.emailService.sendWelcomeEmail(patientName, email);
      this.logger.log(`✅ Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send welcome email: ${error.message}`);
      throw error; // Bull will retry
    }
  }

  @Process('send-appointment-reminder')
  async handleAppointmentReminder(job: Job<EmailJob>) {
    this.logger.log(`📧 Processing appointment reminder job: ${job.id}`);

    const { patientEmail, patientName, appointmentDate, doctorName } = job.data.data;

    try {
      await this.emailService.sendAppointmentReminder(
        patientEmail,
        patientName,
        new Date(appointmentDate),
        doctorName,
      );
      this.logger.log(`✅ Appointment reminder sent to ${patientEmail}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send appointment reminder: ${error.message}`);
      throw error;
    }
  }

  @Process('send-appointment-confirmation')
  async handleAppointmentConfirmation(job: Job<EmailJob>) {
    this.logger.log(`📧 Processing appointment confirmation job: ${job.id}`);

    const { patientEmail, patientName, appointmentDate, doctorName, appointmentType } =
      job.data.data;

    try {
      await this.emailService.sendAppointmentConfirmation(
        patientEmail,
        patientName,
        new Date(appointmentDate),
        doctorName,
        appointmentType,
      );
      this.logger.log(`✅ Appointment confirmation sent to ${patientEmail}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send appointment confirmation: ${error.message}`);
      throw error;
    }
  }

  @Process('send-analysis-alert')
  async handleAnalysisAlert(job: Job<EmailJob>) {
    this.logger.log(`📧 Processing analysis alert job: ${job.id}`);

    const { patientEmail, patientName, analysisId, severity, findings } = job.data.data;

    try {
      await this.emailService.sendAnalysisAlert(
        patientEmail,
        patientName,
        analysisId,
        severity,
        findings,
      );
      this.logger.log(`✅ Analysis alert sent to ${patientEmail}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send analysis alert: ${error.message}`);
      throw error;
    }
  }

  @Process('send-custom')
  async handleCustomEmail(job: Job<EmailJob>) {
    this.logger.log(`📧 Processing custom email job: ${job.id}`);

    const { to, subject, html, text } = job.data.data;

    try {
      await this.emailService.sendEmail({ to, subject, html, text });
      this.logger.log(`✅ Custom email sent to ${to}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send custom email: ${error.message}`);
      throw error;
    }
  }
}
