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
  private connectionCount = 0;
  private currentUserId: string | null = null;

  connect(token: string, userId: string) {
    // Increment connection counter
    this.connectionCount++;
    this.currentUserId = userId;
    
    if (this.socket?.connected) {
      // Re-register user in case socket reconnected
      this.socket.emit('register-user', userId);
      return;
    }

    // Clean up any existing socket before creating new one
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'], // Allow fallback to polling
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      // Register user with their socket
      if (this.currentUserId) {
        this.socket?.emit('register-user', this.currentUserId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  disconnect() {
    // Decrement connection counter
    this.connectionCount--;
    
    // Only actually disconnect when no more components need the connection
    if (this.connectionCount <= 0) {
      this.connectionCount = 0;
      if (this.socket) {
        this.socket.removeAllListeners();
        this.socket.disconnect();
        this.socket = null;
      }
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

  onMessagesRead(callback: (data: { chatId: string; userId: string }) => void) {
    this.socket?.on('messages-read', callback);
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
