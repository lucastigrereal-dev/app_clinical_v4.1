import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

// Importar entidades necessárias
import { User } from '../users/entities/user.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { PhotoAnalysis } from '../medical-ai/entities/photo-analysis.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Patient,
      Appointment,
      PhotoAnalysis,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
