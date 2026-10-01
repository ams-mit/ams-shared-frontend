import {
  GATEWAY_BASE_URL,
  createStandardClient,
  isServiceOffline,
  toServiceError,
  unwrapEnvelope,
  withMockFallback as withStandardFallback,
  type StandardEnvelope,
} from '@/services/api/standardClient';
import type {
  CreateProfileRequest,
  PagedProfiles,
  ProfileListQuery,
  ProfileType,
  ResidentProfile,
  UpdateResidentRequest,
} from '../types/profile.types';

/**
 * Axios instance for resident-management-service, reached through the central API gateway.
 * Set VITE_RESIDENT_API_BASE_URL=http://localhost:8081/api/v1 to call the service directly.
 */
const baseURL = import.meta.env.VITE_RESIDENT_API_BASE_URL || GATEWAY_BASE_URL;

export const residentClient = createStandardClient(baseURL);

export const RESIDENT_ERROR_MESSAGES: Record<string, string> = {
  PERMISSION_DENIED: 'Your role does not have permission to view or change these profiles.',
  USER_NOT_FOUND: 'No user account exists for this user ID.',
  RESIDENT_NOT_FOUND: 'This resident profile could not be found.',
  OWNER_NOT_FOUND: 'This owner profile could not be found.',
  TENANT_NOT_FOUND: 'This tenant profile could not be found.',
  STAFF_NOT_FOUND: 'This staff profile could not be found.',
  RESIDENT_ALREADY_EXISTS: 'This user already has a resident profile.',
  OWNER_ALREADY_EXISTS: 'This user already has an owner profile.',
  TENANT_ALREADY_EXISTS: 'This user already has a tenant profile.',
  STAFF_ALREADY_EXISTS: 'This user already has a staff profile.',
  DEPENDENCY_UNAVAILABLE: 'The identity service is temporarily unavailable. Please try again in a moment.',
};

export const toResidentError = (err: unknown, fallbackMessage: string) =>
  toServiceError(err, fallbackMessage, RESIDENT_ERROR_MESSAGES);

export const withResidentFallback = <T>(real: () => Promise<T>, mock: () => Promise<T>, fallbackMessage: string) =>
  withStandardFallback(real, mock, fallbackMessage, { codeMessages: RESIDENT_ERROR_MESSAGES });

const PATHS: Record<ProfileType, string> = {
  RESIDENT: '/residents',
  OWNER: '/owners',
  TENANT: '/tenants',
  STAFF: '/staff',
};

/** The service caps page size at 100. */
const MAX_PAGE_SIZE = 100;

const call = async <T>(request: () => Promise<{ data: StandardEnvelope<T> }>, fallbackMessage: string): Promise<T> => {
  try {
    return unwrapEnvelope((await request()).data);
  } catch (err) {
    // Unreachable-service errors pass through untouched so withResidentFallback can detect them.
    throw isServiceOffline(err) ? err : toResidentError(err, fallbackMessage);
  }
};

/**
 * resident-management-service profile endpoints. Listing and creating require
 * SYSTEM_ADMINISTRATOR or APARTMENT_MANAGER; reading one profile (and updating a resident
 * profile) also works for the profile's own user. There is no mock fallback here, so callers
 * decide how to handle an unreachable service (see withResidentFallback).
 */
export const residentProfileApi = {
  // GET /{type}
  list: (type: ProfileType, query: ProfileListQuery = {}): Promise<PagedProfiles> =>
    call(
      () => residentClient.get<StandardEnvelope<PagedProfiles>>(PATHS[type], { params: query }),
      'Profiles could not be loaded.'
    ),

  /** Every page of GET /{type}. */
  listAll: async (type: ProfileType, query: Omit<ProfileListQuery, 'page' | 'size'> = {}): Promise<ResidentProfile[]> => {
    const profiles: ResidentProfile[] = [];
    for (let page = 0; ; page += 1) {
      const result = await residentProfileApi.list(type, { ...query, page, size: MAX_PAGE_SIZE });
      profiles.push(...result.items);
      if (page + 1 >= result.totalPages) return profiles;
    }
  },

  // GET /{type}/{id} — not available for staff.
  get: (type: Exclude<ProfileType, 'STAFF'>, id: string): Promise<ResidentProfile> =>
    call(
      () => residentClient.get<StandardEnvelope<ResidentProfile>>(`${PATHS[type]}/${id}`),
      'This profile could not be loaded.'
    ),

  // POST /{type} — 201; 409 when the user already has a profile of this type.
  create: (type: ProfileType, payload: CreateProfileRequest): Promise<ResidentProfile> =>
    call(
      () => residentClient.post<StandardEnvelope<ResidentProfile>>(PATHS[type], payload),
      'The profile could not be created.'
    ),

  // PATCH /residents/{id} — only resident profiles can be updated.
  updateResident: (id: string, payload: UpdateResidentRequest): Promise<ResidentProfile> =>
    call(
      () => residentClient.patch<StandardEnvelope<ResidentProfile>>(`${PATHS.RESIDENT}/${id}`, payload),
      'The profile could not be saved.'
    ),
};
