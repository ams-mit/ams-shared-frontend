import { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from '../storage/tokenStorage';

export const requestInterceptor = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const token = tokenStorage.getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

export const responseErrorInterceptor = (error: AxiosError): Promise<never> => {
  if (error.response) {
    // Standard error structure extraction
    const responseData = error.response.data as { message?: string } | undefined;
    const errorMessage = responseData?.message || error.message || 'An unexpected error occurred';
    console.warn(`[API Error ${error.response.status}]: ${errorMessage}`);
  } else if (error.request) {
    console.warn('[API Network Error]: No response received from server.');
  }
  return Promise.reject(error);
};
