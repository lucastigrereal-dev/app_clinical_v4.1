import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success',
}

@Entity('notifications')
export class Notification {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID único da notificação (UUID)',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'ID do usuário que receberá a notificação',
  })
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ApiProperty({
    example: 'Nova consulta agendada',
    description: 'Título da notificação',
    maxLength: 255,
  })
  @Column({ length: 255 })
  title: string;

  @ApiProperty({
    example: 'Você tem uma consulta agendada para amanhã às 14h30',
    description: 'Mensagem detalhada da notificação',
    maxLength: 1000,
  })
  @Column({ type: 'text' })
  message: string;

  @ApiProperty({
    example: NotificationType.INFO,
    description: 'Tipo da notificação',
    enum: NotificationType,
    default: NotificationType.INFO,
  })
  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.INFO,
  })
  type: NotificationType;

  @ApiProperty({
    example: false,
    description: 'Indica se a notificação foi lida',
    default: false,
  })
  @Column({ default: false })
  read: boolean;

  @ApiProperty({
    example: '2025-01-15T10:30:00Z',
    description: 'Data de criação da notificação',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
