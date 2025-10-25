// backend/src/cache/cache.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheService } from './cache.service';
import { CacheController } from './cache.controller';

@Global() // Makes CacheService available across all modules
@Module({
  imports: [ConfigModule],
  controllers: [CacheController],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
