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
import { LeaseDetailModal } from '../components/LeaseDetailModal';
import { LEASE_STATUS_LABEL } from '../components/LeaseStatusBadge';
import { LEASE_STATUSES, type Lease, type LeaseStatus } from '../types/lease.types';
import { fetchInventory } from '@/features/units/store/unitSlice';
import { unitLabel } from '@/features/units/utils/unitLabel';

const PAGE_SIZE = 20;

const FILTER_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...LEASE_STATUSES.map((status) => ({ value: status, label: LEASE_STATUS_LABEL[status] })),
];

export const LeasesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeRole } = useAppSelector((state) => state.auth);
  const { leases, pagination, statusFilter, loading, error } = useAppSelector((state) => state.leases);
  const { units, buildings } = useAppSelector((state) => state.units);
  const canManage = activeRole === 'ADMIN';

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<Lease | null>(null);
  const [detailTarget, setDetailTarget] = useState<Lease | null>(null);
  const [page, setPage] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const load = useCallback(() => {
    dispatch(fetchLeases({ ...(statusFilter ? { status: statusFilter } : {}), page, size: PAGE_SIZE }));
  }, [dispatch, statusFilter, page]);

  useEffect(() => {
    load();
  }, [load]);

  // Unit names come from property-unit-service; the page still works on UUIDs if it is down.
  useEffect(() => {
    if (units.length === 0) dispatch(fetchInventory());
  }, [dispatch, units.length]);

  const labelForUnit = (unitId: string) => {
    const unit = units.find((u) => u.id === unitId);
    return unit ? unitLabel(unit, buildings) : undefined;
  };

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
                onChange={(event) => {
                  dispatch(setStatusFilter(event.target.value as LeaseStatus | ''));
                  setPage(0);
                }}
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
              unitLabel={labelForUnit}
              isLoading={loading}
              canManage={canManage}
              onView={setDetailTarget}
              onChangeStatus={setStatusTarget}
            />
            {pagination && pagination.totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderTop: '1px solid var(--color-border)',
                }}
              >
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  Page {pagination.page + 1} of {pagination.totalPages}
                </span>
                <Button size="sm" variant="outline" disabled={!pagination.hasPrevious || loading} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button size="sm" variant="outline" disabled={!pagination.hasNext || loading} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            )}
          </Card>
        )}
      </div>

      <LeaseDetailModal lease={detailTarget} canManage={canManage} onClose={() => setDetailTarget(null)} />

      {canManage && (
        <>
          <CreateLeaseModal
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            onCreated={() => {
              setSuccessMessage('Lease drafted successfully. Activate it once the tenant has signed, then register move-in from Details.');
              setPage(0);
            }}
          />
          <ChangeLeaseStatusModal lease={statusTarget} onClose={() => setStatusTarget(null)} />
        </>
      )}
    </PageContainer>
  );
};
