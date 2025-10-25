import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

/**
 * DTO de resposta para procedimentos
 * Garante que apenas dados seguros são expostos na API
 */
@Exclude()
export class ProcedureResponseDto {
  @Expose()
  @ApiProperty({ example: 1 })
  id: number;

  @Expose()
  @ApiProperty({ example: 'Rinoplastia' })
  name: string;

  @Expose()
  @ApiPropertyOptional({ example: 'Cirurgia de remodelação do nariz' })
  description?: string;

  @Expose()
  @ApiProperty({ example: 'facial' })
  category: string;

  @Expose()
  @ApiProperty({ example: 'nariz' })
  bodyArea: string;

  @Expose()
  @ApiPropertyOptional({ example: 30 })
  recoveryDays?: number;

  @Expose()
  @ApiPropertyOptional({ example: 'Evite exposição solar por 30 dias' })
  careInstructions?: string;

  @Expose()
  @ApiPropertyOptional({ example: 'Edema excessivo, sangramento' })
  warningSymptoms?: string;

  @Expose()
  @ApiProperty({ example: 150 })
  usageCount: number;

  @Expose()
  @ApiProperty({ example: '2025-01-15T10:30:00Z' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ example: '2025-01-15T10:30:00Z' })
  updatedAt: Date;

  constructor(partial: Partial<ProcedureResponseDto>) {
    Object.assign(this, partial);
  }
}

/**
 * DTO de resposta paginada
 */
export class PaginatedProcedureResponseDto {
  @ApiProperty({ type: [ProcedureResponseDto] })
  data: ProcedureResponseDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 50 })
  total: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}
