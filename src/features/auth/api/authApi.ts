import apiClient from '@/services/api/client';
import type { User } from '../store/authSlice';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  mustChangePassword?: boolean;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  requestedRole: 'OWNER' | 'TENANT';
  password: string;
}

export interface RegisterResponse {
  message: string;
  id?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForceChangePasswordRequest {
  newPassword: string;
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/v1/auth/login', credentials);
    return response.data;
  },

  register: async (payload: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/v1/auth/register', payload);
    return response.data;
  },

  changePassword: async (payload: ChangePasswordRequest): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/v1/users/change-password', payload);
    return response.data;
  },

  forceChangePassword: async (payload: ForceChangePasswordRequest): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/v1/auth/force-change-password', payload);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/v1/users/me');
    return response.data;
  },
};

export default authApi;
