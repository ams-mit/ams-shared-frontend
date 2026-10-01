import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { tokenStorage } from '@/services/storage/tokenStorage';
import { store } from '@/app/store';
import { sessionExpired } from '@/features/auth/store/authSlice';
import { ROUTES } from '@/constants/routes';
import { USE_MOCK_DATA } from '@/services/mock/mockMode';

export const requestInterceptor = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const token = tokenStorage.getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

export const responseErrorInterceptor = (error: AxiosError): Promise<never> => {
  // Demo build: requests are answered from local data, so the simulated offline error is expected.
  if (USE_MOCK_DATA) return Promise.reject(error);

  // Real services always reject the offline demo token. That isn't an expired session, so
  // keep the user signed in and let the page show the error (see toApiError).
  if (error.response?.status === 401 && tokenStorage.isDemoSession()) {
    console.warn('[API 401]: offline demo session; this service needs a real sign-in.');
  } else if (error.response && error.response.status === 401) {
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
  return Promise.reject(error);
};
