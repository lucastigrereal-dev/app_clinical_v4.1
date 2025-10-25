import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationType } from '../../notifications/entities/notification.entity';

export interface NotificationJob {
  userId: string;
  title: string;
  message: string;
  type: string;
  metadata?: any;
}

@Processor('notifications')
export class NotificationsProcessor {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @Process('create-notification')
  async handleCreateNotification(job: Job<NotificationJob>) {
    this.logger.log(`🔔 Processing notification job: ${job.id}`);

    const { userId, title, message, type, metadata } = job.data;

    try {
      await this.notificationsService.create({
        userId,
        title,
        message,
        type: type as NotificationType,
        metadata,
      });

      this.logger.log(`✅ Notification created for user ${userId}`);
    } catch (error) {
      this.logger.error(`❌ Failed to create notification: ${error.message}`);
      throw error;
    }
  }

  @Process('send-scheduled-notification')
  async handleScheduledNotification(job: Job<NotificationJob>) {
    this.logger.log(`🔔 Processing scheduled notification job: ${job.id}`);

    const { userId, title, message, type, metadata } = job.data;

    try {
      // Create notification in database
      const notification = await this.notificationsService.create({
        userId,
        title,
        message,
        type: type as NotificationType,
        metadata,
      });

      // Send real-time via WebSocket if gateway is available
      // The gateway will be injected when we integrate

      this.logger.log(`✅ Scheduled notification sent to user ${userId}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send scheduled notification: ${error.message}`);
      throw error;
    }
  }

  @Process('bulk-notifications')
  async handleBulkNotifications(job: Job<{ notifications: NotificationJob[] }>) {
    this.logger.log(`🔔 Processing bulk notifications job: ${job.id}`);

    const { notifications } = job.data;

    try {
      for (const notif of notifications) {
        await this.notificationsService.create({
          userId: notif.userId,
          title: notif.title,
          message: notif.message,
          type: notif.type as NotificationType,
          metadata: notif.metadata,
        });
      }

      this.logger.log(`✅ Bulk notifications created (${notifications.length} notifications)`);
    } catch (error) {
      this.logger.error(`❌ Failed to create bulk notifications: ${error.message}`);
      throw error;
    }
  }
}
