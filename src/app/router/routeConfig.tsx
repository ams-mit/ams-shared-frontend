import { ROUTES } from '@/constants/routes';
import { DashboardPage } from '@/features/dashboard';
import { FacilitiesPage, ReservationsPage } from '@/features/facilities';
import { VisitorsPage, VisitorScannerPage } from '@/features/visitors';
import { AnnouncementsPage } from '@/features/announcements';

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
    path: ROUTES.VISITORS_SCAN,
    element: <VisitorScannerPage />,
    title: 'Gate Pass QR Scanner',
  },
  {
    path: ROUTES.ANNOUNCEMENTS,
    element: <AnnouncementsPage />,
    title: 'Announcements',
  },
];
