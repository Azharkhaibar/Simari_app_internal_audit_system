import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({
  cors: { origin: 'http://localhost:5173', credentials: true },
  namespace: '/notifications',
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  // socket.id => userId
  private readonly clients = new Map<string, number>();


  handleConnection(client: Socket) {
    const token = client.handshake.auth?.token;
    if (!token) {
      client.disconnect(true);
      return;
    }

    const user = this.verifyToken(token);
    if (!user) {
      client.disconnect(true);
      return;
    }

    this.clients.set(client.id, user.userId);
    client.join(`user:${user.userId}`);

    this.logger.log(`WS connected: user=${user.userId}, socket=${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const userId = this.clients.get(client.id);
    if (userId) {
      this.clients.delete(client.id);
      this.logger.log(`WS disconnected: user=${userId}, socket=${client.id}`);
    }
  }

  sendNotificationToUser(userId: number, payload: any): boolean {
    try {
      this.server.to(`user:${userId}`).emit('notification', payload);
      return true;
    } catch (e) {
      return false;
    }
  }

  sendNotificationToAll(payload: any): void {
    this.server.emit('notification:broadcast', payload);
  }

  broadcastUserStatus(userId: number, status: 'online' | 'offline'): void {
    this.server.emit('user:status', {
      userId,
      status,
      timestamp: new Date().toISOString(),
    });
  }

  // ==================== EMITTER METHODS ====================

  sendToUser(userId: number, payload: any) {
    this.server.to(`user:${userId}`).emit('notification', payload);
  }

  sendToAll(payload: any) {
    this.server.emit('notification:broadcast', payload);
  }

  emitLoginEvent(userId: number, meta: any) {
    this.sendToUser(userId, {
      type: 'LOGIN',
      ...meta,
      timestamp: new Date().toISOString(),
    });
  }

  emitLogoutEvent(userId: number, meta: any) {
    this.sendToUser(userId, {
      type: 'LOGOUT',
      ...meta,
      timestamp: new Date().toISOString(),
    });
  }

  // ==================== TOKEN VERIFY ====================

  private verifyToken(token: string): { userId: number } | null {
    try {
      const secret = process.env.JWT_SECRET as string;
      const decoded = jwt.verify(token, secret) as any;

      const userId = Number(decoded.sub);
      if (Number.isNaN(userId)) return null;

      return { userId };
    } catch {
      return null;
    }
  }
}
