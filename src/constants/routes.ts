export const ROUTES = {
  DASHBOARD: '/',
  FACILITIES: '/facilities',
  RESERVATIONS: '/reservations',
  VISITORS: '/visitors',
  ANNOUNCEMENTS: '/announcements',
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];
