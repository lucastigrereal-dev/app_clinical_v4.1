import { IsString, IsInt, IsUrl, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnalyzePhotoDto {
  @ApiProperty({
    description: 'ID do paciente',
    example: 'ac6fb683-dc55-47fa-b2f9-2fa6864d841b',
  })
  @IsString()
  patientId: string;

  @ApiProperty({
    description: 'URL da foto pós-operatória',
    example: 'https://storage.example.com/photos/patient-123-day7.jpg',
  })
  @IsUrl()
  photoUrl: string;

  @ApiProperty({
    description: 'Dias após a cirurgia (D+0, D+1, etc)',
    example: 7,
    minimum: 0,
    maximum: 365,
  })
  @IsInt()
  @Min(0)
  @Max(365)
  daysPostOp: number;

  @ApiProperty({
    description: 'Tipo de procedimento cirúrgico',
    example: 'Abdominoplastia',
  })
  @IsString()
  procedureType: string;
}
