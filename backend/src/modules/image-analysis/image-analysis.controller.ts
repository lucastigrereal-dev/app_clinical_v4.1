import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ImageAnalysisService } from './image-analysis.service';

@ApiTags('image-analysis')
@Controller('image-analysis')
export class ImageAnalysisController {
  constructor(private readonly imageAnalysisService: ImageAnalysisService) {}

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze medical image' })
  @ApiResponse({ status: 201, description: 'Image analyzed successfully.' })
  analyze(@Body() body: { patientId: string; imageUrl: string }) {
    return this.imageAnalysisService.analyze(body.patientId, body.imageUrl);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get analyses by patient ID' })
  @ApiResponse({ status: 200, description: 'Analyses retrieved successfully.' })
  findByPatientId(@Param('patientId') patientId: string) {
    return this.imageAnalysisService.findByPatientId(patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get analysis by ID' })
  @ApiResponse({ status: 200, description: 'Analysis retrieved successfully.' })
  findOne(@Param('id') id: string) {
    return this.imageAnalysisService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete analysis' })
  @ApiResponse({ status: 200, description: 'Analysis deleted successfully.' })
  delete(@Param('id') id: string) {
    return this.imageAnalysisService.delete(id);
  }
}
