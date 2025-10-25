import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MarkReviewedDto {
  @ApiProperty({
    description: 'ID do médico que revisou',
    example: 'doctor-uuid-123',
  })
  @IsString()
  doctorId: string;

  @ApiPropertyOptional({
    description: 'Notas do médico sobre a análise',
    example: 'Paciente apresenta recuperação dentro do esperado. Orientado a continuar cuidados.',
  })
  @IsString()
  @IsOptional()
  doctorNotes?: string;
}
