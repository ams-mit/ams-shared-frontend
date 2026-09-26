export const ROUTES = {
  DASHBOARD: '/',
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

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];
