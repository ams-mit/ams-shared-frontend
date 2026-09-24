export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  status: number;
  message: string;
  timestamp?: string;
  error?: string;
}
