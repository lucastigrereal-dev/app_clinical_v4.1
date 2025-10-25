import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PhotoAnalysis } from '../entities/photo-analysis.entity';

export interface AnalysisResult {
  healing_score: number;
  risk_factors: string[];
  recommendations: string[];
  complications_detected: boolean;
  ai_confidence: number;
}

@Injectable()
export class MedicalAIService {
  private readonly logger = new Logger(MedicalAIService.name);

  constructor(
    @InjectRepository(PhotoAnalysis)
    private photoAnalysisRepository: Repository<PhotoAnalysis>,
  ) {}

  /**
   * Analisa uma foto pós-operatória e detecta possíveis complicações
   * Versão MVP: usa algoritmos baseados em regras (Rule-based AI)
   */
  async analyzePhoto(
    patientId: string,
    photoUrl: string,
    procedureType?: string,
  ): Promise<PhotoAnalysis> {
    this.logger.log(`Analisando foto para paciente ${patientId}`);

    // Simula análise de imagem (MVP: regras simples)
    const analysisResult = this.performMVPAnalysis(photoUrl, procedureType);

    // Map analysis result to new entity structure
    const hasComplications = analysisResult.complications_detected;
    const hasSevereComplications = hasComplications && analysisResult.healing_score < 60;

    // Cria registro de análise com nova estrutura
    const analysis = this.photoAnalysisRepository.create({
      patientId,
      photoUrl: photoUrl || 'https://example.com/test.jpg',
      daysPostOp: 0, // Default value - should be provided by client in real scenario
      procedureType: procedureType || 'lipoaspiracao',

      // AI Analysis Results
      recoveryScore: analysisResult.healing_score,
      confidenceLevel: analysisResult.ai_confidence,
      overallSeverity: hasSevereComplications ? 'high' : hasComplications ? 'medium' : 'none',

      // Complications (simulated detection)
      hasHematoma: hasComplications && Math.random() > 0.5,
      hematomaSeverity: hasComplications && Math.random() > 0.5 ? Math.floor(Math.random() * 5) + 3 : 0,
      hasEdema: hasComplications && Math.random() > 0.5,
      edemaSeverity: hasComplications && Math.random() > 0.5 ? Math.floor(Math.random() * 5) + 3 : 0,
      hasInfection: false,
      infectionSeverity: 0,
      hasAsymmetry: hasComplications && Math.random() > 0.7,
      asymmetrySeverity: hasComplications && Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 2 : 0,
      hasDehiscence: false,
      hasNecrosis: false,
      hasSeroma: false,

      // Metadata (store original result as JSONB)
      detectedFeatures: { risk_factors: analysisResult.risk_factors },
      recommendations: { items: analysisResult.recommendations },
      requiresDoctorReview: analysisResult.complications_detected,
      alertSent: false,
      aiNotes: `AI Confidence: ${analysisResult.ai_confidence}%. Healing Score: ${analysisResult.healing_score}`,
      doctorNotes: null,
      reviewedAt: null,
      reviewedBy: null,
    });

    return await this.photoAnalysisRepository.save(analysis);
  }

  /**
   * Algoritmo MVP de análise baseado em regras simples
   */
  private performMVPAnalysis(
    photoUrl: string,
    procedureType?: string,
  ): AnalysisResult {
    // Simula análise básica (em produção real: Computer Vision)
    const hasComplications = Math.random() > 0.7; // 30% de chance de detectar algo
    const healingScore = hasComplications
      ? Math.floor(Math.random() * 30) + 40  // 40-70
      : Math.floor(Math.random() * 30) + 70; // 70-100

    const riskFactors: string[] = [];
    const recommendations: string[] = [];

    if (hasComplications) {
      // Simula detecção de fatores de risco
      const possibleRisks = [
        'Edema moderado detectado',
        'Possível hematoma na região',
        'Assimetria temporária observada',
        'Sinais de inflamação',
      ];

      const numRisks = Math.floor(Math.random() * 2) + 1; // 1-2 riscos
      for (let i = 0; i < numRisks; i++) {
        const randomRisk = possibleRisks[Math.floor(Math.random() * possibleRisks.length)];
        if (!riskFactors.includes(randomRisk)) {
          riskFactors.push(randomRisk);
        }
      }

      // Recomendações para casos com complicações
      recommendations.push('Agende consulta de acompanhamento com seu médico');
      recommendations.push('Aplicar compressas frias conforme orientação');
      recommendations.push('Evitar esforço físico intenso');
      recommendations.push('Manter região limpa e higienizada');
    } else {
      // Recuperação normal
      riskFactors.push('Nenhum fator de risco identificado');
      recommendations.push('Recuperação progredindo conforme esperado');
      recommendations.push('Continue seguindo as orientações médicas');
      recommendations.push('Mantenha os cuidados com higiene');
    }

    const confidence = Math.floor(Math.random() * 20) + 75; // 75-95%

    return {
      healing_score: healingScore,
      risk_factors: riskFactors,
      recommendations,
      complications_detected: hasComplications,
      ai_confidence: confidence,
    };
  }

  /**
   * Busca análises de um paciente
   */
  async getPatientAnalyses(patientId: string): Promise<PhotoAnalysis[]> {
    return this.photoAnalysisRepository.find({
      where: { patientId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Busca análise por ID
   */
  async getAnalysisById(id: string): Promise<PhotoAnalysis | null> {
    return this.photoAnalysisRepository.findOne({
      where: { id },
    });
  }

  /**
   * Busca todas as análises (com paginação)
   */
  async getAllAnalyses(
    skip = 0,
    take = 20,
  ): Promise<{ data: PhotoAnalysis[]; total: number }> {
    const [data, total] = await this.photoAnalysisRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take,
    });

    return { data, total };
  }

  /**
   * Busca análises que precisam de revisão
   */
  async getAnalysesNeedingReview(): Promise<PhotoAnalysis[]> {
    return this.photoAnalysisRepository.find({
      where: { requiresDoctorReview: true, reviewedAt: null as any },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Atualiza status da análise (marca como revisada)
   */
  async updateAnalysisStatus(
    id: string,
    doctorNotes: string,
  ): Promise<PhotoAnalysis> {
    const analysis = await this.photoAnalysisRepository.findOne({
      where: { id },
    });

    if (!analysis) {
      throw new Error('Análise não encontrada');
    }

    analysis.requiresDoctorReview = false;
    analysis.reviewedAt = new Date();
    analysis.doctorNotes = doctorNotes;
    return this.photoAnalysisRepository.save(analysis);
  }
}
