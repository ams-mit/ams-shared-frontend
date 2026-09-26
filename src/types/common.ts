export type StatusType = 'ACTIVE' | 'INACTIVE';

export interface BaseEntity {
  id: number;
  createdAt?: string;
}

export type SortDirection = 'asc' | 'desc';

export type RelationshipStatus =
  | 'OWNER'
  | 'TENANT'
  | 'STAFF'
  | 'RESIDENT'
  | 'NONE';

export interface PaginationParams {
  page: number;
  limit: number;
}
