import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    example: 'JBSWY3DPEHPK3PXP',
    description: 'Secret para autenticação de dois fatores (MFA)',
    required: false,
  })
  @IsString()
  @IsOptional()
  mfaSecret?: string;
}
