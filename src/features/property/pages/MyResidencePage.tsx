import React, { useCallback, useEffect, useState } from 'react';
import { Home } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Table, type Column } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { toApiError, type ApiErrorInfo } from '@/services/api/apiError';
import { leaseApi } from '@/features/leases/api/leaseApi';
import { LeaseStatusBadge } from '@/features/leases/components/LeaseStatusBadge';
import { formatLeaseDuration } from '@/features/leases/validation/leaseValidation';
import type { Lease } from '@/features/leases/types/lease.types';
import { fetchOwnerships } from '../store/propertySlice';
import type { Ownership } from '../types/property.types';

const daysUntil = (isoDate: string): number => {
  const [y, m, d] = isoDate.split('-').map(Number);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((new Date(y, m - 1, d).getTime() - today) / 86_400_000);
};

const Detail: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
    <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)' }}>
      {label}
    </span>
    <span style={{ fontSize: '0.9375rem', color: 'var(--color-text)', wordBreak: 'break-all' }}>{children}</span>
  </div>
);

const ownershipColumns: Column<Ownership>[] = [
  { key: 'unitId', header: 'Unit', render: (o) => <strong style={{ wordBreak: 'break-all' }}>{o.unitId}</strong> },
  { key: 'ownershipPercentage', header: 'Share', align: 'right', render: (o) => `${Number(o.ownershipPercentage).toFixed(2)}%` },
  { key: 'startDate', header: 'Owned Since' },
  { key: 'endDate', header: 'Until', render: (o) => o.endDate || 'Present' },
];

const leaseColumns: Column<Lease>[] = [
  { key: 'term', header: 'Term', render: (l) => <span style={{ whiteSpace: 'nowrap' }}>{l.startDate} → {l.endDate}</span> },
  { key: 'unitId', header: 'Unit', render: (l) => <span style={{ wordBreak: 'break-all' }}>{l.unitId}</span> },
  { key: 'status', header: 'Status', render: (l) => <LeaseStatusBadge status={l.status} /> },
];

export const MyResidencePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentUser, activeRole } = useAppSelector((state) => state.auth);
  const { ownerships, ownershipsLoading, ownershipsError } = useAppSelector((state) => state.property);
  const isOwner = activeRole === 'OWNER';

  const [leases, setLeases] = useState<Lease[]>([]);
  const [leasesLoading, setLeasesLoading] = useState(true);
  const [leasesError, setLeasesError] = useState<ApiErrorInfo | null>(null);

  // LEASE-002 scopes the list to the signed-in resident's own leases, so no unit ID is needed.
  const loadLeases = useCallback(async () => {
    setLeasesLoading(true);
    setLeasesError(null);
    try {
      const mine = await leaseApi.listAll();
      setLeases([...mine].sort((a, b) => b.startDate.localeCompare(a.startDate)));
    } catch (err) {
      setLeasesError(toApiError(err, 'Failed to load your leases.'));
    } finally {
      setLeasesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeases();
  }, [loadLeases]);

  useEffect(() => {
    if (isOwner) dispatch(fetchOwnerships({ by: 'owner', ownerId: currentUser.id }));
  }, [dispatch, isOwner, currentUser.id]);

  const activeLease = leases.find((l) => l.status === 'ACTIVE');

  const renderActiveLease = () => {
    if (leasesLoading) return <LoadingState message="Loading your lease…" />;
    if (leasesError) return <ErrorMessage title="Could not load your lease" message={leasesError.message} onRetry={loadLeases} />;
    if (!activeLease) {
      return (
        <EmptyState
          icon={<Home size={32} />}
          title="No active lease found"
          description="You are not on an active lease right now. Contact the management office if this looks wrong."
        />
      );
    }

    const remaining = daysUntil(activeLease.endDate);
    const coOccupants = activeLease.occupants.length - 1;
    return (
      <Card
        title="Active Lease"
        subtitle={formatLeaseDuration(activeLease.startDate, activeLease.endDate) ?? undefined}
        action={<LeaseStatusBadge status={activeLease.status} />}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          <Detail label="Lease Start">{activeLease.startDate}</Detail>
          <Detail label="Lease End">
            {activeLease.endDate}
            {remaining >= 0 && (
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}> · {remaining} days left</span>
            )}
          </Detail>
          <Detail label="Co-occupants">{coOccupants > 0 ? coOccupants : 'None'}</Detail>
          <Detail label="Unit ID">{activeLease.unitId}</Detail>
          <Detail label="Lease ID">{activeLease.id}</Detail>
          {activeLease.notes && <Detail label="Notes">{activeLease.notes}</Detail>}
        </div>
      </Card>
    );
  };

  return (
    <PageContainer title="My Residence" subtitle="Your unit assignment and current lease terms.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Card padding="md">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            <Detail label="Resident">{currentUser.name}</Detail>
            <Detail label="Registered Unit">{activeLease?.unitId ?? currentUser.unitId ?? 'Not assigned'}</Detail>
            <Detail label="Role">{activeRole}</Detail>
          </div>
        </Card>

        {renderActiveLease()}

        {!leasesLoading && !leasesError && leases.length > 0 && (
          <Card title="My Lease History" padding="none">
            <Table columns={leaseColumns} data={leases} keyExtractor={(l) => l.id} striped />
          </Card>
        )}

        {isOwner && (
          ownershipsError ? (
            <ErrorMessage title="Could not load your owned units" message={ownershipsError.message} />
          ) : (
            <Card title="My Owned Units" padding="none">
              <Table
                columns={ownershipColumns}
                data={ownerships}
                keyExtractor={(o) => o.id}
                isLoading={ownershipsLoading}
                emptyText="No ownership records are registered to your profile."
                striped
              />
            </Card>
          )
        )}
      </div>
    </PageContainer>
  );
};
