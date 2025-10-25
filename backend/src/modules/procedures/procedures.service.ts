import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Procedure } from './procedure.entity';
import { QueryProcedureDto } from './dto/query-procedure.dto';
import { CacheService } from '../../cache/cache.service';

@Injectable()
export class ProceduresService {
  private readonly CACHE_TTL = 600; // 10 minutes
  private readonly CACHE_PREFIX = 'procedures';

  constructor(
    @InjectRepository(Procedure)
    private proceduresRepository: Repository<Procedure>,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Lista todos os procedimentos com paginação
   * MVP: Limita a 50 itens por página para prevenir queries excessivas
   * Cache: 10 minutos
   */
  async findAll(query: QueryProcedureDto): Promise<Procedure[]> {
    const limit = Math.min(query.limit || 20, 50); // Máximo de 50
    const page = query.page || 1;
    const skip = (page - 1) * limit;

    const cacheKey = `list:page${page}:limit${limit}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        return this.proceduresRepository.find({
          order: { position: 'ASC' },
          take: limit,
          skip,
        });
      },
      {
        ttl: this.CACHE_TTL,
        prefix: this.CACHE_PREFIX,
        tags: ['procedures', 'list'],
      },
    );
  }

  /**
   * Busca um procedimento por ID
   * MVP: Lança exceção se não encontrado (melhor que retornar null)
   * Cache: 10 minutos
   */
  async findOne(id: number): Promise<Procedure> {
    const cacheKey = `id:${id}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const procedure = await this.proceduresRepository.findOne({ where: { id } });

        if (!procedure) {
          throw new NotFoundException(`Procedimento com ID ${id} não encontrado`);
        }

        return procedure;
      },
      {
        ttl: this.CACHE_TTL,
        prefix: this.CACHE_PREFIX,
        tags: ['procedures', `procedure:${id}`],
      },
    );
  }

  async findByName(name: string): Promise<Procedure> {
    return this.proceduresRepository.findOne({ where: { name } });
  }

  /**
   * Busca procedimentos por nome
   * MVP: Limita a 50 resultados para prevenir queries excessivas
   */
  async search(query: string): Promise<Procedure[]> {
    return this.proceduresRepository.find({
      where: { name: Like(`%${query}%`) },
      order: { position: 'ASC' },
      take: 50, // Limite fixo de segurança
    });
  }

  /**
   * Busca procedimentos por categoria
   * MVP: Limita a 50 resultados
   */
  async findByCategory(category: string): Promise<Procedure[]> {
    return this.proceduresRepository.find({
      where: { category },
      order: { position: 'ASC' },
      take: 50, // Limite fixo de segurança
    });
  }

  /**
   * Busca procedimentos por área do corpo
   * MVP: Limita a 50 resultados
   */
  async findByBodyArea(bodyArea: string): Promise<Procedure[]> {
    return this.proceduresRepository.find({
      where: { body_area: bodyArea },
      order: { position: 'ASC' },
      take: 50, // Limite fixo de segurança
    });
  }

  /**
   * Retorna top N procedimentos mais realizados
   * MVP: Limita a 50 no máximo
   * Cache: 10 minutos
   */
  async getTopProcedures(limit: number = 10): Promise<Procedure[]> {
    const safeLimit = Math.min(limit, 50); // Máximo de 50
    const cacheKey = `top:limit${safeLimit}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        return this.proceduresRepository.find({
          order: { position: 'ASC' },
          take: safeLimit,
        });
      },
      {
        ttl: this.CACHE_TTL,
        prefix: this.CACHE_PREFIX,
        tags: ['procedures', 'top'],
      },
    );
  }
}
