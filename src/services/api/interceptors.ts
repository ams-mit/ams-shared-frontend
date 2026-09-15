import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { tokenStorage } from '@/services/storage/tokenStorage';
import { store } from '@/app/store';
import { sessionExpired } from '@/features/auth/store/authSlice';
import { ROUTES } from '@/constants/routes';

export const requestInterceptor = (
  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig => {
  const token = tokenStorage.getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

export const responseSuccessInterceptor = (response: AxiosResponse): AxiosResponse => {
  return response;
};

export const responseErrorInterceptor = (error: AxiosError): Promise<never> => {
  if (error.response && error.response.status === 401) {
    tokenStorage.clearTokens();
    store.dispatch(sessionExpired());

    if (typeof window !== 'undefined' && window.location.pathname !== ROUTES.LOGIN) {
      const loginUrl = `${ROUTES.LOGIN}?reason=session_expired`;
      window.location.replace(loginUrl);
    }
  }
  return Promise.reject(error);
};
