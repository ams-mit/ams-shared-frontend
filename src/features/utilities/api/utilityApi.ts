// src/features/utilities/api/utilityApi.ts
import { apiClient } from '@/services/api/client';
import type { ApiResponse, ApiListResponse } from '@/features/billing/types/billing.types';
import type {
  UtilityRate,
  CreateUtilityRateRequest,
  UtilityCharge,
  CreateUtilityChargeRequest,
} from '../types/utility.types';

export const utilityApi = {
  createRate: async (data: CreateUtilityRateRequest): Promise<UtilityRate> => {
    const res = await apiClient.post<ApiResponse<UtilityRate>>('/utility-rates', data);
    return res.data.data;
  },

  getRates: async (): Promise<UtilityRate[]> => {
    const res = await apiClient.get<ApiResponse<UtilityRate[]>>('/utility-rates');
    return res.data.data;
  },

  updateRateStatus: async (utilityRateId: number, status: 'ACTIVE' | 'INACTIVE'): Promise<UtilityRate> => {
    const res = await apiClient.patch<ApiResponse<UtilityRate>>(`/utility-rates/${utilityRateId}/status`, { status });
    return res.data.data;
  },

  createCharge: async (data: CreateUtilityChargeRequest): Promise<UtilityCharge> => {
    const res = await apiClient.post<ApiResponse<UtilityCharge>>('/utility-charges', data);
    return res.data.data;
  },

  getCharges: async (params?: { page?: number; size?: number; unitId?: string }): Promise<ApiListResponse<UtilityCharge>> => {
    const res = await apiClient.get<ApiListResponse<UtilityCharge>>('/utility-charges', { params });
    return res.data;
  },

  getChargesByUnit: async (unitId: string): Promise<UtilityCharge[]> => {
    const res = await apiClient.get<ApiResponse<UtilityCharge[]>>(`/utility-charges/units/${unitId}`);
    return res.data.data;
  },

  deleteCharge: async (utilityChargeId: number): Promise<void> => {
    await apiClient.delete(`/utility-charges/${utilityChargeId}`);
  },
};