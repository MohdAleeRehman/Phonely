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

export interface UserDetails extends User {
  stats: {
    totalListings: number;
    activeListings: number;
    soldListings: number;
    totalInspections: number;
    completedInspections: number;
  };
  recentListings: Listing[];
}

export interface ListingDetails extends Listing {
  inspectionReport?: {
    inspection_id: string;
    overall_score: number;
    condition_assessment: string;
    pricing_analysis: {
      market_value: number;
      recommended_price: number;
      price_range: { min: number; max: number };
    };
    recommendations: string[];
  };
}

export interface PlatformAnalytics {
  userGrowth: Array<{ date: string; count: number }>;
  listingGrowth: Array<{ date: string; count: number }>;
  listingsByBrand: Array<{ brand: string; count: number }>;
  listingsByCondition: Array<{ condition: string; count: number }>;
  ptaStats: {
    ptaApproved: { count: number; avgPrice: number };
    nonPta: { count: number; avgPrice: number };
  };
  avgPriceByBrand: Array<{ brand: string; avgPrice: number }>;
  period: string;
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

  // New endpoints
  getAnalytics: async (period = 30) => {
    const response = await api.get<{ status: string; data: PlatformAnalytics }>('/admin/analytics', {
      params: { period },
    });
    return response.data.data;
  },

  getUserDetails: async (userId: string) => {
    const response = await api.get<{ status: string; data: UserDetails }>(`/admin/users/${userId}`);
    return response.data.data;
  },

  toggleUserBan: async (userId: string) => {
    const response = await api.patch<{ status: string; data: User }>(`/admin/users/${userId}/ban`);
    return response.data.data;
  },

  getListingDetails: async (listingId: string) => {
    const response = await api.get<{ status: string; data: ListingDetails }>(`/admin/listings/${listingId}`);
    return response.data.data;
  },

  updateListingStatus: async (listingId: string, status: 'draft' | 'active' | 'sold' | 'removed' | 'expired') => {
    const response = await api.patch<{ status: string; data: Listing }>(`/admin/listings/${listingId}/status`, {
      status,
    });
    return response.data.data;
  },
};
