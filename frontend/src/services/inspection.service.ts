import api from './api';
import type { Inspection } from '../types';

export const inspectionService = {
  startInspection: async (
    listingId: string,
    images: Array<{ url: string; type?: string; order?: number }>,
    phoneDetails: { 
      brand: string; 
      model: string; 
      storage: string; 
      ram: string;
      color: string;
      condition: string;
      hasBox: boolean;
      hasWarranty: boolean;
      launchDate: string;
      retailPrice: number;
      ptaApproved: boolean;
    },
    description: string
  ) => {
    const response = await api.post<{
      status: string;
      data: { inspectionId: string; message: string };
    }>('/inspections/start', {
      listingId,
      images,
      phoneDetails,
      description,
    });
    return response.data.data;
  },

  getInspectionStatus: async (inspectionId: string) => {
    const response = await api.get<{ 
      status: string; 
      data: { 
        inspectionId: string; 
        status: string; 
        processingTime?: Record<string, number>; 
        createdAt: string; 
        updatedAt: string; 
      } 
    }>(
      `/inspections/${inspectionId}/status`
    );
    return response.data.data; // Return data directly, not data.inspection
  },

  getInspectionReport: async (inspectionId: string) => {
    const response = await api.get<{ status: string; data: { inspection: Inspection } }>(
      `/inspections/${inspectionId}/report`
    );
    return response.data.data.inspection;
  },
};
