import api from './api';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  ResendVerificationData,
} from '../types';

export interface AdminOTPResponse {
  status: string;
  message: string;
  data: {
    requiresOtp: boolean;
    email: string;
    userId: string;
  };
}

export interface VerifyAdminOTPData {
  userId: string;
  otp: string;
}

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post<AuthResponse | AdminOTPResponse>('/auth/login', credentials);
    return response.data;
  },

  verifyAdminOTP: async (data: VerifyAdminOTPData) => {
    const response = await api.post<AuthResponse>('/auth/verify-admin-otp', data);
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await api.get(`/auth/verify-email/${token}`);
    return response.data;
  },

  resendVerification: async (data: ResendVerificationData) => {
    const response = await api.post('/auth/resend-verification', data);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
