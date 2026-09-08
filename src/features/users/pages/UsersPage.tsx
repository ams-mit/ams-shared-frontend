import React from 'react';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import { Shield } from 'lucide-react';

export const UsersPage: React.FC = () => {
  return (
    <PageContainer
      title="User Access & Role Permissions"
      description="Centralized administration of roles, credentials, and API access privileges."
    >
      <Card>
        <EmptyState
          icon={<Shield size={36} />}
          title="Access Control Administration"
          description="Manage administrative permissions, RBAC policies, and audit logs."
        />
      </Card>
    </PageContainer>
  );
};

export default UsersPage;
