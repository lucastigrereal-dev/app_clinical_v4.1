import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Protocol } from './protocol.entity';
import { QueryProtocolDto } from './dto/query-protocol.dto';
import * as fs from 'fs';
import * as path from 'path';

export interface MedicalProtocol {
  procedureName: string;
  procedureId: string;
  category: string;
  duration: string;
  totalDays: number;
  totalMilestones: number;
  metadata: {
    averageRecoveryTime: string;
    riskLevel: string;
    patientSatisfaction: number;
    complicationRate: number;
    tags: string[];
    searchKeywords: string[];
  };
  milestones: any[];
}

@Injectable()
export class ProtocolsService {
  private readonly logger = new Logger(ProtocolsService.name);
  private medicalProtocols: MedicalProtocol[] | null = null;

  constructor(
    @InjectRepository(Protocol)
    private protocolsRepository: Repository<Protocol>,
  ) {
    this.loadMedicalProtocols();
  }

  /**
   * Carrega protocolos médicos do arquivo JSON
   */
  private loadMedicalProtocols(): void {
    try {
      const filePath = path.join(__dirname, '../../protocols/data/medical-protocols.json');
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      this.medicalProtocols = JSON.parse(fileContent);
      this.logger.log(`✅ Loaded ${this.medicalProtocols.length} medical protocols`);
    } catch (error) {
      this.logger.error('Failed to load medical protocols:', error);
      this.medicalProtocols = [];
    }
  }

  /**
   * Lista todos os protocolos com paginação
   * MVP: Limita a 50 itens por página para prevenir queries excessivas
   */
  async findAll(query: QueryProtocolDto): Promise<Protocol[]> {
    const limit = Math.min(query.limit || 20, 50); // Máximo de 50
    const page = query.page || 1;
    const skip = (page - 1) * limit;

    return this.protocolsRepository.find({
      order: { procedure_name: 'ASC' },
      take: limit,
      skip,
    });
  }

  /**
   * Busca protocolos por procedimento
   * MVP: Limita a 50 resultados
   */
  async findByProcedure(procedureName: string): Promise<Protocol[]> {
    return this.protocolsRepository.find({
      where: { procedure_name: procedureName },
      take: 50, // Limite fixo de segurança
    });
  }

  /**
   * Busca protocolos por tipo
   * MVP: Limita a 50 resultados
   */
  async findByType(type: string): Promise<Protocol[]> {
    return this.protocolsRepository.find({
      where: { type },
      take: 50, // Limite fixo de segurança
    });
  }

  /**
   * Retorna timeline unificada de cuidados
   * MVP: Agrega todos os protocolos em ordem cronológica
   */
  async getTimeline(procedureName: string) {
    const protocols = await this.findByProcedure(procedureName);

    // Agregar todos os protocolos em uma timeline unificada
    const timeline = protocols.reduce((acc, protocol) => {
      if (protocol.protocol_data && protocol.protocol_data.timeline) {
        return [...acc, ...protocol.protocol_data.timeline];
      }
      return acc;
    }, []);

    return {
      procedure: procedureName,
      timeline: timeline.sort((a, b) => (a.day || 0) - (b.day || 0)),
    };
  }

  /**
   * Lista todos os procedimentos médicos disponíveis
   */
  getMedicalProcedures() {
    if (!this.medicalProtocols) {
      return [];
    }

    return this.medicalProtocols.map(protocol => ({
      name: protocol.procedureName,
      id: protocol.procedureId,
      category: protocol.category,
      totalMilestones: protocol.totalMilestones,
      totalDays: protocol.totalDays,
      metadata: protocol.metadata,
    }));
  }

  /**
   * Busca protocolo médico por nome do procedimento
   */
  getMedicalProtocolByProcedure(procedureName: string): MedicalProtocol {
    if (!this.medicalProtocols) {
      throw new NotFoundException('Medical protocols not loaded');
    }

    const protocol = this.medicalProtocols.find(
      p => p.procedureName.toLowerCase() === procedureName.toLowerCase() ||
           p.procedureId.toLowerCase() === procedureName.toLowerCase()
    );

    if (!protocol) {
      throw new NotFoundException(`Medical protocol not found for: ${procedureName}`);
    }

    return protocol;
  }

  /**
   * Busca milestone específico por dia
   */
  getMilestoneByDay(procedureName: string, dayOffset: number) {
    const protocol = this.getMedicalProtocolByProcedure(procedureName);

    const milestones = protocol.milestones.filter(m => m.dayOffset === dayOffset);

    if (milestones.length === 0) {
      throw new NotFoundException(`No milestone found for day ${dayOffset}`);
    }

    return milestones;
  }
}
