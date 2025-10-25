import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('protocols')
export class Protocol {
  @ApiProperty({ example: 1, description: 'ID único do protocolo' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Lipoaspiração', description: 'Nome do procedimento' })
  @Column()
  procedure_name: string;

  @ApiProperty({ example: 'post_op_care', description: 'Tipo de protocolo' })
  @Column()
  type: string;

  @ApiProperty({
    example: { timeline: [{ day: 1, instructions: ['Repouso', 'Medicação'] }] },
    description: 'Dados do protocolo em formato JSON'
  })
  @Column('jsonb')
  protocol_data: any;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
