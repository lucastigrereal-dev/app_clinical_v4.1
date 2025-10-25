import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProceduresService } from './procedures.service';
import { QueryProcedureDto, TopProceduresDto } from './dto/query-procedure.dto';
import { ProcedureResponseDto } from './dto/procedure-response.dto';

@ApiTags('procedures')
@ApiBearerAuth('JWT-auth')
@Controller('procedures')
export class ProceduresController {
  constructor(private readonly proceduresService: ProceduresService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar procedimentos com paginação',
    description: 'Retorna lista paginada de procedimentos. Máximo 50 por página.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de procedimentos paginada',
    type: [ProcedureResponseDto],
  })
  async findAll(@Query() query: QueryProcedureDto): Promise<ProcedureResponseDto[]> {
    const procedures = await this.proceduresService.findAll(query);
    return procedures.map(p => new ProcedureResponseDto(p));
  }

  @Get('top')
  @ApiOperation({
    summary: 'Top procedimentos mais realizados',
    description: 'Retorna os N procedimentos mais realizados (máximo 50)',
  })
  @ApiResponse({
    status: 200,
    description: 'Top procedimentos',
    type: [ProcedureResponseDto],
  })
  async getTop(@Query() query: TopProceduresDto): Promise<ProcedureResponseDto[]> {
    const procedures = await this.proceduresService.getTopProcedures(query.limit || 10);
    return procedures.map(p => new ProcedureResponseDto(p));
  }

  @Get('search')
  @ApiOperation({
    summary: 'Buscar procedimentos por nome',
    description: 'Busca procedimentos cujo nome contenha o termo fornecido',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultados da busca',
    type: [ProcedureResponseDto],
  })
  async search(@Query() query: QueryProcedureDto): Promise<ProcedureResponseDto[]> {
    if (!query.q) {
      return [];
    }
    const procedures = await this.proceduresService.search(query.q);
    return procedures.map(p => new ProcedureResponseDto(p));
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Buscar procedimentos por categoria' })
  @ApiResponse({
    status: 200,
    description: 'Procedimentos da categoria',
    type: [ProcedureResponseDto],
  })
  async findByCategory(@Param('category') category: string): Promise<ProcedureResponseDto[]> {
    const procedures = await this.proceduresService.findByCategory(category);
    return procedures.map(p => new ProcedureResponseDto(p));
  }

  @Get('body-area/:area')
  @ApiOperation({ summary: 'Buscar procedimentos por área do corpo' })
  @ApiResponse({
    status: 200,
    description: 'Procedimentos da área',
    type: [ProcedureResponseDto],
  })
  async findByBodyArea(@Param('area') area: string): Promise<ProcedureResponseDto[]> {
    const procedures = await this.proceduresService.findByBodyArea(area);
    return procedures.map(p => new ProcedureResponseDto(p));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar procedimento por ID' })
  @ApiResponse({
    status: 200,
    description: 'Detalhes do procedimento',
    type: ProcedureResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Procedimento não encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ProcedureResponseDto> {
    const procedure = await this.proceduresService.findOne(id);
    return new ProcedureResponseDto(procedure);
  }
}
