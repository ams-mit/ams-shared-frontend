import React from 'react';
import { UserRole } from '@/constants/roles';
import { useAppSelector } from '@/app/store/hooks';
import { Alert } from '@/components/feedback/Alert';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { activeRole } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    const targetPath = redirectPath === ROUTES.LOGIN ? `${ROUTES.LOGIN}?reason=session_expired` : redirectPath;
    return <Navigate to={targetPath} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
  if (allowedRoles && !allowedRoles.includes(activeRole)) {
    return (
      <div style={{ padding: '2rem' }}>
        <Alert
          type="error"
          title="Access Restricted"
          autoDismiss={false}
          showDismissButton={false}
          message={`Your current active persona role (${activeRole}) does not have permission to view this section. Use the top-right persona switcher to switch to a role with permission.`}
        />
      </div>
    );
  }

  return <>{children}</>;
};
