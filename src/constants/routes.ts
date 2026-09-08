export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  RESIDENTS: '/residents',
  OWNERS: '/owners',
  STAFF: '/staff',
  USERS: '/admin/users',
  NOT_FOUND: '*',
} as const;

export type RouteKey = keyof typeof ROUTES;
