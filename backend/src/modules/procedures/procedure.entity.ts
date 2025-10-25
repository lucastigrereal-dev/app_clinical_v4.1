import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('procedures')
export class Procedure {
  @ApiProperty({ example: 1, description: 'ID único do procedimento' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 1, description: 'Posição no ranking' })
  @Column()
  position: number;

  @ApiProperty({ example: 'Lipoaspiração', description: 'Nome do procedimento' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ example: 'Cirúrgico', description: 'Categoria: Cirúrgico ou Não-Cirúrgico' })
  @Column()
  category: string;

  @ApiProperty({ example: 289766, description: 'Volume de procedimentos em 2024' })
  @Column()
  volume_2024: number;

  @ApiProperty({ example: '12.3%', description: 'Participação de mercado' })
  @Column()
  market_share: string;

  @ApiProperty({ example: 'Corporal', description: 'Área do corpo: Corporal, Facial, Mama, Íntima' })
  @Column()
  body_area: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
