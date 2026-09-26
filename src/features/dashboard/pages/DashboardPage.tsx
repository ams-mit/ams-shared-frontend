import React from 'react';
import { useAppSelector } from '@/app/store/hooks';
import BasicDashboard from '../components/BasicDashboard';
import OwnerTenantDashboard from '../components/OwnerTenantDashboard';
import StaffDashboard from '../components/StaffDashboard';

export const DashboardPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  // Mapping logic:
  // OWNER → Owner-Tenant Dashboard
  // TENANT → Owner-Tenant Dashboard
  // RESIDENT → Basic Dashboard
  // STAFF → Staff Dashboard
  // MANAGER → Staff Dashboard
  // ADMIN → Staff Dashboard
  // NONE / missing relationshipStatus → Basic Dashboard (unless role specifies STAFF/MANAGER/ADMIN/OWNER/TENANT)

  const renderDashboardVariant = () => {
    const relationshipStatus = user?.relationshipStatus;
    const role = user?.role;

    // Check relationshipStatus if defined
    if (relationshipStatus) {
      if (relationshipStatus === 'OWNER' || relationshipStatus === 'TENANT') {
        return <OwnerTenantDashboard user={user} />;
      }
      if (relationshipStatus === 'STAFF') {
        return <StaffDashboard user={user} />;
      }
      if (relationshipStatus === 'RESIDENT' || relationshipStatus === 'NONE') {
        return <BasicDashboard user={user} />;
      }
    }

    // Fallback to role mapping
    if (role === 'ADMIN' || role === 'MANAGER' || role === 'STAFF') {
      return <StaffDashboard user={user} />;
    }
    if (role === 'OWNER' || role === 'TENANT') {
      return <OwnerTenantDashboard user={user} />;
    }

    return <BasicDashboard user={user} />;
  };

  return renderDashboardVariant();
};
