import { lazy } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ROUTES } from '@/constants/routes';
import { FacilitiesPage, ReservationsPage } from '@/features/facilities';
import { VisitorsPage, VisitorScannerPage } from '@/features/visitors';
import { AnnouncementsPage } from '@/features/announcements';
import { UnitsPage } from '@/features/units';
import { LeasesPage } from '@/features/leases';
import {
  BuildingsPage,
  FloorsPage,
  OwnershipsPage,
  MyResidencePage,
} from '@/features/property';
import { ProtectedRoute } from './ProtectedRoute';

const DashboardPage = lazy(() =>
  import('@/features/dashboard/pages/DashboardPage').then((m) => ({
    default: m.DashboardPage,
  }))
);
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(
  () => import('@/features/auth/pages/ForgotPasswordPage')
);
const ResetPasswordPage = lazy(
  () => import('@/features/auth/pages/ResetPasswordPage')
);
const ProfilePage = lazy(() => import('@/features/auth/pages/ProfilePage'));
const ResidentsPage = lazy(
  () => import('@/features/residents/pages/ResidentsPage')
);
const OwnersPage = lazy(() => import('@/features/owners/pages/OwnersPage'));
const StaffPage = lazy(() => import('@/features/staff/pages/StaffPage'));
const UsersPage = lazy(() => import('@/features/users/pages/UsersPage'));

const AccessDeniedPage = lazy(
  () => import('@/features/auth/pages/AccessDeniedPage')
);
const ChangePasswordPage = lazy(
  () => import('@/features/auth/pages/ChangePasswordPage')
);
const ForceChangePasswordPage = lazy(
  () => import('@/features/auth/pages/ForceChangePasswordPage')
);
const UserDetailPage = lazy(
  () => import('@/features/users/pages/UserDetailPage')
);
const CreateUserPage = lazy(
  () => import('@/features/users/pages/CreateUserPage')
);
const RolesPage = lazy(() => import('@/features/users/pages/RolesPage'));

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
  {
    path: ROUTES.UNITS,
    element: (
      <ProtectedRoute allowedRoles={['ADMIN', 'PROPERTY_MANAGER', 'MANAGER']}>
        <UnitsPage />
      </ProtectedRoute>
    ),
    title: 'Unit Inventory',
  },
  {
    path: ROUTES.LEASES,
    element: (
      <ProtectedRoute allowedRoles={['MANAGER']}>
        <LeasesPage />
      </ProtectedRoute>
    ),
    title: 'Lease Agreements',
  },
  {
    path: ROUTES.BUILDINGS,
    element: (
      <ProtectedRoute allowedRoles={['ADMIN', 'TENANT', 'PROPERTY_MANAGER']}>
        <BuildingsPage />
      </ProtectedRoute>
    ),
    title: 'Buildings',
  },
  {
    path: ROUTES.FLOORS,
    element: (
      <ProtectedRoute allowedRoles={['ADMIN', 'TENANT']}>
        <FloorsPage />
      </ProtectedRoute>
    ),
    title: 'Floors',
  },
  {
    path: ROUTES.OWNERSHIPS,
    element: (
      <ProtectedRoute allowedRoles={['ADMIN', 'PROPERTY_MANAGER', 'MANAGER']}>
        <OwnershipsPage />
      </ProtectedRoute>
    ),
    title: 'Ownerships',
  },
  {
    path: ROUTES.MY_RESIDENCE,
    element: (
      <ProtectedRoute allowedRoles={['RESIDENT', 'TENANT', 'OWNER']}>
        <MyResidencePage />
      </ProtectedRoute>
    ),
    title: 'My Residence',
  },
];

export const routes: RouteObject[] = [
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.REGISTER,
    element: <RegisterPage />,
  },
  {
    path: ROUTES.FORGOT_PASSWORD,
    element: <ForgotPasswordPage />,
  },
  {
    path: ROUTES.RESET_PASSWORD,
    element: <ResetPasswordPage />,
  },
  {
    path: ROUTES.FORCE_CHANGE_PASSWORD,
    element: <ForceChangePasswordPage />,
  },
  {
    path: ROUTES.HOME,
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      ...routesConfig.map(({ path, element }) => ({ path, element })),
      {
        index: true,
        element: <Navigate to={ROUTES.DASHBOARD} replace />,
      },
      {
        path: ROUTES.RESIDENTS,
        element: <ResidentsPage />,
      },
      {
        path: ROUTES.OWNERS,
        element: <OwnersPage />,
      },
      {
        path: ROUTES.STAFF,
        element: <StaffPage />,
      },
      {
        path: ROUTES.USERS,
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
            <UsersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.USER_CREATE,
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
            <CreateUserPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.USER_DETAIL,
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
            <UserDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.ROLES,
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
            <RolesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.PROFILE,
        element: <ProfilePage />,
      },
      {
        path: ROUTES.PROFILE_CHANGE_PASSWORD,
        element: <ChangePasswordPage />,
      },
      {
        path: ROUTES.UNAUTHORIZED,
        element: <AccessDeniedPage />,
      },
    ],
  },
  {
    path: ROUTES.NOT_FOUND,
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },
];
