import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

/**
 * DTO de resposta para protocolos
 * Garante que apenas dados seguros são expostos na API
 */
@Exclude()
export class ProtocolResponseDto {
  @Expose()
  @ApiProperty({ example: 1 })
  id: number;

  @Expose()
  @ApiProperty({ example: 'Rinoplastia' })
  procedureName: string;

  @Expose()
  @ApiProperty({ example: 'medication' })
  type: string;

  @Expose()
  @ApiProperty({ example: 1 })
  dayNumber: number;

  @Expose()
  @ApiProperty({ example: 'Tomar antibiótico a cada 8 horas' })
  instruction: string;

  @Expose()
  @ApiProperty({ example: '2025-01-15T10:30:00Z' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ example: '2025-01-15T10:30:00Z' })
  updatedAt: Date;

  constructor(partial: Partial<ProtocolResponseDto>) {
    Object.assign(this, partial);
  }
}

/**
 * DTO de timeline unificada
 */
export class TimelineItemDto {
  @ApiProperty({ example: 1 })
  day: number;

  @ApiProperty({ example: ['Repouso absoluto', 'Tomar medicação'] })
  instructions: string[];
}

export class TimelineResponseDto {
  @ApiProperty({ example: 'Rinoplastia' })
  procedure: string;

  @ApiProperty({ type: [TimelineItemDto] })
  timeline: TimelineItemDto[];
}
