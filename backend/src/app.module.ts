import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { ProceduresModule } from './modules/procedures/procedures.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { ProtocolsModule } from './modules/protocols/protocols.module';
import { EmotionalModule } from './modules/emotional/emotional.module';
import { CacheModule } from './cache/cache.module';
import { HealthModule } from './health/health.module';
// 🆕 v4.0.0: Novos módulos migrados do appclinicav3
import { PatientsModule } from './modules/patients/patients.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { UsersModule } from './modules/users/users.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ImageAnalysisModule } from './modules/image-analysis/image-analysis.module';
import { MedicalAIModule } from './modules/medical-ai/medical-ai.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
// 🆕 v5.0.0: Enterprise modules
import { EmailModule } from './modules/email/email.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ReportsModule } from './modules/reports/reports.module';
import { PaymentsModule } from './modules/payments/payments.module';
@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Cache (must be after ConfigModule)
    CacheModule,
    // Health check (public endpoint for Railway)
    HealthModule,
    // Database
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get('DATABASE_URL');
        // Railway/Produção: usa DATABASE_URL
        // Desenvolvimento local: usa variáveis separadas
        const config = databaseUrl
          ? {
              type: 'postgres' as const,
              url: databaseUrl,
            }
          : {
              type: 'postgres' as const,
              host: configService.get('DATABASE_HOST', 'localhost'),
              port: configService.get('DATABASE_PORT', 5432),
              username: configService.get('DATABASE_USER', 'clinic_user'),
              password: configService.get('DATABASE_PASSWORD', 'clinic_password'),
              database: configService.get('DATABASE_NAME', 'clinic_companion'),
            };
        return {
          ...config,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: false, // ✅ DIA 3: Usando migrations agora
          logging: process.env.NODE_ENV === 'development',
          // Connection pool para performance
          extra: {
            max: 20, // Máximo de conexões simultâneas
            min: 5,  // Mínimo de conexões mantidas
            idleTimeoutMillis: 30000,
          },
        };
      },
    }),
    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    // Bull (Background Jobs) - Conditional based on REDIS_ENABLED
    ...(process.env.REDIS_ENABLED === 'true'
      ? [
          BullModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
              redis: {
                host: configService.get('REDIS_HOST', 'localhost'),
                port: configService.get('REDIS_PORT', 6379),
                password: configService.get('REDIS_PASSWORD'),
                // Graceful error handling - app continues without Redis
                retryStrategy: (times) => {
                  if (times > 3) {
                    console.warn('⚠️ Redis unavailable - running without background jobs');
                    return null; // Stop retrying
                  }
                  return Math.min(times * 1000, 3000);
                },
              },
            }),
          }),
        ]
      : []),
    // Auth module (MUST be first)
    AuthModule,
    // Feature modules
    ProceduresModule,
    AlertsModule,
    ProtocolsModule,
    EmotionalModule,
    // 🆕 v4.0.0: Novos módulos enterprise
    PatientsModule,
    AppointmentsModule,
    UsersModule,
    NotificationsModule,
    ImageAnalysisModule,
    MedicalAIModule,
    AnalyticsModule,
    // 🆕 v5.0.0: Complete Enterprise Suite
    EmailModule,
    // TODO: Re-enable when Redis is configured (set REDIS_ENABLED=true)
    // JobsModule,
    ReportsModule,
    PaymentsModule,
  ],
  providers: [
    // Global JWT Auth Guard - todos endpoints protegidos por padrão
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
