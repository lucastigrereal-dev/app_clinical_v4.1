import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('alerts')
export class Alert {
  @ApiProperty({ example: 1, description: 'ID único do alerta' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Lipoaspiração', description: 'Nome do procedimento' })
  @Column()
  procedure_name: string;

  @ApiProperty({ example: 'critical', description: 'Severidade: critical, attention, info' })
  @Column()
  severity: string;

  @ApiProperty({ example: 'Dor torácica súbita ou falta de ar', description: 'Sinal de alerta em português' })
  @Column('text')
  alert_sign_ptbr: string;

  @ApiProperty({ example: 'SAMU 192 imediatamente', description: 'Ação recomendada em português' })
  @Column('text')
  recommended_action_ptbr: string;

  @ApiProperty({ example: 'SBCP - Diretrizes|https://sbcp.org.br', description: 'Referências das fontes' })
  @Column('text')
  source_refs: string;

  @ApiProperty({ example: '2025-08', description: 'Data da última revisão (YYYY-MM)' })
  @Column()
  last_reviewed: string;

  @CreateDateColumn()
  created_at: Date;
}
