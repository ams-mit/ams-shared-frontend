export const ROUTES = {
export const ROUTES = {
  // Base & Auth Routes (loginscreen)
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  FORCE_CHANGE_PASSWORD: '/auth/force-change-password',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  PROFILE_CHANGE_PASSWORD: '/profile/change-password',
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '*',

  // User Management (loginscreen)
  RESIDENTS: '/residents',
  OWNERS: '/owners',
  STAFF: '/staff',
  USERS: '/admin/users',
  USER_DETAIL: '/admin/users/:userId',
  USER_CREATE: '/admin/users/create',
  ROLES: '/admin/roles',

  // Community & Property Features (main)
  FACILITIES: '/facilities',
  RESERVATIONS: '/reservations',
  VISITORS: '/visitors',
  VISITORS_SCAN: '/visitors/scan',
  ANNOUNCEMENTS: '/announcements',
  UNITS: '/units',
  LEASES: '/leases',
  BUILDINGS: '/buildings',
  FLOORS: '/floors',
  OWNERSHIPS: '/ownerships',
  MY_RESIDENCE: '/my-residence',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type AppRoute = typeof ROUTES[keyof typeof ROUTES];