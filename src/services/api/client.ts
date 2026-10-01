import axios from 'axios';
import { requestInterceptor, responseErrorInterceptor } from './interceptors';
import { applyMockAdapter } from '@/services/mock/mockMode';

import { GATEWAY_BASE_URL } from './standardClient';

const baseURL = import.meta.env.VITE_API_BASE_URL || GATEWAY_BASE_URL;

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(requestInterceptor);
apiClient.interceptors.response.use((response) => response, responseErrorInterceptor);
applyMockAdapter(apiClient);
