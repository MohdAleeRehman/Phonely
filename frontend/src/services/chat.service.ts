import api from './api';
import type { Chat, Message, PaginatedResponse } from '../types';

export const chatService = {
  getChats: async () => {
    const response = await api.get<PaginatedResponse<Chat>>('/chats');
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
      { message }
    );
    return response.data.data.message;
  },

  markAsRead: async (chatId: string) => {
    const response = await api.patch(`/chats/${chatId}/read`);
    return response.data;
  },
};
