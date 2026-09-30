import axios from 'axios';
import { requestInterceptor, responseErrorInterceptor } from './interceptors';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(requestInterceptor);
apiClient.interceptors.response.use((response) => response, responseErrorInterceptor);

export default apiClient;
