export const ROUTES = {
  DASHBOARD: '/',
  FACILITIES: '/facilities',
  RESERVATIONS: '/reservations',
  VISITORS: '/visitors',
  ANNOUNCEMENTS: '/announcements',
  UNITS: '/units',
  LEASES: '/leases',
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];
