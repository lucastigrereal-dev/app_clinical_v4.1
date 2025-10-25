import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsUUID, IsOptional } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'ID do usuário que receberá a notificação',
    format: 'uuid',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    example: 'Nova consulta agendada',
    description: 'Título da notificação',
    maxLength: 255,
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Você tem uma consulta agendada para amanhã às 14h30',
    description: 'Mensagem detalhada da notificação',
    maxLength: 1000,
  })
  @IsString()
  message: string;

  @ApiProperty({
    example: NotificationType.INFO,
    description: 'Tipo da notificação',
    enum: NotificationType,
    default: NotificationType.INFO,
    required: false,
  })
  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;

  @ApiProperty({
    example: { appointmentId: '123', patientId: '456' },
    description: 'Dados adicionais da notificação',
    required: false,
  })
  @IsOptional()
  metadata?: any;
}
