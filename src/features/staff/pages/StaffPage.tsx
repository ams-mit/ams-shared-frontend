import React from 'react';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import { Briefcase } from 'lucide-react';

export const StaffPage: React.FC = () => {
  return (
    <PageContainer
      title="Building Staff & Contractors"
      description="Operational duty rosters, facility personnel, and security guards."
    >
      <Card>
        <EmptyState
          icon={<Briefcase size={36} />}
          title="Staff Management Module"
          description="Operational personnel records and shift assignments will be configured here."
        />
      </Card>
    </PageContainer>
  );
};

export default StaffPage;
