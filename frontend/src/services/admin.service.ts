import api from './api';
import type { User, Listing, PaginatedResponse } from '../types';

export interface AdminStats {
  totalUsers: number;
  totalListings: number;
  activeListings: number;
  soldListings: number;
  totalRevenue: number;
  recentUsers: User[];
  recentListings: Listing[];
}

export const adminService = {
  getDashboard: async () => {
    const response = await api.get<{ status: string; data: AdminStats }>('/admin/dashboard');
    return response.data.data;
  },

  getUsers: async (page = 1, limit = 10) => {
    const response = await api.get<PaginatedResponse<User>>('/admin/users', {
      params: { page, limit },
    });
    return response.data;
  },

  getListings: async (status = 'all', page = 1, limit = 10) => {
    const response = await api.get<PaginatedResponse<Listing>>('/admin/listings', {
      params: { status, page, limit },
    });
    return response.data;
  },

  deleteUser: async (userId: string) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  deleteListing: async (listingId: string) => {
    const response = await api.delete(`/admin/listings/${listingId}`);
    return response.data;
  },
};
