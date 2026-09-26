export const ROUTES = {
  DASHBOARD: '/',
  FACILITIES: '/facilities',
  RESERVATIONS: '/reservations',
  VISITORS: '/visitors',
  VISITORS_SCAN: '/visitors/scan',
  ANNOUNCEMENTS: '/announcements',
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];
