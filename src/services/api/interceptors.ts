import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { tokenStorage } from '@/services/storage/tokenStorage';
import { store } from '@/app/store';
import { sessionExpired } from '@/features/auth/store/authSlice';
import { ROUTES } from '@/constants/routes';

export const requestInterceptor = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const token = tokenStorage.getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

export const responseErrorInterceptor = (error: AxiosError): Promise<never> => {
if (error.response && error.response.status === 401) {
    tokenStorage.clearTokens();
    store.dispatch(sessionExpired());

    if (typeof window !== 'undefined' && window.location.pathname !== ROUTES.LOGIN) {
      const loginUrl = `${ROUTES.LOGIN}?reason=session_expired`;
      window.location.replace(loginUrl);
    }
  } else if (error.response) {
    // Standard error structure extraction
    const responseData = error.response.data as { message?: string } | undefined;
    const errorMessage = responseData?.message || error.message || 'An unexpected error occurred';
    console.warn(`[API Error ${error.response.status}]: ${errorMessage}`);
  } else if (error.request) {
    console.warn('[API Network Error]: No response received from server.');
  }
  }
  return Promise.reject(error);
};
