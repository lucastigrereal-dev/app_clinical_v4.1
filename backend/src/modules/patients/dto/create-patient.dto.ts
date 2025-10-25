import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { PatientStatus } from '../entities/patient.entity';

export class CreatePatientDto {
  @ApiProperty({
    example: 'João Silva',
    description: 'Nome completo do paciente',
    minLength: 3,
    maxLength: 255,
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'joao.silva@email.com',
    description: 'Email único do paciente',
    uniqueItems: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '11999999999',
    description: 'Telefone de contato (formato: DDD + número)',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    example: '1990-01-15',
    description: 'Data de nascimento (formato: YYYY-MM-DD)',
    type: 'string',
    format: 'date',
  })
  @IsDateString()
  birthDate: Date;

  @ApiProperty({
    example: '12345678900',
    description: 'CPF do paciente (somente números)',
    minLength: 11,
    maxLength: 11,
  })
  @IsString()
  cpf: string;

  @ApiProperty({
    example: 'Rua das Flores, 123, São Paulo - SP',
    description: 'Endereço completo do paciente',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    example: PatientStatus.ACTIVE,
    description: 'Status do paciente',
    enum: PatientStatus,
    default: PatientStatus.ACTIVE,
    required: false,
  })
  @IsEnum(PatientStatus)
  @IsOptional()
  status?: PatientStatus;

  @ApiProperty({
    example: 'Paciente com histórico de diabetes tipo 2, diagnosticado em 2018',
    description: 'Histórico médico completo do paciente',
    required: false,
  })
  @IsString()
  @IsOptional()
  medicalHistory?: string;

  @ApiProperty({
    example: 'Alergia a penicilina e derivados',
    description: 'Lista de alergias conhecidas',
    required: false,
  })
  @IsString()
  @IsOptional()
  allergies?: string;

  @ApiProperty({
    example: 'Metformina 850mg (2x ao dia)',
    description: 'Medicações em uso contínuo',
    required: false,
  })
  @IsString()
  @IsOptional()
  medications?: string;
}
