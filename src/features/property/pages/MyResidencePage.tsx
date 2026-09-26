import React, { useEffect, useState } from 'react';
import { Home, Search } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Table, type Column } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { LeaseStatusBadge } from '@/features/leases/components/LeaseStatusBadge';
import { formatLeaseDuration, isUuid } from '@/features/leases/validation/leaseValidation';
import { fetchActiveOccupancy, fetchOwnerships } from '../store/propertySlice';
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
  { key: 'unitId', header: 'Unit', render: (o) => <strong>#{o.unitId}</strong> },
  { key: 'sharePercentage', header: 'Share', align: 'right', render: (o) => `${Number(o.sharePercentage).toFixed(2)}%` },
  { key: 'startDate', header: 'Owned Since' },
  { key: 'endDate', header: 'Until', render: (o) => o.endDate || 'Present' },
];

export const MyResidencePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentUser, activeRole } = useAppSelector((state) => state.auth);
  const { activeOccupancy, occupancyLoading, occupancyError, ownerships, ownershipsLoading, ownershipsError } =
    useAppSelector((state) => state.property);

  const profileUnitId = currentUser.unitId && isUuid(currentUser.unitId) ? currentUser.unitId : '';
  const [unitRef, setUnitRef] = useState(profileUnitId);
  const [unitRefError, setUnitRefError] = useState<string | undefined>();
  const [hasSearched, setHasSearched] = useState(false);
  const isOwner = activeRole === 'OWNER';

  useEffect(() => {
    if (profileUnitId) {
      dispatch(fetchActiveOccupancy(profileUnitId));
      setHasSearched(true);
    }
  }, [dispatch, profileUnitId]);

  useEffect(() => {
    if (isOwner) dispatch(fetchOwnerships({ by: 'owner', ownerId: currentUser.id }));
  }, [dispatch, isOwner, currentUser.id]);

  const lookUp = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isUuid(unitRef)) return setUnitRefError('Enter the unit ID (UUID) shown on your lease agreement.');
    setUnitRefError(undefined);
    setHasSearched(true);
    dispatch(fetchActiveOccupancy(unitRef.trim()));
  };

  const renderLease = () => {
    if (occupancyLoading) return <LoadingState message="Loading your lease…" />;
    if (occupancyError) {
      return occupancyError.status === 404 ? (
        <EmptyState
          icon={<Home size={32} />}
          title="No active lease found"
          description="There is no active lease on this unit right now. Contact the management office if this looks wrong."
        />
      ) : (
        <ErrorMessage title="Could not load your lease" message={occupancyError.message} />
      );
    }
    if (!activeOccupancy) {
      return hasSearched ? null : (
        <EmptyState
          icon={<Home size={32} />}
          title="Find your lease"
          description="Your profile isn't linked to a unit record yet. Enter the unit ID from your lease agreement to view its terms."
        />
      );
    }

    const remaining = daysUntil(activeOccupancy.endDate);
    return (
      <Card
        title="Active Lease"
        subtitle={formatLeaseDuration(activeOccupancy.startDate, activeOccupancy.endDate) ?? undefined}
        action={<LeaseStatusBadge status={activeOccupancy.status} />}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          <Detail label="Lease Start">{activeOccupancy.startDate}</Detail>
          <Detail label="Lease End">
            {activeOccupancy.endDate}
            {remaining >= 0 && (
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}> · {remaining} days left</span>
            )}
          </Detail>
          <Detail label="Occupants">{activeOccupancy.occupantIds.length}</Detail>
          <Detail label="Unit ID">{activeOccupancy.unitId}</Detail>
          <Detail label="Primary Tenant">{activeOccupancy.tenantId}</Detail>
          <Detail label="Lease ID">{activeOccupancy.leaseId}</Detail>
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
            <Detail label="Registered Unit">{currentUser.unitId ?? 'Not assigned'}</Detail>
            <Detail label="Role">{activeRole}</Detail>
          </div>
        </Card>

        {!profileUnitId && (
          <Card padding="md">
            <form onSubmit={lookUp} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ flex: '1 1 320px' }}>
                <Input
                  label="Unit ID"
                  placeholder="e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6"
                  value={unitRef}
                  error={unitRefError}
                  onChange={(event) => setUnitRef(event.target.value)}
                />
              </div>
              <div style={{ paddingTop: '1.6rem' }}>
                <Button type="submit" leftIcon={<Search size={16} />} isLoading={occupancyLoading}>
                  View Lease
                </Button>
              </div>
            </form>
          </Card>
        )}

        {renderLease()}

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
