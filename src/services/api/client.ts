import axios from 'axios';
import {
  requestInterceptor,
  responseSuccessInterceptor,
  responseErrorInterceptor,
} from './interceptors';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(requestInterceptor);
apiClient.interceptors.response.use(
  responseSuccessInterceptor,
  responseErrorInterceptor
);

export default apiClient;
