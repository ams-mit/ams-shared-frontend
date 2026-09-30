import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';
import { ROLES, type UserRole } from '@/constants/roles';
/** Claims are used for UI visibility only; the gateway and services enforce authorization. */
export const readTokenClaims = (
  token: string | null
): { sub?: string; roles?: UserRole[] } => {
  try {
    if (!token) return {};
    const raw = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(atob(raw));
    return {
      sub: typeof claims.sub === 'string' ? claims.sub : undefined,
      roles: Array.isArray(claims.roles)
        ? claims.roles.filter((r: unknown) =>
            Object.values(ROLES).includes(r as UserRole)
          )
        : [],
    };
  } catch {
    return {};
  }
};
export const selectGrantedRoles = createSelector(
  [(state: RootState) => state.auth.token],
  (token) => readTokenClaims(token).roles ?? []
);
export const selectAuthenticatedId = (state: RootState): string =>
  readTokenClaims(state.auth.token).sub ?? state.auth.user?.id ?? '';
