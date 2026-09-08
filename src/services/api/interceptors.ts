import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { tokenStorage } from '@/services/storage/tokenStorage';

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
    // Optional redirect or event trigger for unauthorized state
  }
  return Promise.reject(error);
};
