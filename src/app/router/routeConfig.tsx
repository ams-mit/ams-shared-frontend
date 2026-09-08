import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from './ProtectedRoute';

const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const ResidentsPage = lazy(() => import('@/features/residents/pages/ResidentsPage'));
const OwnersPage = lazy(() => import('@/features/owners/pages/OwnersPage'));
const StaffPage = lazy(() => import('@/features/staff/pages/StaffPage'));
const UsersPage = lazy(() => import('@/features/users/pages/UsersPage'));

export const routes: RouteObject[] = [
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.HOME,
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to={ROUTES.DASHBOARD} replace />,
      },
      {
        path: ROUTES.DASHBOARD,
        element: <DashboardPage />,
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
    ],
  },
  {
    path: ROUTES.NOT_FOUND,
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },
];
