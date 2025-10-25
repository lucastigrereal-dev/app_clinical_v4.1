import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('emotional_mappings')
export class EmotionalMapping {
  @ApiProperty({ example: 1, description: 'ID único do mapeamento' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Lipoaspiração', description: 'Nome do procedimento' })
  @Column()
  procedure_name: string;

  @ApiProperty({ example: 'Busca por autoestima...', description: 'Motivações principais' })
  @Column('text')
  motivations: string;

  @ApiProperty({ example: 'Corpo mais definido...', description: 'O que buscam' })
  @Column('text')
  expectations: string;

  @ApiProperty({ example: 'Ver resultados rápidos...', description: 'Gatilhos de felicidade' })
  @Column('text')
  happiness_triggers: string;

  @ApiProperty({ example: 'Quero me sentir bem na praia', description: 'Frases reais de pacientes' })
  @Column('text')
  real_quotes: string;

  @ApiProperty({ example: 'A Transformadora', description: 'Persona motivacional' })
  @Column()
  motivational_persona: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
