import api from './api';

export interface CreateReportData {
  reportType: 'user' | 'listing';
  reportedUser?: string;
  reportedListing?: string;
  reason: string;
  description: string;
}

export interface Report {
  _id: string;
  reporter: string;
  reportedUser?: {
    _id: string;
    name: string;
    email: string;
  };
  reportedListing?: {
    _id: string;
    title: string;
  };
  reportType: 'user' | 'listing';
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const reportService = {
  createReport: async (data: CreateReportData): Promise<{ message: string; report: Report }> => {
    const response = await api.post('/reports', data);
    return response.data;
  },

  getMyReports: async (): Promise<Report[]> => {
    const response = await api.get('/reports/my-reports');
    return response.data;
  },

  getAllReports: async (status?: string, reportType?: string): Promise<Report[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (reportType) params.append('reportType', reportType);
    
    const response = await api.get(`/reports?${params.toString()}`);
    return response.data;
  },

  updateReportStatus: async (
    reportId: string,
    data: { status: string; adminNotes?: string }
  ): Promise<{ message: string; report: Report }> => {
    const response = await api.put(`/reports/${reportId}`, data);
    return response.data;
  },
};
