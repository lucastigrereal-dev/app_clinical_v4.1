import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmotionalService } from './emotional.service';
import { QueryEmotionalDto } from './dto/query-emotional.dto';
import { EmotionalResponseDto } from './dto/emotional-response.dto';

@ApiTags('emotional')
@ApiBearerAuth('JWT-auth')
@Controller('emotional')
export class EmotionalController {
  constructor(private readonly emotionalService: EmotionalService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar mapeamentos emocionais com paginação',
    description: 'Retorna lista paginada de mapeamentos emocionais. Máximo 50 por página.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de mapeamentos paginada',
    type: [EmotionalResponseDto],
  })
  async findAll(@Query() query: QueryEmotionalDto): Promise<EmotionalResponseDto[]> {
    const mappings = await this.emotionalService.findAll(query);
    return mappings.map(m => new EmotionalResponseDto(m));
  }

  @Get('personas')
  @ApiOperation({ summary: 'Listar todas as personas motivacionais' })
  @ApiResponse({
    status: 200,
    description: 'Lista de personas únicas',
    schema: { example: ['A Transformadora', 'O Confiante', 'A Renovada'] },
  })
  async getPersonas(): Promise<string[]> {
    return this.emotionalService.getPersonas();
  }

  @Get('persona/:name')
  @ApiOperation({ summary: 'Buscar procedimentos por persona' })
  @ApiResponse({
    status: 200,
    description: 'Mapeamentos da persona',
    type: [EmotionalResponseDto],
  })
  async findByPersona(@Param('name') name: string): Promise<EmotionalResponseDto[]> {
    const mappings = await this.emotionalService.findByPersona(decodeURIComponent(name));
    return mappings.map(m => new EmotionalResponseDto(m));
  }

  @Get('procedure/:name')
  @ApiOperation({ summary: 'Buscar mapeamento emocional de um procedimento' })
  @ApiResponse({
    status: 200,
    description: 'Mapeamento emocional',
    type: EmotionalResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Mapeamento não encontrado' })
  async findByProcedure(@Param('name') name: string): Promise<EmotionalResponseDto> {
    const mapping = await this.emotionalService.findByProcedure(decodeURIComponent(name));
    return new EmotionalResponseDto(mapping);
  }
}
