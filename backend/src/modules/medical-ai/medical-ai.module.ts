import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalAIController } from './controllers/medical-ai.controller';
import { MedicalAIService } from './services/medical-ai.service';
import { PhotoAnalysis } from './entities/photo-analysis.entity';
import { Patient } from '../patients/entities/patient.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PhotoAnalysis, Patient])],
  controllers: [MedicalAIController],
  providers: [MedicalAIService],
  exports: [MedicalAIService],
})
export class MedicalAIModule {}
