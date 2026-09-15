import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/store/hooks';
import { ROUTES } from '@/constants/routes';
import type { UserRole } from '@/types/common';

export interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  redirectPath?: string;
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  redirectPath = ROUTES.LOGIN,
  children,
}) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    const targetPath = redirectPath === ROUTES.LOGIN ? `${ROUTES.LOGIN}?reason=session_expired` : redirectPath;
    return <Navigate to={targetPath} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
