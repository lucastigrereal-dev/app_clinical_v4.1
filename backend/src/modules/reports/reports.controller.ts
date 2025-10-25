import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('patient/:id/pdf')
  @ApiOperation({ summary: 'Generate patient summary PDF report' })
  async generatePatientReport(@Param('id') patientId: string, @Res() res: Response) {
    const pdfBuffer = await this.reportsService.generatePatientReport(patientId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=patient-report-${patientId}.pdf`,
    );
    res.send(pdfBuffer);
  }

  @Get('analysis/:id/pdf')
  @ApiOperation({ summary: 'Generate photo analysis PDF report' })
  async generateAnalysisReport(@Param('id') analysisId: string, @Res() res: Response) {
    const pdfBuffer = await this.reportsService.generateAnalysisReport(analysisId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=analysis-report-${analysisId}.pdf`,
    );
    res.send(pdfBuffer);
  }

  @Get('appointments/:patientId/pdf')
  @ApiOperation({ summary: 'Generate appointments history PDF report' })
  async generateAppointmentsReport(@Param('patientId') patientId: string, @Res() res: Response) {
    const pdfBuffer = await this.reportsService.generateAppointmentsReport(patientId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=appointments-${patientId}.pdf`,
    );
    res.send(pdfBuffer);
  }
}
