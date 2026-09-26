import { apiClient } from '@/services/api/client';
import type {
  ApiEnvelope,
  CreateLeaseRequest,
  Lease,
  LeaseListFilters,
  PaginationMeta,
  UpdateLeaseStatusRequest,
} from '../types/lease.types';

const unwrap = <T>(envelope: ApiEnvelope<T>): T => {
  if (envelope.data === null || envelope.data === undefined) {
    throw new Error(envelope.message || 'The server returned an empty response.');
  }
  return envelope.data;
};

export const leaseApi = {
  list: async (filters: LeaseListFilters = {}): Promise<{ leases: Lease[]; pagination: PaginationMeta | null }> => {
    const response = await apiClient.get<ApiEnvelope<Lease[]>>('/leases', { params: filters });
    return { leases: response.data.data ?? [], pagination: response.data.pagination ?? null };
  },

  create: async (payload: CreateLeaseRequest): Promise<Lease> => {
    const response = await apiClient.post<ApiEnvelope<Lease>>('/leases', payload);
    return unwrap(response.data);
  },

  updateStatus: async (leaseId: string, payload: UpdateLeaseStatusRequest): Promise<Lease> => {
    const response = await apiClient.patch<ApiEnvelope<Lease>>(`/leases/${leaseId}/status`, payload);
    return unwrap(response.data);
  },
};
