import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para queries de busca de procedimentos
 * Previne inputs inválidos que podem quebrar o sistema
 */
export class QueryProcedureDto {
  @ApiPropertyOptional({
    description: 'Termo de busca no nome do procedimento',
    example: 'rinoplastia',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    description: 'Categoria do procedimento',
    example: 'facial',
    enum: ['facial', 'corporal', 'mama', 'intimo', 'capilar', 'other'],
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Área do corpo',
    example: 'nariz',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  bodyArea?: string;

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

/**
 * DTO para buscar top N procedimentos
 * Previne requisições excessivas
 */
export class TopProceduresDto {
  @ApiPropertyOptional({
    description: 'Quantidade de procedimentos top (máximo 50)',
    example: 10,
    minimum: 1,
    maximum: 50,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}
