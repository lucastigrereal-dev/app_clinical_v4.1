import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { PhotoAnalysis } from '../medical-ai/entities/photo-analysis.entity';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,

    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,

    @InjectRepository(PhotoAnalysis)
    private readonly photoAnalysisRepository: Repository<PhotoAnalysis>,
  ) {}

  /**
   * Dashboard Overview
   */
  async getDashboardOverview() {
    this.logger.log('Getting dashboard overview analytics');

    const [totalUsers, totalPatients, totalAppointments, totalAnalyses] =
      await Promise.all([
        this.userRepository.count(),
        this.patientRepository.count(),
        this.appointmentRepository.count(),
        this.photoAnalysisRepository.count(),
      ]);

    // Appointments por status
    const appointmentsByStatus = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .select('appointment.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('appointment.status')
      .getRawMany();

    // Medical AI analyses por mês (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const analysesByMonth = await this.photoAnalysisRepository
      .createQueryBuilder('analysis')
      .select('DATE_TRUNC(\'month\', analysis.createdAt)', 'month')
      .addSelect('COUNT(*)', 'count')
      .where('analysis.createdAt >= :sixMonthsAgo', { sixMonthsAgo })
      .groupBy('DATE_TRUNC(\'month\', analysis.createdAt)')
      .orderBy('month', 'ASC')
      .getRawMany();

    return {
      overview: {
        totalUsers,
        totalPatients,
        totalAppointments,
        totalAnalyses,
      },
      appointmentsByStatus,
      analysesByMonth,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Medical AI Analytics
   */
  async getMedicalAIAnalytics() {
    this.logger.log('Getting Medical AI analytics');

    // Total de análises
    const totalAnalyses = await this.photoAnalysisRepository.count();

    // Análises por status
    const analysesByStatus = await this.photoAnalysisRepository
      .createQueryBuilder('analysis')
      .select('analysis.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('analysis.status')
      .getRawMany();

    // Análises por tipo de procedimento
    const byProcedureType = await this.photoAnalysisRepository
      .createQueryBuilder('analysis')
      .select('analysis.procedureType', 'procedureType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('analysis.procedureType')
      .getRawMany();

    return {
      totalAnalyses,
      analysesByStatus,
      byProcedureType,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Patient Analytics
   */
  async getPatientAnalytics() {
    this.logger.log('Getting patient analytics');

    const totalPatients = await this.patientRepository.count();

    // Pacientes por gênero
    const byGender = await this.patientRepository
      .createQueryBuilder('patient')
      .select('patient.gender', 'gender')
      .addSelect('COUNT(*)', 'count')
      .groupBy('patient.gender')
      .getRawMany();

    // Pacientes por faixa etária
    const byAgeGroup = await this.patientRepository
      .createQueryBuilder('patient')
      .select(
        `CASE
          WHEN EXTRACT(YEAR FROM AGE(patient.dateOfBirth)) < 20 THEN '< 20'
          WHEN EXTRACT(YEAR FROM AGE(patient.dateOfBirth)) BETWEEN 20 AND 29 THEN '20-29'
          WHEN EXTRACT(YEAR FROM AGE(patient.dateOfBirth)) BETWEEN 30 AND 39 THEN '30-39'
          WHEN EXTRACT(YEAR FROM AGE(patient.dateOfBirth)) BETWEEN 40 AND 49 THEN '40-49'
          WHEN EXTRACT(YEAR FROM AGE(patient.dateOfBirth)) BETWEEN 50 AND 59 THEN '50-59'
          ELSE '60+'
        END`,
        'ageGroup',
      )
      .addSelect('COUNT(*)', 'count')
      .groupBy('ageGroup')
      .orderBy('ageGroup', 'ASC')
      .getRawMany();

    // Novos pacientes nos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newPatientsLast30Days = await this.patientRepository.count({
      where: {
        createdAt: thirtyDaysAgo as any, // Usando any para simplificar
      },
    });

    return {
      totalPatients,
      byGender,
      byAgeGroup,
      newPatientsLast30Days,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Appointments Analytics
   */
  async getAppointmentsAnalytics() {
    this.logger.log('Getting appointments analytics');

    const totalAppointments = await this.appointmentRepository.count();

    // Appointments por status
    const byStatus = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .select('appointment.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('appointment.status')
      .getRawMany();

    // Appointments por tipo
    const byType = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .select('appointment.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('appointment.type')
      .getRawMany();

    // Appointments agendados para próximos 7 dias
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const upcomingAppointments = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .where('appointment.scheduledDate BETWEEN :now AND :sevenDaysFromNow', {
        now: new Date(),
        sevenDaysFromNow,
      })
      .andWhere('appointment.status = :status', { status: 'scheduled' })
      .getCount();

    return {
      totalAppointments,
      byStatus,
      byType,
      upcomingAppointments,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * User Analytics
   */
  async getUserAnalytics() {
    this.logger.log('Getting user analytics');

    const totalUsers = await this.userRepository.count();

    // Users por role
    const byRole = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    // Active users (último login nos últimos 7 dias)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeUsers = await this.userRepository
      .createQueryBuilder('user')
      .where('user.lastLogin >= :sevenDaysAgo', { sevenDaysAgo })
      .getCount();

    return {
      totalUsers,
      byRole,
      activeUsers,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generate Complete Report
   */
  async generateCompleteReport() {
    this.logger.log('Generating complete analytics report');

    const [
      dashboard,
      medicalAI,
      patients,
      appointments,
      users,
    ] = await Promise.all([
      this.getDashboardOverview(),
      this.getMedicalAIAnalytics(),
      this.getPatientAnalytics(),
      this.getAppointmentsAnalytics(),
      this.getUserAnalytics(),
    ]);

    return {
      dashboard,
      medicalAI,
      patients,
      appointments,
      users,
      reportGeneratedAt: new Date().toISOString(),
    };
  }
}
