import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para queries de protocolos
 * Previne inputs inválidos que podem quebrar o sistema
 */
export class QueryProtocolDto {
  @ApiPropertyOptional({
    description: 'Tipo do protocolo',
    example: 'medication',
    enum: ['medication', 'care', 'diet', 'activity', 'followup'],
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: 'Nome do procedimento (URL encoded)',
    example: 'Rinoplastia',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  procedureName?: string;

  @ApiPropertyOptional({
    description: 'Número da página (começa em 1)',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Quantidade de itens por página (máximo 50)',
    example: 20,
    minimum: 1,
    maximum: 50,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}
