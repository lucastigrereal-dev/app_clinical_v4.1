import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

/**
 * DTO de resposta para alertas
 * Garante que apenas dados seguros são expostos na API
 */
@Exclude()
export class AlertResponseDto {
  @Expose()
  @ApiProperty({ example: 1 })
  id: number;

  @Expose()
  @ApiProperty({ example: 'Rinoplastia' })
  procedureName: string;

  @Expose()
  @ApiProperty({ example: 'Edema excessivo após 7 dias' })
  symptom: string;

  @Expose()
  @ApiProperty({ example: 'critical', enum: ['critical', 'attention', 'info'] })
  severity: string;

  @Expose()
  @ApiProperty({ example: 'Procure atendimento médico imediatamente' })
  recommendation: string;

  @Expose()
  @ApiProperty({ example: 7 })
  daysRange: number;

  @Expose()
  @ApiProperty({ example: '2025-01-15T10:30:00Z' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ example: '2025-01-15T10:30:00Z' })
  updatedAt: Date;

  constructor(partial: Partial<AlertResponseDto>) {
    Object.assign(this, partial);
  }
}

/**
 * DTO de estatísticas de alertas
 */
export class AlertStatsDto {
  @ApiProperty({ example: 250 })
  total: number;

  @ApiProperty({ example: 72 })
  critical: number;

  @ApiProperty({ example: 100 })
  attention: number;

  @ApiProperty({ example: 78 })
  info: number;
}
