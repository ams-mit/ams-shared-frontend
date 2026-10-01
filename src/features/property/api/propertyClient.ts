import axios from 'axios';
import { requestInterceptor, responseErrorInterceptor } from '@/services/api/interceptors';
import { applyMockAdapter } from '@/services/mock/mockMode';
import { GATEWAY_BASE_URL } from '@/services/api/standardClient';
import type { ApiEnvelope } from '@/features/leases/types/lease.types';

/**
 * Axios instance for property-unit-service (port 8082, base path /api/v1).
 *
 * Like leaseClient, it has its own base URL so the shared apiClient used by other features is
 * untouched. In development `/property-unit-api` is proxied by Vite to the service (see
 * vite.config.ts); set VITE_PROPERTY_API_BASE_URL to the Gateway once it routes property APIs.
 */
const baseURL = import.meta.env.VITE_PROPERTY_API_BASE_URL || GATEWAY_BASE_URL;

export const propertyClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

propertyClient.interceptors.request.use(requestInterceptor);
propertyClient.interceptors.response.use((response) => response, responseErrorInterceptor);
applyMockAdapter(propertyClient);

/** The service caps page size at 100. */
const PAGE_SIZE = 100;

/** Reads every page of a paginated collection route. */
export const fetchAllPages = async <T>(path: string, params: Record<string, unknown> = {}): Promise<T[]> => {
  const items: T[] = [];
  for (let page = 0; ; page += 1) {
    const response = await propertyClient.get<ApiEnvelope<T[]>>(path, { params: { ...params, page, size: PAGE_SIZE } });
    items.push(...(response.data.data ?? []));
    if (!response.data.pagination?.hasNext) return items;
  }
};
