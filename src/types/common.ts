export type Nullable<T> = T | null;

export type UserRole = 'ADMIN' | 'MANAGER' | 'OWNER' | 'TENANT' | 'STAFF';

export type RelationshipStatus =
  | 'OWNER'
  | 'TENANT'
  | 'STAFF'
  | 'RESIDENT'
  | 'NONE';

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
