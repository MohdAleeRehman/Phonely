import api from './api';
import type { Chat, Message, ChatResponse } from '../types';

export const chatService = {
  getChats: async () => {
    const response = await api.get<ChatResponse>('/chats');
    return response.data;
  },

  getChatById: async (id: string) => {
    const response = await api.get<{ status: string; data: { chat: Chat; messages: Message[] } }>(
      `/chats/${id}`
    );
    return response.data.data;
  },

  createChat: async (listingId: string) => {
    const response = await api.post<{ status: string; data: { chat: Chat } }>('/chats', {
      listingId,
    });
    return response.data.data.chat;
  },

  sendMessage: async (chatId: string, message: string) => {
    const response = await api.post<{ status: string; data: { message: Message } }>(
      `/chats/${chatId}/messages`,
      { content: message }
    );
    return response.data.data.message;
  },

  markAsRead: async (chatId: string) => {
    const response = await api.put(`/chats/${chatId}/read`);
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get<{ status: string; data: { unreadCount: number } }>(
      '/chats/unread-count'
    );
    return response.data.data.unreadCount;
  },
};
