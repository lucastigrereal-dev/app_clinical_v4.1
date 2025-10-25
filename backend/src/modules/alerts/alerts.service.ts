import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from './alert.entity';
import { QueryAlertDto } from './dto/query-alert.dto';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Alert)
    private alertsRepository: Repository<Alert>,
  ) {}

  /**
   * Lista todos os alertas com paginação
   * MVP: Limita a 50 itens por página para prevenir queries excessivas
   */
  async getAllAlerts(query: QueryAlertDto): Promise<Alert[]> {
    const limit = Math.min(query.limit || 20, 50); // Máximo de 50
    const page = query.page || 1;
    const skip = (page - 1) * limit;

    return this.alertsRepository.find({
      order: {
        procedure_name: 'ASC',
        severity: 'ASC',
      },
      take: limit,
      skip,
    });
  }

  /**
   * Busca alertas por procedimento
   * MVP: Limita a 50 resultados
   */
  async findByProcedure(procedureName: string): Promise<Alert[]> {
    return this.alertsRepository.find({
      where: { procedure_name: procedureName },
      order: {
        severity: 'ASC', // critical vem primeiro (alfabeticamente)
      },
      take: 50, // Limite fixo de segurança
    });
  }

  /**
   * Busca alertas críticos de um procedimento
   * MVP: Limita a 50 resultados
   */
  async findCritical(procedureName: string): Promise<Alert[]> {
    return this.alertsRepository.find({
      where: {
        procedure_name: procedureName,
        severity: 'critical',
      },
      take: 50, // Limite fixo de segurança
    });
  }

  /**
   * Busca alertas por severidade
   * MVP: Limita a 50 resultados
   */
  async findBySeverity(severity: string): Promise<Alert[]> {
    return this.alertsRepository.find({
      where: { severity },
      take: 50, // Limite fixo de segurança
    });
  }

  /**
   * Retorna estatísticas de alertas
   * MVP: Count direto no banco para performance
   */
  async getAlertStats() {
    const [total, critical, attention, info] = await Promise.all([
      this.alertsRepository.count(),
      this.alertsRepository.count({ where: { severity: 'critical' } }),
      this.alertsRepository.count({ where: { severity: 'attention' } }),
      this.alertsRepository.count({ where: { severity: 'info' } }),
    ]);

    return {
      total,
      critical,
      attention,
      info,
    };
  }
}
