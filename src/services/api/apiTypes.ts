import { AxiosRequestConfig } from 'axios';

export interface CustomRequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
}
