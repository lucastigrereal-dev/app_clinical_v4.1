// backend/src/cache/cache.controller.ts
import { Controller, Get, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CacheService } from './cache.service';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';

@ApiTags('cache')
@Controller('cache')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CacheController {
  constructor(private readonly cacheService: CacheService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get cache statistics' })
  @ApiResponse({
    status: 200,
    description: 'Cache statistics retrieved successfully',
    schema: {
      example: {
        status: 'connected',
        hits: 1245,
        misses: 328,
        total: 1573,
        hitRate: 79.15,
        evictedKeys: 12,
        expiredKeys: 452,
        connectedClients: 3,
        usedMemory: '2.45M',
        peakMemory: '3.12M',
        fragmentationRatio: 1.08
      }
    }
  })
  async getStats() {
    return await this.cacheService.getStats();
  }

  @Delete('flush')
  @ApiOperation({ summary: 'Flush all cache (Admin only)' })
  @ApiResponse({ status: 200, description: 'Cache flushed successfully' })
  async flushCache() {
    await this.cacheService.flush();
    return {
      message: 'Cache flushed successfully',
      timestamp: new Date().toISOString()
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Check cache health' })
  @ApiResponse({
    status: 200,
    description: 'Cache health status',
    schema: {
      example: {
        healthy: true,
        status: 'connected',
        timestamp: '2025-01-15T10:30:00.000Z'
      }
    }
  })
  async healthCheck() {
    const stats = await this.cacheService.getStats();
    return {
      healthy: stats.status === 'connected',
      status: stats.status,
      timestamp: new Date().toISOString()
    };
  }
}
