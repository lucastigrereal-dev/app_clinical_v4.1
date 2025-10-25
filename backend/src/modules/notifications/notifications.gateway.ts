import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Cliente conectou
   */
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  /**
   * Cliente desconectou
   */
  handleDisconnect(client: Socket) {
    // Remove user from connected users
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        this.logger.log(`User ${userId} disconnected`);
        break;
      }
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Registrar usuário conectado
   */
  @SubscribeMessage('register')
  handleRegister(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.connectedUsers.set(data.userId, client.id);
    this.logger.log(`User ${data.userId} registered with socket ${client.id}`);

    return {
      event: 'registered',
      data: { success: true, userId: data.userId },
    };
  }

  /**
   * Enviar notificação para usuário específico
   */
  async sendToUser(userId: string, notification: any) {
    const socketId = this.connectedUsers.get(userId);

    if (socketId) {
      this.server.to(socketId).emit('notification', notification);
      this.logger.log(`Notification sent to user ${userId}`);
      return true;
    }

    this.logger.warn(`User ${userId} not connected`);
    return false;
  }

  /**
   * Broadcast para todos os usuários conectados
   */
  broadcast(notification: any) {
    this.server.emit('notification', notification);
    this.logger.log('Notification broadcasted to all users');
  }

  /**
   * Enviar notificação para role específica (admin, doctor, patient)
   */
  async sendToRole(role: string, notification: any) {
    this.server.emit(`notification:${role}`, notification);
    this.logger.log(`Notification sent to role: ${role}`);
  }

  /**
   * Obter lista de usuários conectados
   */
  @SubscribeMessage('getConnectedUsers')
  handleGetConnectedUsers() {
    const users = Array.from(this.connectedUsers.keys());
    return {
      event: 'connectedUsers',
      data: { users, count: users.length },
    };
  }

  /**
   * Ping/Pong para manter conexão viva
   */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  /**
   * Marcar notificação como lida
   */
  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { notificationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Aqui você pode chamar o service para marcar como lida no banco
      // await this.notificationsService.markAsRead(data.notificationId);

      return {
        event: 'notificationRead',
        data: { success: true, notificationId: data.notificationId },
      };
    } catch (error) {
      this.logger.error(`Error marking notification as read: ${error.message}`);
      return {
        event: 'error',
        data: { message: 'Failed to mark notification as read' },
      };
    }
  }

  /**
   * Enviar alerta de emergência
   */
  async sendEmergencyAlert(userId: string, alert: any) {
    const socketId = this.connectedUsers.get(userId);

    if (socketId) {
      this.server.to(socketId).emit('emergency', {
        ...alert,
        priority: 'HIGH',
        timestamp: new Date().toISOString(),
      });
      this.logger.warn(`Emergency alert sent to user ${userId}`);
      return true;
    }

    return false;
  }
}
