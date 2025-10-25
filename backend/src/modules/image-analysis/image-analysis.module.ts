import { Module } from '@nestjs/common';
import { ImageAnalysisService } from './image-analysis.service';
import { ImageAnalysisController } from './image-analysis.controller';

@Module({
  controllers: [ImageAnalysisController],
  providers: [ImageAnalysisService],
  exports: [ImageAnalysisService],
})
export class ImageAnalysisModule {}
