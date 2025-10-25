import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Notification, NotificationType } from './entities/notification.entity';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let repository: Repository<Notification>;

  // In-memory storage to simulate database
  let notifications: Notification[] = [];
  let idCounter = 0;

  const mockRepository = {
    create: jest.fn((data: any) => ({
      ...data,
      id: `${++idCounter}`,
      createdAt: new Date(),
      user: null,
    })),
    save: jest.fn((notification: Notification) => {
      const existing = notifications.find(n => n.id === notification.id);
      if (existing) {
        Object.assign(existing, notification);
        return Promise.resolve(existing);
      }
      notifications.push(notification);
      return Promise.resolve(notification);
    }),
    find: jest.fn((options?: any) => {
      let result = [...notifications];
      if (options?.where?.userId) {
        result = result.filter(n => n.userId === options.where.userId);
      }
      if (options?.order?.createdAt === 'DESC') {
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      return Promise.resolve(result);
    }),
    findOne: jest.fn((options: any) => {
      const notification = notifications.find(n => n.id === options.where.id);
      return Promise.resolve(notification || null);
    }),
    delete: jest.fn((criteria: any) => {
      const before = notifications.length;
      notifications = notifications.filter(n => n.userId !== criteria.userId);
      return Promise.resolve({ affected: before - notifications.length });
    }),
    remove: jest.fn((notification: Notification) => {
      notifications = notifications.filter(n => n.id !== notification.id);
      return Promise.resolve(notification);
    }),
  };

  beforeEach(async () => {
    // Reset in-memory storage
    notifications = [];
    idCounter = 0;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    repository = module.get<Repository<Notification>>(getRepositoryToken(Notification));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new notification', async () => {
      const notificationData = {
        userId: 'user-123',
        title: 'Test Notification',
        message: 'This is a test message',
        type: NotificationType.INFO,
      };

      const result = await service.create(notificationData);

      expect(result.userId).toBe(notificationData.userId);
      expect(result.title).toBe(notificationData.title);
      expect(result.message).toBe(notificationData.message);
      expect(result.type).toBe(notificationData.type);
      expect(result.read).toBe(false);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('should create info notification', async () => {
      const info = {
        userId: 'user-123',
        title: 'Info',
        message: 'Information message',
        type: NotificationType.INFO,
      };

      const result = await service.create(info);

      expect(result.type).toBe(NotificationType.INFO);
    });

    it('should create warning notification', async () => {
      const warning = {
        userId: 'user-123',
        title: 'Warning',
        message: 'Warning message',
        type: NotificationType.WARNING,
      };

      const result = await service.create(warning);

      expect(result.type).toBe(NotificationType.WARNING);
    });

    it('should create error notification', async () => {
      const error = {
        userId: 'user-123',
        title: 'Error',
        message: 'Error message',
        type: NotificationType.ERROR,
      };

      const result = await service.create(error);

      expect(result.type).toBe(NotificationType.ERROR);
    });

    it('should create success notification', async () => {
      const success = {
        userId: 'user-123',
        title: 'Success',
        message: 'Success message',
        type: NotificationType.SUCCESS,
      };

      const result = await service.create(success);

      expect(result.type).toBe(NotificationType.SUCCESS);
    });

    it('should generate unique IDs for multiple notifications', async () => {
      const data = {
        userId: 'user-123',
        title: 'Test',
        message: 'Message',
        type: NotificationType.INFO,
      };

      const notification1 = await service.create(data);
      // Small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));
      const notification2 = await service.create(data);

      expect(notification1.id).not.toBe(notification2.id);
    });

    it('should create notification with current timestamp', async () => {
      const before = new Date();
      const notification = await service.create({
        userId: 'user-123',
        title: 'Test',
        message: 'Message',
        type: NotificationType.INFO,
      });
      const after = new Date();

      expect(notification.createdAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(notification.createdAt.getTime()).toBeLessThanOrEqual(
        after.getTime(),
      );
    });
  });

  describe('findByUserId', () => {
    it('should return notifications for specific user', async () => {
      await service.create({
        userId: 'user-123',
        title: 'Test 1',
        message: 'Message 1',
        type: NotificationType.INFO,
      });
      await service.create({
        userId: 'user-123',
        title: 'Test 2',
        message: 'Message 2',
        type: NotificationType.WARNING,
      });
      await service.create({
        userId: 'user-456',
        title: 'Other User',
        message: 'Message 3',
        type: NotificationType.INFO,
      });

      const result = await service.findByUserId('user-123');

      expect(result).toHaveLength(2);
      expect(result.every((n) => n.userId === 'user-123')).toBe(true);
    });

    it('should return empty array for user with no notifications', async () => {
      const result = await service.findByUserId('non-existent-user');

      expect(result).toEqual([]);
    });

    it('should return all notification types for a user', async () => {
      const userId = 'user-123';
      await service.create({
        userId,
        title: 'Info',
        message: 'Info msg',
        type: NotificationType.INFO,
      });
      await service.create({
        userId,
        title: 'Warning',
        message: 'Warning msg',
        type: NotificationType.WARNING,
      });
      await service.create({
        userId,
        title: 'Error',
        message: 'Error msg',
        type: NotificationType.ERROR,
      });
      await service.create({
        userId,
        title: 'Success',
        message: 'Success msg',
        type: NotificationType.SUCCESS,
      });

      const result = await service.findByUserId(userId);

      expect(result).toHaveLength(4);
      expect(result.map((n) => n.type)).toEqual([
        NotificationType.INFO,
        NotificationType.WARNING,
        NotificationType.ERROR,
        NotificationType.SUCCESS,
      ]);
    });

    it('should return both read and unread notifications', async () => {
      const userId = 'user-123';
      await new Promise(resolve => setTimeout(resolve, 10));
      const n1 = await service.create({
        userId,
        title: 'Unread',
        message: 'Unread msg',
        type: NotificationType.INFO,
      });
      await new Promise(resolve => setTimeout(resolve, 10));
      const n2 = await service.create({
        userId,
        title: 'Read',
        message: 'Read msg',
        type: NotificationType.INFO,
      });

      await service.markAsRead(n2.id);
      const result = await service.findByUserId(userId);

      expect(result).toHaveLength(2);
      const foundN1 = result.find((n) => n.id === n1.id);
      const foundN2 = result.find((n) => n.id === n2.id);
      expect(foundN1?.read).toBe(false);
      expect(foundN2?.read).toBe(true);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const notification = await service.create({
        userId: 'user-123',
        title: 'Test',
        message: 'Message',
        type: NotificationType.INFO,
      });

      const result = await service.markAsRead(notification.id);

      expect(result).not.toBeNull();
      expect(result?.read).toBe(true);
    });

    it('should throw NotFoundException for non-existent notification', async () => {
      await expect(service.markAsRead('non-existent-id')).rejects.toThrow(NotFoundException);
    });

    it('should keep notification as read after marking', async () => {
      const notification = await service.create({
        userId: 'user-123',
        title: 'Test',
        message: 'Message',
        type: NotificationType.INFO,
      });

      await service.markAsRead(notification.id);
      const found = await service.findByUserId('user-123');

      expect(found[0].read).toBe(true);
    });

    it('should handle marking already read notification', async () => {
      const notification = await service.create({
        userId: 'user-123',
        title: 'Test',
        message: 'Message',
        type: NotificationType.INFO,
      });

      await service.markAsRead(notification.id);
      const result = await service.markAsRead(notification.id);

      expect(result?.read).toBe(true);
    });
  });

  describe('deleteAll', () => {
    it('should delete all notifications for a user', async () => {
      await service.create({
        userId: 'user-123',
        title: 'Test 1',
        message: 'Message 1',
        type: NotificationType.INFO,
      });
      await service.create({
        userId: 'user-123',
        title: 'Test 2',
        message: 'Message 2',
        type: NotificationType.WARNING,
      });

      await service.deleteAll('user-123');
      const result = await service.findByUserId('user-123');

      expect(result).toEqual([]);
    });

    it('should not delete notifications from other users', async () => {
      await service.create({
        userId: 'user-123',
        title: 'User 123',
        message: 'Message',
        type: NotificationType.INFO,
      });
      await service.create({
        userId: 'user-456',
        title: 'User 456',
        message: 'Message',
        type: NotificationType.INFO,
      });

      await service.deleteAll('user-123');
      const user456Notifications = await service.findByUserId('user-456');

      expect(user456Notifications).toHaveLength(1);
    });

    it('should handle deleting for user with no notifications', async () => {
      await expect(service.deleteAll('non-existent-user')).resolves.not.toThrow();
    });

    it('should delete both read and unread notifications', async () => {
      const userId = 'user-123';
      const n1 = await service.create({
        userId,
        title: 'Unread',
        message: 'Msg',
        type: NotificationType.INFO,
      });
      const n2 = await service.create({
        userId,
        title: 'Read',
        message: 'Msg',
        type: NotificationType.INFO,
      });

      await service.markAsRead(n2.id);
      await service.deleteAll(userId);
      const result = await service.findByUserId(userId);

      expect(result).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long message', async () => {
      const longMessage = 'A'.repeat(5000);
      const notification = await service.create({
        userId: 'user-123',
        title: 'Long Message',
        message: longMessage,
        type: NotificationType.INFO,
      });

      expect(notification.message.length).toBe(5000);
    });

    it('should handle special characters in message', async () => {
      const specialMessage = '特殊字符 <html> & "quotes" \'apostrophe\'';
      const notification = await service.create({
        userId: 'user-123',
        title: 'Special',
        message: specialMessage,
        type: NotificationType.INFO,
      });

      expect(notification.message).toBe(specialMessage);
    });

    it('should handle multiple users with many notifications', async () => {
      for (let userId = 0; userId < 10; userId++) {
        for (let i = 0; i < 5; i++) {
          await service.create({
            userId: `user-${userId}`,
            title: `Notification ${i}`,
            message: `Message ${i}`,
            type: NotificationType.INFO,
          });
        }
      }

      const user5Notifications = await service.findByUserId('user-5');

      expect(user5Notifications).toHaveLength(5);
    });

    it('should handle rapid notification creation', async () => {
      const notifications = [];
      for (let i = 0; i < 10; i++) {
        const n = await service.create({
          userId: 'user-123',
          title: `Notification ${i}`,
          message: `Message ${i}`,
          type: NotificationType.INFO,
        });
        notifications.push(n);
        // Small delay between creates
        if (i % 2 === 0) await new Promise(resolve => setTimeout(resolve, 5));
      }

      expect(notifications).toHaveLength(10);
      // All notifications should be created
      expect(notifications.every(n => n.id && n.title)).toBe(true);
    });
  });
});
