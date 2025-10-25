import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EmailProcessor } from './processors/email.processor';
import { NotificationsProcessor } from './processors/notifications.processor';
import { AnalyticsProcessor } from './processors/analytics.processor';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'email' },
      { name: 'notifications' },
      { name: 'analytics' },
    ),
    EmailModule,
    NotificationsModule,
  ],
  providers: [EmailProcessor, NotificationsProcessor, AnalyticsProcessor],
  exports: [BullModule],
})
export class JobsModule {}
