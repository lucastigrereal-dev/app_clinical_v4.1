import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmotionalController } from './emotional.controller';
import { EmotionalService } from './emotional.service';
import { EmotionalMapping } from './emotional-mapping.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmotionalMapping])],
  controllers: [EmotionalController],
  providers: [EmotionalService],
  exports: [EmotionalService],
})
export class EmotionalModule {}
