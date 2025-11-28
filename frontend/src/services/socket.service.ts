import { io, Socket } from 'socket.io-client';
import type { Message } from '../types';

// Derive socket URL from VITE_API_URL if available. Otherwise, at runtime use production API host
let SOCKET_URL = '';
if (import.meta.env.VITE_API_URL) {
  SOCKET_URL = import.meta.env.VITE_API_URL.replace('/api/v1', '');
} else if (typeof window !== 'undefined' && window.location.hostname.includes('phonely.com')) {
  SOCKET_URL = 'https://api.phonely.com.pk';
} else {
  SOCKET_URL = 'http://localhost:3000';
}

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinChat(chatId: string) {
    this.socket?.emit('join-chat', chatId);
  }

  leaveChat(chatId: string) {
    this.socket?.emit('leave-chat', chatId);
  }

  sendMessage(chatId: string, message: string) {
    this.socket?.emit('send-message', { chatId, message });
  }

  onNewMessage(callback: (data: Message) => void) {
    this.socket?.on('new-message', callback);
  }

  onTyping(callback: (data: { chatId: string; userId: string }) => void) {
    this.socket?.on('typing', callback);
  }

  onStopTyping(callback: (data: { chatId: string; userId: string }) => void) {
    this.socket?.on('stop-typing', callback);
  }

  emitTyping(chatId: string) {
    this.socket?.emit('typing', chatId);
  }

  emitStopTyping(chatId: string) {
    this.socket?.emit('stop-typing', chatId);
  }

  off(event: string) {
    this.socket?.off(event);
  }
}

export const socketService = new SocketService();
