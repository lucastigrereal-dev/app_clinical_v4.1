import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum, IsOptional, IsBoolean, MinLength } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    example: 'doctor@clinic.com',
    description: 'Email único do usuário',
    uniqueItems: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'senha123',
    description: 'Senha do usuário (mínimo 6 caracteres)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'Dr. João Silva',
    description: 'Nome completo do usuário',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: '11999999999',
    description: 'Telefone de contato',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: UserRole.DOCTOR,
    description: 'Função/perfil do usuário no sistema',
    enum: UserRole,
    default: UserRole.STAFF,
    required: false,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({
    example: true,
    description: 'Se o usuário está ativo no sistema',
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    example: false,
    description: 'Se o usuário tem autenticação de dois fatores habilitada',
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  mfaEnabled?: boolean;
}
