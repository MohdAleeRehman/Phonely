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
    reportId: string;
    conditionScore: number;
    detectedIssues: string[];
    authenticityScore: number;
    completedAt: string;
    aiSuggestedPriceRange?: { min: number; max: number };
    // Also support the AI inspection format
    inspection_id?: string;
    overall_score?: number;
    condition_assessment?: string;
    pricing_analysis?: {
      market_value: number;
      recommended_price: number;
      price_range: { min: number; max: number };
    };
    recommendations?: string[];
  };
}

export interface WaitlistEntry {
  _id: string;
  name: string;
  email: string;
  source: string;
  notified: boolean;
  createdAt: string;
}

export interface WaitlistResponse {
  waitlist: WaitlistEntry[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
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
    const response = await api.get<{ 
      status: string; 
      data: { 
        stats: {
          users: { total: number; active: number; verified: number };
          listings: { total: number; active: number; sold: number };
        };
        recentActivity: {
          users: User[];
          listings: Listing[];
        };
      }
    }>('/admin/dashboard');
    
    // Transform nested response to flat structure
    const { stats, recentActivity } = response.data.data;
    return {
      totalUsers: stats.users.total,
      totalListings: stats.listings.total,
      activeListings: stats.listings.active,
      soldListings: stats.listings.sold,
      totalRevenue: 0, // Not provided by backend yet
      recentUsers: recentActivity.users,
      recentListings: recentActivity.listings,
    };
  },

  getUsers: async (page = 1, limit = 10) => {
    const response = await api.get<PaginatedResponse<User>>('/admin/users', {
      params: { page, limit },
    });
    return response.data;
  },

  getListings: async (status = 'all', page = 1, limit = 10) => {
    const params: Record<string, string | number> = { page, limit };
    // Only add status param if it's not 'all'
    if (status && status !== 'all') {
      params.status = status;
    }
    
    const response = await api.get<PaginatedResponse<Listing>>('/admin/listings', {
      params,
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

  getReports: async (status?: string, reportType?: string) => {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    if (reportType) params.reportType = reportType;
    
    const response = await api.get('/reports', { params });
    return response.data;
  },

  updateReportStatus: async (reportId: string, data: { status: string; adminNotes?: string }) => {
    const response = await api.put(`/reports/${reportId}`, data);
    return response.data;
  },

  getWaitlist: async (page = 1, limit = 50) => {
    const response = await api.get<{ status: string; data: WaitlistResponse }>('/waitlist', {
      params: { page, limit },
    });
    return response.data.data;
  },

  removeFromWaitlist: async (entryId: string) => {
    const response = await api.delete(`/waitlist/${entryId}`);
    return response.data;
  },
};
