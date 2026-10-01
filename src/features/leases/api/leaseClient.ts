import axios from 'axios';
import { requestInterceptor, responseErrorInterceptor } from '@/services/api/interceptors';

/**
 * Axios instance for lease-occupancy-service (port 8084, base path /api/v1).
 *
 * It has its own base URL because the shared apiClient points at another service and other
 * features depend on it. In development `/lease-occupancy-api` is proxied by Vite to the
 * service (see vite.config.ts), which avoids CORS; once the Gateway routes /api/v1/leases,
 * /api/v1/occupancies and /api/v1/units/{id}/active-occupancy, set VITE_LEASE_API_BASE_URL
 * to the Gateway, e.g. http://localhost:8080/api/v1.
 */
const baseURL = import.meta.env.VITE_LEASE_API_BASE_URL || '/lease-occupancy-api/api/v1';

export const leaseClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Same auth header and 401 handling as the shared client.
leaseClient.interceptors.request.use(requestInterceptor);
leaseClient.interceptors.response.use((response) => response, responseErrorInterceptor);
