import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard overview analytics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard analytics retrieved successfully',
  })
  async getDashboardOverview() {
    return this.analyticsService.getDashboardOverview();
  }

  @Get('medical-ai')
  @ApiOperation({ summary: 'Get Medical AI analytics' })
  @ApiResponse({
    status: 200,
    description: 'Medical AI analytics retrieved successfully',
  })
  async getMedicalAIAnalytics() {
    return this.analyticsService.getMedicalAIAnalytics();
  }

  @Get('patients')
  @ApiOperation({ summary: 'Get patient analytics' })
  @ApiResponse({
    status: 200,
    description: 'Patient analytics retrieved successfully',
  })
  async getPatientAnalytics() {
    return this.analyticsService.getPatientAnalytics();
  }

  @Get('appointments')
  @ApiOperation({ summary: 'Get appointments analytics' })
  @ApiResponse({
    status: 200,
    description: 'Appointments analytics retrieved successfully',
  })
  async getAppointmentsAnalytics() {
    return this.analyticsService.getAppointmentsAnalytics();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get user analytics (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User analytics retrieved successfully',
  })
  async getUserAnalytics() {
    return this.analyticsService.getUserAnalytics();
  }

  @Get('report')
  @ApiOperation({ summary: 'Generate complete analytics report' })
  @ApiResponse({
    status: 200,
    description: 'Complete analytics report generated successfully',
  })
  async generateCompleteReport() {
    return this.analyticsService.generateCompleteReport();
  }
}
