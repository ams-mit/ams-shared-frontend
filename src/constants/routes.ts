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
  PROFILE_EDIT: '/profile/edit',
  PROFILE_EMAIL_CHANGE: '/profile/email',
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
  USER_EDIT: '/admin/users/:userId/edit',
  ROLES: '/admin/roles',
  RELATIONSHIPS: '/relationships',
  RELATIONSHIP_REQUEST: '/relationships/request',
  RELATIONSHIP_REVIEW: '/admin/relationship-requests',

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

  // Group 3 — Billing, Charges, Invoices & Payments
  CHARGES: '/charges',
  INVOICES: '/invoices',
  PAYMENTS: '/payments',
  RECEIPTS: '/receipts',
  UTILITIES: '/utilities',
  FINANCE_DASHBOARD: '/finance-dashboard',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type AppRoute = typeof ROUTES[keyof typeof ROUTES];

export const buildUserDetailPath = (userId: string): string =>
  ROUTES.USER_DETAIL.replace(':userId', encodeURIComponent(userId));

export const buildUserEditPath = (userId: string): string =>
  ROUTES.USER_EDIT.replace(':userId', encodeURIComponent(userId));
