import React, { useCallback, useEffect, useState } from 'react';
import { FilePlus2 } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { Alert } from '@/components/feedback/Alert';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchLeases, setStatusFilter } from '../store/leaseSlice';
import { LeaseTable } from '../components/LeaseTable';
import { CreateLeaseModal } from '../components/CreateLeaseModal';
import { ChangeLeaseStatusModal } from '../components/ChangeLeaseStatusModal';
import { LEASE_STATUS_LABEL } from '../components/LeaseStatusBadge';
import { LEASE_STATUSES, type Lease, type LeaseStatus } from '../types/lease.types';

const FILTER_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...LEASE_STATUSES.map((status) => ({ value: status, label: LEASE_STATUS_LABEL[status] })),
];

export const LeasesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeRole } = useAppSelector((state) => state.auth);
  const { leases, pagination, statusFilter, loading, error } = useAppSelector((state) => state.leases);
  const canManage = activeRole === 'ADMIN';

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<Lease | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const load = useCallback(() => {
    dispatch(fetchLeases(statusFilter ? { status: statusFilter } : undefined));
  }, [dispatch, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <PageContainer
      title="Lease Agreements"
      subtitle="Draft, activate and track lease contracts across every unit."
      actions={
        canManage && (
          <Button size="sm" leftIcon={<FilePlus2 size={16} />} onClick={() => setIsCreateOpen(true)}>
            Draft Lease
          </Button>
        )
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {successMessage && (
          <Alert type="success" message={successMessage} onDismiss={() => setSuccessMessage(null)} />
        )}

        <Card padding="md">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div style={{ minWidth: '220px' }}>
              <Select
                label="Filter by status"
                value={statusFilter}
                options={FILTER_OPTIONS}
                onChange={(event) => dispatch(setStatusFilter(event.target.value as LeaseStatus | ''))}
              />
            </div>
            {pagination && (
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                {pagination.totalElements} lease{pagination.totalElements === 1 ? '' : 's'}
              </span>
            )}
          </div>
        </Card>

        {error && !loading ? (
          <ErrorMessage title="Could not load leases" message={error.message} onRetry={load} />
        ) : (
          <Card padding="none">
            <LeaseTable
              leases={leases}
              isLoading={loading}
              canManage={canManage}
              onChangeStatus={setStatusTarget}
            />
          </Card>
        )}
      </div>

      {canManage && (
        <>
          <CreateLeaseModal
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            onCreated={() => setSuccessMessage('Lease drafted successfully. Activate it once the tenant has signed.')}
          />
          <ChangeLeaseStatusModal lease={statusTarget} onClose={() => setStatusTarget(null)} />
        </>
      )}
    </PageContainer>
  );
};
