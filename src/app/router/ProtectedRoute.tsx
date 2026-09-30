import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import type { UserRole } from '@/constants/roles';
import { ROUTES } from '@/constants/routes';
import { useAppSelector } from '@/app/store/hooks';
import { selectGrantedRoles } from '@/features/auth/store/permissions';
export interface ProtectedRouteProps {
  children?: ReactNode;
  allowedRoles?: UserRole[];
}
export const ProtectedRoute = ({
  children,
  allowedRoles,
}: ProtectedRouteProps) => {
  const { isAuthenticated, mustChangePassword } = useAppSelector((s) => s.auth);
  const roles = useAppSelector(selectGrantedRoles);
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  if (mustChangePassword)
    return <Navigate to={ROUTES.FORCE_CHANGE_PASSWORD} replace />;
  if (allowedRoles && !allowedRoles.some((role) => roles.includes(role)))
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  return children ? <>{children}</> : <Outlet />;
};
