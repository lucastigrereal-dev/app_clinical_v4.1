import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { QueryAlertDto } from './dto/query-alert.dto';
import { AlertResponseDto, AlertStatsDto } from './dto/alert-response.dto';

@ApiTags('alerts')
@ApiBearerAuth('JWT-auth')
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar alertas com paginação',
    description: 'Retorna lista paginada de alertas. Máximo 50 por página.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de alertas paginada',
    type: [AlertResponseDto],
  })
  async findAll(@Query() query: QueryAlertDto): Promise<AlertResponseDto[]> {
    const alerts = await this.alertsService.getAllAlerts(query);
    return alerts.map(a => new AlertResponseDto(a));
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estatísticas de alertas' })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas de alertas por severidade',
    type: AlertStatsDto,
  })
  async getStats(): Promise<AlertStatsDto> {
    return this.alertsService.getAlertStats();
  }

  @Get('severity/:severity')
  @ApiOperation({ summary: 'Buscar alertas por severidade' })
  @ApiParam({ name: 'severity', enum: ['critical', 'attention', 'info'] })
  @ApiResponse({
    status: 200,
    description: 'Alertas da severidade',
    type: [AlertResponseDto],
  })
  async findBySeverity(@Param('severity') severity: string): Promise<AlertResponseDto[]> {
    const alerts = await this.alertsService.findBySeverity(severity);
    return alerts.map(a => new AlertResponseDto(a));
  }

  @Get('procedure/:name')
  @ApiOperation({ summary: 'Buscar alertas de um procedimento' })
  @ApiResponse({
    status: 200,
    description: 'Alertas do procedimento',
    type: [AlertResponseDto],
  })
  async findByProcedure(@Param('name') name: string): Promise<AlertResponseDto[]> {
    const alerts = await this.alertsService.findByProcedure(decodeURIComponent(name));
    return alerts.map(a => new AlertResponseDto(a));
  }

  @Get('procedure/:name/critical')
  @ApiOperation({ summary: 'Buscar apenas alertas críticos de um procedimento' })
  @ApiResponse({
    status: 200,
    description: 'Alertas críticos',
    type: [AlertResponseDto],
  })
  async findCritical(@Param('name') name: string): Promise<AlertResponseDto[]> {
    const alerts = await this.alertsService.findCritical(decodeURIComponent(name));
    return alerts.map(a => new AlertResponseDto(a));
  }
}
