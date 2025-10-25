import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmotionalMapping } from './emotional-mapping.entity';
import { QueryEmotionalDto } from './dto/query-emotional.dto';

@Injectable()
export class EmotionalService {
  constructor(
    @InjectRepository(EmotionalMapping)
    private emotionalRepository: Repository<EmotionalMapping>,
  ) {}

  /**
   * Lista todos os mapeamentos emocionais com paginação
   * MVP: Limita a 50 itens por página para prevenir queries excessivas
   */
  async findAll(query: QueryEmotionalDto): Promise<EmotionalMapping[]> {
    const limit = Math.min(query.limit || 20, 50); // Máximo de 50
    const page = query.page || 1;
    const skip = (page - 1) * limit;

    return this.emotionalRepository.find({
      order: { procedure_name: 'ASC' },
      take: limit,
      skip,
    });
  }

  /**
   * Busca mapeamento emocional por procedimento
   * MVP: Lança exceção se não encontrado
   */
  async findByProcedure(procedureName: string): Promise<EmotionalMapping> {
    const mapping = await this.emotionalRepository.findOne({
      where: { procedure_name: procedureName },
    });

    if (!mapping) {
      throw new NotFoundException(
        `Mapeamento emocional para procedimento "${procedureName}" não encontrado`,
      );
    }

    return mapping;
  }

  /**
   * Busca mapeamentos por persona
   * MVP: Limita a 50 resultados
   */
  async findByPersona(persona: string): Promise<EmotionalMapping[]> {
    return this.emotionalRepository.find({
      where: { motivational_persona: persona },
      take: 50, // Limite fixo de segurança
    });
  }

  /**
   * Retorna lista de todas as personas únicas
   * MVP: Query otimizada com DISTINCT
   */
  async getPersonas(): Promise<string[]> {
    const result = await this.emotionalRepository
      .createQueryBuilder('emotional')
      .select('DISTINCT emotional.motivational_persona', 'persona')
      .orderBy('emotional.motivational_persona', 'ASC')
      .getRawMany();

    return result.map(r => r.persona).filter(Boolean);
  }
}
