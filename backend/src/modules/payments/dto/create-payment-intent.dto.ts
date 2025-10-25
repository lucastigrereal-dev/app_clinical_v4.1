import { IsNumber, IsString, IsOptional, IsObject, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentIntentDto {
  @ApiProperty({ example: 'patient-123', description: 'Patient ID' })
  @IsString()
  patientId: string;

  @ApiProperty({ example: 10000, description: 'Amount in cents (e.g., 10000 = R$ 100.00)' })
  @IsNumber()
  @Min(100) // Minimum R$ 1.00
  amount: number;

  @ApiProperty({ example: 'BRL', description: 'Currency code' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ example: 'Consulta de acompanhamento', description: 'Payment description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: { appointmentId: 'apt-456' }, description: 'Additional metadata' })
  @IsObject()
  @IsOptional()
  metadata?: any;
}
