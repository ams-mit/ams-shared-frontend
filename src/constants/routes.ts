export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  RESIDENTS: '/residents',
  OWNERS: '/owners',
  STAFF: '/staff',
  USERS: '/admin/users',
  USER_DETAIL: '/admin/users/:userId',
  USER_CREATE: '/admin/users/create',
  ROLES: '/admin/roles',
  PROFILE: '/profile',
  PROFILE_CHANGE_PASSWORD: '/profile/change-password',
  FORCE_CHANGE_PASSWORD: '/auth/force-change-password',
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '*',
} as const;

export type RouteKey = keyof typeof ROUTES;

