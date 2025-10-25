import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProtocolsController } from './protocols.controller';
import { ProtocolsService } from './protocols.service';
import { Protocol } from './protocol.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Protocol])],
  controllers: [ProtocolsController],
  providers: [ProtocolsService],
  exports: [ProtocolsService],
})
export class ProtocolsModule {}
