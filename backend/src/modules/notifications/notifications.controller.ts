import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification } from './entities/notification.entity';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create notification', description: 'Cria uma nova notificação para um usuário' })
  @ApiResponse({ status: 201, description: 'Notification created successfully.', type: Notification })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation failed.' })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications', description: 'Lista todas as notificações do sistema' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully.', type: [Notification] })
  findAll() {
    return this.notificationsService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get notifications by user ID', description: 'Lista todas as notificações de um usuário específico' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully.', type: [Notification] })
  findByUserId(@Param('userId') userId: string) {
    return this.notificationsService.findByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by id', description: 'Busca uma notificação específica pelo ID' })
  @ApiResponse({ status: 200, description: 'Notification retrieved successfully.', type: Notification })
  @ApiResponse({ status: 404, description: 'Notification not found.' })
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read', description: 'Marca uma notificação como lida' })
  @ApiResponse({ status: 200, description: 'Notification marked as read.', type: Notification })
  @ApiResponse({ status: 404, description: 'Notification not found.' })
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification', description: 'Remove uma notificação específica' })
  @ApiResponse({ status: 200, description: 'Notification deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Notification not found.' })
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }

  @Delete('user/:userId')
  @ApiOperation({ summary: 'Delete all notifications for user', description: 'Remove todas as notificações de um usuário' })
  @ApiResponse({ status: 200, description: 'Notifications deleted successfully.' })
  deleteAll(@Param('userId') userId: string) {
    return this.notificationsService.deleteAll(userId);
  }
}
