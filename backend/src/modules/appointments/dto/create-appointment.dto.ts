import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsEnum, IsOptional, IsString, Min } from 'class-validator';
import { AppointmentStatus, AppointmentType } from '../entities/appointment.entity';

export class CreateAppointmentDto {
  @ApiProperty({
    example: '2025-02-15T14:30:00Z',
    description: 'Data e hora agendada para a consulta',
    type: 'string',
    format: 'date-time',
  })
  @IsDateString()
  scheduledDate: Date;

  @ApiProperty({
    example: 60,
    description: 'Duração da consulta em minutos',
    minimum: 15,
    maximum: 240,
    default: 60,
  })
  @IsNumber()
  @Min(15)
  duration: number;

  @ApiProperty({
    example: AppointmentStatus.SCHEDULED,
    description: 'Status atual da consulta',
    enum: AppointmentStatus,
    default: AppointmentStatus.SCHEDULED,
    required: false,
  })
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @ApiProperty({
    example: AppointmentType.CONSULTATION,
    description: 'Tipo de consulta',
    enum: AppointmentType,
    default: AppointmentType.CONSULTATION,
    required: false,
  })
  @IsEnum(AppointmentType)
  @IsOptional()
  type?: AppointmentType;

  @ApiProperty({
    example: 'Paciente relata dores abdominais há 3 dias',
    description: 'Observações e notas da consulta',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    example: 'Gastrite aguda',
    description: 'Diagnóstico médico após a consulta',
    required: false,
  })
  @IsString()
  @IsOptional()
  diagnosis?: string;

  @ApiProperty({
    example: 'Dieta leve, evitar alimentos ácidos e picantes',
    description: 'Tratamento prescrito',
    required: false,
  })
  @IsString()
  @IsOptional()
  treatment?: string;

  @ApiProperty({
    example: 'Omeprazol 20mg - 1 cápsula em jejum por 14 dias',
    description: 'Receita médica',
    required: false,
  })
  @IsString()
  @IsOptional()
  prescription?: string;
}
