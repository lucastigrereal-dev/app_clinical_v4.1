import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProtocolsService, MedicalProtocol } from './protocols.service';
import { QueryProtocolDto } from './dto/query-protocol.dto';
import { ProtocolResponseDto, TimelineResponseDto } from './dto/protocol-response.dto';

@ApiTags('protocols')
@ApiBearerAuth('JWT-auth')
@Controller('protocols')
export class ProtocolsController {
  constructor(private readonly protocolsService: ProtocolsService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar protocolos com paginação',
    description: 'Retorna lista paginada de protocolos. Máximo 50 por página.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de protocolos paginada',
    type: [ProtocolResponseDto],
  })
  async findAll(@Query() query: QueryProtocolDto): Promise<ProtocolResponseDto[]> {
    const protocols = await this.protocolsService.findAll(query);
    return protocols.map(p => new ProtocolResponseDto(p));
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Buscar protocolos por tipo' })
  @ApiResponse({
    status: 200,
    description: 'Protocolos do tipo',
    type: [ProtocolResponseDto],
  })
  async findByType(@Param('type') type: string): Promise<ProtocolResponseDto[]> {
    const protocols = await this.protocolsService.findByType(type);
    return protocols.map(p => new ProtocolResponseDto(p));
  }

  @Get('procedure/:name')
  @ApiOperation({ summary: 'Buscar protocolos de um procedimento' })
  @ApiResponse({
    status: 200,
    description: 'Protocolos do procedimento',
    type: [ProtocolResponseDto],
  })
  async findByProcedure(@Param('name') name: string): Promise<ProtocolResponseDto[]> {
    const protocols = await this.protocolsService.findByProcedure(decodeURIComponent(name));
    return protocols.map(p => new ProtocolResponseDto(p));
  }

  @Get('procedure/:name/timeline')
  @ApiOperation({ summary: 'Timeline de cuidados de um procedimento' })
  @ApiResponse({
    status: 200,
    description: 'Timeline unificada',
    type: TimelineResponseDto,
  })
  async getTimeline(@Param('name') name: string): Promise<TimelineResponseDto> {
    return this.protocolsService.getTimeline(decodeURIComponent(name));
  }

  @Get('medical')
  @ApiOperation({
    summary: 'Lista todos os procedimentos médicos disponíveis',
    description: 'Retorna lista de procedimentos com protocolos médicos completos (82 milestones por procedimento)'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de procedimentos médicos',
    schema: {
      example: [{
        name: 'Lipoaspiração',
        id: 'lipoaspiracao',
        category: 'aesthetic',
        totalMilestones: 82,
        totalDays: 180,
        metadata: {
          averageRecoveryTime: '2_months',
          riskLevel: 'medium',
          patientSatisfaction: 0.94,
          complicationRate: 0.08
        }
      }]
    }
  })
  getMedicalProcedures() {
    return this.protocolsService.getMedicalProcedures();
  }

  @Get('medical/:procedureName')
  @ApiOperation({
    summary: 'Busca protocolo médico completo de um procedimento',
    description: 'Retorna protocolo médico completo com todos os 82 milestones (D+0 até D+180)'
  })
  @ApiResponse({
    status: 200,
    description: 'Protocolo médico completo',
    schema: {
      example: {
        procedureName: 'Lipoaspiração',
        procedureId: 'lipoaspiracao',
        totalMilestones: 82,
        totalDays: 180,
        milestones: [
          {
            id: 'lipoaspiracao_d0_morning',
            dayOffset: 0,
            title: 'D+0: Primeiro Dia',
            message: 'Bom dia! Hoje é o primeiro dia...',
            instructions: ['Usar cinta', 'Repouso'],
            warnings: ['Hematoma', 'Infecção'],
            tips: ['Mantenha-se hidratada']
          }
        ]
      }
    }
  })
  getMedicalProtocol(@Param('procedureName') procedureName: string): MedicalProtocol {
    return this.protocolsService.getMedicalProtocolByProcedure(decodeURIComponent(procedureName));
  }

  @Get('medical/:procedureName/day/:day')
  @ApiOperation({
    summary: 'Busca milestone de um dia específico',
    description: 'Retorna milestones do dia específico do protocolo médico'
  })
  @ApiResponse({
    status: 200,
    description: 'Milestones do dia',
    schema: {
      example: [{
        id: 'lipoaspiracao_d7_morning',
        dayOffset: 7,
        timeOfDay: 'morning',
        title: 'D+7: Uma Semana de Sucesso',
        message: 'Parabéns! Uma semana...',
        priority: 'medium'
      }]
    }
  })
  getMilestoneByDay(
    @Param('procedureName') procedureName: string,
    @Param('day') day: string
  ) {
    return this.protocolsService.getMilestoneByDay(
      decodeURIComponent(procedureName),
      parseInt(day, 10)
    );
  }
}
