import React from 'react';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import { UserCheck } from 'lucide-react';

export const OwnersPage: React.FC = () => {
  return (
    <PageContainer
      title="Property Owners"
      description="Manage deed titles, owner registrations, and representative powers of attorney."
    >
      <Card>
        <EmptyState
          icon={<UserCheck size={36} />}
          title="Owner Directory Module"
          description="Owner records and deed registrations will be listed here. Ready for Group 1 domain integration."
        />
      </Card>
    </PageContainer>
  );
};

export default OwnersPage;
