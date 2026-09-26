import { ROUTES } from '@/constants/routes';
import { DashboardPage } from '@/features/dashboard';
import { FacilitiesPage, ReservationsPage } from '@/features/facilities';
import { VisitorsPage } from '@/features/visitors';
import { AnnouncementsPage } from '@/features/announcements';
import { UnitsPage } from '@/features/units';
import { LeasesPage } from '@/features/leases';
import { BuildingsPage, FloorsPage, OwnershipsPage, MyResidencePage } from '@/features/property';
import { ProtectedRoute } from './ProtectedRoute';

export interface RouteItem {
  path: string;
  element: React.ReactNode;
  title: string;
}

export const routesConfig: RouteItem[] = [
  {
    path: ROUTES.DASHBOARD,
    element: <DashboardPage />,
    title: 'Dashboard',
  },
  {
    path: ROUTES.FACILITIES,
    element: <FacilitiesPage />,
    title: 'Facilities Directory',
  },
  {
    path: ROUTES.RESERVATIONS,
    element: <ReservationsPage />,
    title: 'Reservations & Approvals',
  },
  {
    path: ROUTES.VISITORS,
    element: <VisitorsPage />,
    title: 'Visitor Management',
  },
  {
    path: ROUTES.ANNOUNCEMENTS,
    element: <AnnouncementsPage />,
    title: 'Announcements',
  },
  {
    path: ROUTES.UNITS,
    element: (
      <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
        <UnitsPage />
      </ProtectedRoute>
    ),
    title: 'Unit Inventory',
  },
  {
    path: ROUTES.LEASES,
    element: (
      <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
        <LeasesPage />
      </ProtectedRoute>
    ),
    title: 'Lease Agreements',
  },
  {
    path: ROUTES.BUILDINGS,
    element: (
      <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
        <BuildingsPage />
      </ProtectedRoute>
    ),
    title: 'Buildings',
  },
  {
    path: ROUTES.FLOORS,
    element: (
      <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
        <FloorsPage />
      </ProtectedRoute>
    ),
    title: 'Floors',
  },
  {
    path: ROUTES.OWNERSHIPS,
    element: (
      <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
        <OwnershipsPage />
      </ProtectedRoute>
    ),
    title: 'Ownerships',
  },
  {
    path: ROUTES.MY_RESIDENCE,
    element: (
      <ProtectedRoute allowedRoles={['RESIDENT', 'OWNER']}>
        <MyResidencePage />
      </ProtectedRoute>
    ),
    title: 'My Residence',
  },
];
