import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { MedicalAIService } from '../services/medical-ai.service';
import { AnalyzePhotoDto } from '../dto/analyze-photo.dto';
import { MarkReviewedDto } from '../dto/mark-reviewed.dto';
import { PhotoAnalysis } from '../entities/photo-analysis.entity';

@ApiTags('Medical AI')
@Controller('medical-ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MedicalAIController {
  constructor(private readonly medicalAIService: MedicalAIService) {}

  @Post('analyze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Analisa foto pós-operatória usando IA',
    description:
      'Detecta possíveis complicações (hematoma, edema, infecção, assimetria) e gera score de recuperação',
  })
  @ApiResponse({
    status: 200,
    description: 'Análise realizada com sucesso',
    type: PhotoAnalysis,
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  async analyzePhoto(
    @Body() analyzePhotoDto: AnalyzePhotoDto,
  ): Promise<PhotoAnalysis> {
    return this.medicalAIService.analyzePhoto(
      analyzePhotoDto.patientId,
      analyzePhotoDto.photoUrl,
      analyzePhotoDto.procedureType,
    );
  }

  @Get('patient/:patientId/analyses')
  @ApiOperation({
    summary: 'Lista todas as análises de um paciente',
    description: 'Retorna histórico completo de análises de fotos',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de análises',
    type: [PhotoAnalysis],
  })
  async getPatientAnalyses(
    @Param('patientId') patientId: string,
  ): Promise<PhotoAnalysis[]> {
    return this.medicalAIService.getPatientAnalyses(patientId);
  }

  @Get('pending-review')
  @ApiOperation({
    summary: 'Lista análises que requerem revisão médica',
    description:
      'Retorna análises com complicações graves ou score baixo que ainda não foram revisadas por um médico',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de análises pendentes',
    type: [PhotoAnalysis],
  })
  async getPendingReviews(): Promise<PhotoAnalysis[]> {
    return this.medicalAIService.getAnalysesNeedingReview();
  }

  @Patch('analysis/:analysisId/review')
  @ApiOperation({
    summary: 'Marca análise como revisada',
    description: 'Atualiza status da análise para "completed"',
  })
  @ApiResponse({
    status: 200,
    description: 'Análise atualizada',
    type: PhotoAnalysis,
  })
  @ApiResponse({
    status: 404,
    description: 'Análise não encontrada',
  })
  async markAsReviewed(
    @Param('analysisId') analysisId: string,
  ): Promise<PhotoAnalysis> {
    return this.medicalAIService.updateAnalysisStatus(analysisId, 'completed');
  }
}
