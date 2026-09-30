import { apiClient } from '@/services/api/client';
import type { ApiEnvelope } from '@/features/leases/types/lease.types';
import type {
  Occupancy,
  CreateOccupancyRequest,
} from '../types/occupancy.types';
const unwrap = <T>(e: ApiEnvelope<T>): T => {
  if (!e.success || e.data == null)
    throw new Error(e.message || 'Empty occupancy response.');
  return e.data;
};
export const occupancyApi = {
  register: async (payload: CreateOccupancyRequest): Promise<Occupancy> =>
    unwrap(
      (await apiClient.post<ApiEnvelope<Occupancy>>('/occupancies', payload))
        .data
    ),
  forUnit: async (id: string): Promise<Occupancy[]> =>
    unwrap(
      (
        await apiClient.get<ApiEnvelope<Occupancy[]>>(
          `/occupancies/units/${id}`
        )
      ).data
    ),
  forResident: async (id: string): Promise<Occupancy[]> =>
    unwrap(
      (
        await apiClient.get<ApiEnvelope<Occupancy[]>>(
          `/occupancies/residents/${id}`
        )
      ).data
    ),
  deactivate: async (id: string): Promise<Occupancy> =>
    unwrap(
      (
        await apiClient.patch<ApiEnvelope<Occupancy>>(
          `/occupancies/${id}/status`
        )
      ).data
    ),
};
