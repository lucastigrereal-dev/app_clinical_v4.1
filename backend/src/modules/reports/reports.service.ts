import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import PDFDocument from 'pdfkit';
import { Patient } from '../patients/entities/patient.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { PhotoAnalysis } from '../medical-ai/entities/photo-analysis.entity';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(PhotoAnalysis)
    private photoAnalysisRepository: Repository<PhotoAnalysis>,
  ) {}

  /**
   * Gera relatório completo do paciente em PDF
   */
  async generatePatientReport(patientId: string): Promise<Buffer> {
    this.logger.log(`📄 Generating patient report for ID: ${patientId}`);

    const patient = await this.patientRepository.findOne({ where: { id: patientId } });
    if (!patient) {
      throw new NotFoundException(`Patient ${patientId} not found`);
    }

    const appointments = await this.appointmentRepository.find({
      where: { patient: { id: patientId } },
      order: { scheduledDate: 'DESC' },
      take: 10,
    });

    const analyses = await this.photoAnalysisRepository.find({
      where: { patientId },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return this.createPatientPDF(patient, appointments, analyses);
  }

  /**
   * Gera relatório de análise de foto específica
   */
  async generateAnalysisReport(analysisId: string): Promise<Buffer> {
    this.logger.log(`📄 Generating analysis report for ID: ${analysisId}`);

    const analysis = await this.photoAnalysisRepository.findOne({ where: { id: analysisId } });
    if (!analysis) {
      throw new NotFoundException(`Analysis ${analysisId} not found`);
    }

    const patient = await this.patientRepository.findOne({
      where: { id: analysis.patientId },
    });

    return this.createAnalysisPDF(analysis, patient);
  }

  /**
   * Gera relatório de histórico de consultas
   */
  async generateAppointmentsReport(patientId: string): Promise<Buffer> {
    this.logger.log(`📄 Generating appointments report for patient: ${patientId}`);

    const patient = await this.patientRepository.findOne({ where: { id: patientId } });
    if (!patient) {
      throw new NotFoundException(`Patient ${patientId} not found`);
    }

    const appointments = await this.appointmentRepository.find({
      where: { patient: { id: patientId } },
      order: { scheduledDate: 'DESC' },
    });

    return this.createAppointmentsPDF(patient, appointments);
  }

  /**
   * Cria PDF de relatório do paciente
   */
  private createPatientPDF(patient: Patient, appointments: any[], analyses: any[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Header
      doc
        .fontSize(24)
        .fillColor('#667eea')
        .text('Clinic Companion', { align: 'center' })
        .fontSize(18)
        .fillColor('#333')
        .text('Relatório Completo do Paciente', { align: 'center' })
        .moveDown();

      // Patient Info
      doc.fontSize(14).fillColor('#667eea').text('Informações do Paciente', { underline: true });

      doc
        .fontSize(11)
        .fillColor('#333')
        .text(`Nome: ${patient.name}`)
        .text(`Email: ${patient.email}`)
        .text(`Telefone: ${patient.phone || 'N/A'}`)
        .text(`Data de Nascimento: ${patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('pt-BR') : 'N/A'}`)
        .text(`CPF: ${patient.cpf || 'N/A'}`)
        .moveDown();

      // Appointments Section
      doc.fontSize(14).fillColor('#667eea').text('Histórico de Consultas', { underline: true });

      if (appointments.length === 0) {
        doc.fontSize(11).fillColor('#777').text('Nenhuma consulta registrada.');
      } else {
        appointments.slice(0, 5).forEach((appointment, index) => {
          doc
            .fontSize(11)
            .fillColor('#333')
            .text(
              `${index + 1}. ${new Date(appointment.appointmentDate).toLocaleDateString('pt-BR')} - ${appointment.type} (${appointment.status})`,
            );
        });
      }
      doc.moveDown();

      // Analyses Section
      doc.fontSize(14).fillColor('#667eea').text('Análises de IA Recentes', { underline: true });

      if (analyses.length === 0) {
        doc.fontSize(11).fillColor('#777').text('Nenhuma análise registrada.');
      } else {
        analyses.slice(0, 5).forEach((analysis, index) => {
          doc
            .fontSize(11)
            .fillColor('#333')
            .text(
              `${index + 1}. ${new Date(analysis.createdAt).toLocaleDateString('pt-BR')} - Score: ${analysis.recoveryScore}/100 - Severidade: ${analysis.overallSeverity}`,
            );

          if (analysis.hasHematoma || analysis.hasEdema || analysis.hasInfection) {
            const complications = [];
            if (analysis.hasHematoma) complications.push('Hematoma');
            if (analysis.hasEdema) complications.push('Edema');
            if (analysis.hasInfection) complications.push('Infecção');
            doc.fontSize(10).fillColor('#d32f2f').text(`   Complicações: ${complications.join(', ')}`);
          }
        });
      }
      doc.moveDown();

      // Footer
      doc
        .fontSize(10)
        .fillColor('#777')
        .text(
          `Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`,
          { align: 'center' },
        )
        .text('© Clinic Companion - Todos os direitos reservados', { align: 'center' });

      doc.end();
    });
  }

  /**
   * Cria PDF de relatório de análise individual
   */
  private createAnalysisPDF(analysis: any, patient: Patient | null): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc
        .fontSize(24)
        .fillColor('#667eea')
        .text('Clinic Companion', { align: 'center' })
        .fontSize(18)
        .fillColor('#333')
        .text('Relatório de Análise de IA', { align: 'center' })
        .moveDown();

      // Patient Info
      if (patient) {
        doc
          .fontSize(12)
          .fillColor('#667eea')
          .text('Paciente:')
          .fontSize(11)
          .fillColor('#333')
          .text(patient.name)
          .moveDown();
      }

      // Analysis Info
      doc.fontSize(14).fillColor('#667eea').text('Detalhes da Análise', { underline: true });

      doc
        .fontSize(11)
        .fillColor('#333')
        .text(`ID da Análise: ${analysis.id}`)
        .text(`Data: ${new Date(analysis.createdAt).toLocaleString('pt-BR')}`)
        .text(`Procedimento: ${analysis.procedureType}`)
        .text(`Dias Pós-Operatório: ${analysis.daysPostOp}`)
        .moveDown();

      // Scores
      doc.fontSize(14).fillColor('#667eea').text('Pontuações', { underline: true });

      const scoreColor = analysis.recoveryScore >= 80 ? '#4CAF50' : analysis.recoveryScore >= 60 ? '#FFA726' : '#E53935';

      doc
        .fontSize(11)
        .fillColor(scoreColor)
        .text(`Recovery Score: ${analysis.recoveryScore}/100`)
        .fillColor('#333')
        .text(`Confiança da IA: ${analysis.confidenceLevel}%`)
        .text(`Severidade Geral: ${analysis.overallSeverity.toUpperCase()}`)
        .moveDown();

      // Complications
      doc.fontSize(14).fillColor('#667eea').text('Complicações Detectadas', { underline: true });

      const complications = [];
      if (analysis.hasHematoma) complications.push(`Hematoma (Severidade: ${analysis.hematomaSeverity}/10)`);
      if (analysis.hasEdema) complications.push(`Edema (Severidade: ${analysis.edemaSeverity}/10)`);
      if (analysis.hasInfection) complications.push(`Infecção (Severidade: ${analysis.infectionSeverity}/10)`);
      if (analysis.hasAsymmetry) complications.push(`Assimetria (Severidade: ${analysis.asymmetrySeverity}/10)`);
      if (analysis.hasDehiscence) complications.push('Deiscência');
      if (analysis.hasNecrosis) complications.push('Necrose');
      if (analysis.hasSeroma) complications.push('Seroma');

      if (complications.length === 0) {
        doc.fontSize(11).fillColor('#4CAF50').text('✓ Nenhuma complicação detectada');
      } else {
        complications.forEach((comp) => {
          doc.fontSize(11).fillColor('#d32f2f').text(`• ${comp}`);
        });
      }
      doc.moveDown();

      // Recommendations
      if (analysis.recommendations && analysis.recommendations.items) {
        doc.fontSize(14).fillColor('#667eea').text('Recomendações', { underline: true });

        analysis.recommendations.items.forEach((rec: string) => {
          doc.fontSize(11).fillColor('#333').text(`• ${rec}`);
        });
        doc.moveDown();
      }

      // Review Status
      doc.fontSize(14).fillColor('#667eea').text('Status de Revisão', { underline: true });

      if (analysis.requiresDoctorReview) {
        doc.fontSize(11).fillColor('#FFA726').text('⚠ Aguardando revisão médica');
      } else if (analysis.reviewedAt) {
        doc
          .fontSize(11)
          .fillColor('#4CAF50')
          .text(`✓ Revisado em: ${new Date(analysis.reviewedAt).toLocaleString('pt-BR')}`);
        if (analysis.doctorNotes) {
          doc.fillColor('#333').text(`Notas do médico: ${analysis.doctorNotes}`);
        }
      } else {
        doc.fontSize(11).fillColor('#4CAF50').text('✓ Não requer revisão médica');
      }

      doc.moveDown();

      // Footer
      doc
        .fontSize(10)
        .fillColor('#777')
        .text(`Relatório gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' })
        .text('© Clinic Companion - Todos os direitos reservados', { align: 'center' });

      doc.end();
    });
  }

  /**
   * Cria PDF de histórico de consultas
   */
  private createAppointmentsPDF(patient: Patient, appointments: any[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc
        .fontSize(24)
        .fillColor('#667eea')
        .text('Clinic Companion', { align: 'center' })
        .fontSize(18)
        .fillColor('#333')
        .text('Histórico de Consultas', { align: 'center' })
        .moveDown();

      // Patient
      doc
        .fontSize(12)
        .fillColor('#667eea')
        .text('Paciente:')
        .fontSize(11)
        .fillColor('#333')
        .text(patient.name)
        .moveDown();

      // Appointments
      doc.fontSize(14).fillColor('#667eea').text('Consultas', { underline: true });

      if (appointments.length === 0) {
        doc.fontSize(11).fillColor('#777').text('Nenhuma consulta registrada.');
      } else {
        appointments.forEach((apt, index) => {
          const statusColor =
            apt.status === 'completed' ? '#4CAF50' :
            apt.status === 'cancelled' ? '#E53935' :
            '#FFA726';

          doc
            .fontSize(11)
            .fillColor('#333')
            .text(
              `${index + 1}. ${new Date(apt.appointmentDate).toLocaleDateString('pt-BR')} - ${apt.type}`,
            )
            .fillColor(statusColor)
            .text(`   Status: ${apt.status}`, { continued: false });

          if (apt.notes) {
            doc.fillColor('#777').text(`   Notas: ${apt.notes}`);
          }

          doc.moveDown(0.5);
        });
      }

      // Footer
      doc
        .fontSize(10)
        .fillColor('#777')
        .text(`Total de consultas: ${appointments.length}`)
        .text(`Relatório gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' })
        .text('© Clinic Companion - Todos os direitos reservados', { align: 'center' });

      doc.end();
    });
  }
}
