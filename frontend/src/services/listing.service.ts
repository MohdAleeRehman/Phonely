import api from './api';
import type {
  Listing,
  CreateListingData,
  PaginatedResponse,
  PaginationParams,
} from '../types';

export interface ListingFilters extends PaginationParams {
  search?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  condition?: string;
  status?: string;
  ptaApproved?: boolean;
}

export const listingService = {
  getListings: async (filters: ListingFilters = {}) => {
    const response = await api.get<PaginatedResponse<Listing>>('/listings', {
      params: filters,
    });
    return response.data;
  },

  getListingById: async (id: string) => {
    const response = await api.get<{ status: string; data: { listing: Listing } }>(
      `/listings/${id}`
    );
    return response.data.data.listing;
  },

  createListing: async (data: CreateListingData) => {
    const response = await api.post<{ status: string; data: { listing: Listing } }>(
      '/listings',
      data
    );
    return response.data.data.listing;
  },

  updateListing: async (id: string, data: Partial<CreateListingData>) => {
    const response = await api.patch<{ status: string; data: { listing: Listing } }>(
      `/listings/${id}`,
      data
    );
    return response.data.data.listing;
  },

  deleteListing: async (id: string) => {
    const response = await api.delete(`/listings/${id}`);
    return response.data;
  },

  getMyListings: async () => {
    const response = await api.get<PaginatedResponse<Listing>>('/listings/my-listings');
    return response.data;
  },

  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('images', file); // Backend expects 'images' field name
    
    const response = await api.post<{ 
      status: string; 
      data: { 
        images: Array<{ 
          url: string; 
          publicId: string; 
          filename: string; 
          size: number; 
          width: number; 
          height: number; 
        }> 
      } 
    }>(
      '/upload/images', // Correct endpoint (plural)
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    // Backend returns array of image objects, we return the first URL
    return response.data.data.images[0].url;
  },

  getChatParticipants: async (listingId: string) => {
    const response = await api.get(`/listings/${listingId}/chat-participants`);
    return response.data.data.participants;
  },

  markAsSold: async (listingId: string, data: { soldTo?: string; soldOutside?: boolean }) => {
    const response = await api.patch(`/listings/${listingId}/sold`, data);
    return response.data;
  },
};
