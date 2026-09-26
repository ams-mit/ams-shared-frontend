import apiClient from '@/services/api/client';
import type { UserRole } from '@/types/common';
import type { User } from '@/features/auth/store/authSlice';

export interface GetUsersParams {
  search?: string;
  status?: string;
  role?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedUsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  temporaryPassword?: string;
  role?: UserRole;
}

export interface RoleReference {
  id: string;
  name: UserRole;
  description: string;
  permissions?: string[];
}

export const userApi = {
  getUsers: async (params?: GetUsersParams): Promise<PaginatedUsersResponse> => {
    const response = await apiClient.get<PaginatedUsersResponse>('/v1/users', { params });
    return response.data;
  },

  getUserById: async (userId: string): Promise<User> => {
    const response = await apiClient.get<User>(`/v1/users/${userId}`);
    return response.data;
  },

  createUser: async (payload: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post<User>('/v1/users', payload);
    return response.data;
  },

  updateUserStatus: async (userId: string, status: string): Promise<User> => {
    const response = await apiClient.patch<User>(`/v1/users/${userId}/status`, { status });
    return response.data;
  },

  assignUserRole: async (userId: string, role: UserRole): Promise<User> => {
    const response = await apiClient.post<User>(`/v1/users/${userId}/roles`, { role });
    return response.data;
  },

  removeUserRole: async (userId: string, role: UserRole): Promise<User> => {
    const response = await apiClient.delete<User>(`/v1/users/${userId}/roles/${role}`);
    return response.data;
  },

  getRoles: async (): Promise<RoleReference[]> => {
    const response = await apiClient.get<RoleReference[]>('/v1/roles');
    return response.data;
  },
};

export default userApi;
