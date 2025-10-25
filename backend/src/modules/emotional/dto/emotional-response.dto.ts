import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

/**
 * DTO de resposta para mapeamento emocional
 * Garante que apenas dados seguros são expostos na API
 */
@Exclude()
export class EmotionalResponseDto {
  @Expose()
  @ApiProperty({ example: 1 })
  id: number;

  @Expose()
  @ApiProperty({ example: 'Rinoplastia' })
  procedureName: string;

  @Expose()
  @ApiProperty({ example: 'A Transformadora' })
  motivationalPersona: string;

  @Expose()
  @ApiPropertyOptional({ example: 'Busca transformação significativa na aparência' })
  emotionalProfile?: string;

  @Expose()
  @ApiPropertyOptional({ example: 'Foco na transformação visível e empoderamento' })
  communicationTips?: string;

  @Expose()
  @ApiProperty({ example: '2025-01-15T10:30:00Z' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ example: '2025-01-15T10:30:00Z' })
  updatedAt: Date;

  constructor(partial: Partial<EmotionalResponseDto>) {
    Object.assign(this, partial);
  }
}
