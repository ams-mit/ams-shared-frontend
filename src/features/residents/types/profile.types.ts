/** resident-management-service ProfileType. */
export type ProfileType = 'RESIDENT' | 'OWNER' | 'TENANT' | 'STAFF';

/** resident-management-service ProfileStatus. */
export type ProfileStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

/** resident-management-service ProfileResponse. */
export interface ResidentProfile {
  id: string;
  /** identity-access-service user id. */
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  status: ProfileStatus;
}

export interface CreateProfileRequest {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export type UpdateResidentRequest = Partial<Omit<CreateProfileRequest, 'userId'>>;

export interface ProfileListQuery {
  page?: number;
  size?: number;
  status?: ProfileStatus;
  search?: string;
  userId?: string;
}

/** resident-management-service PagedData<ProfileResponse>. */
export interface PagedProfiles {
  items: ResidentProfile[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
