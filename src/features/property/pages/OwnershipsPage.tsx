import React, { useState } from 'react';
import { Search, UserPlus, KeyRound } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Table, type Column } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { Alert } from '@/components/feedback/Alert';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchOwnerships } from '../store/propertySlice';
import { AssignOwnerModal } from '../components/AssignOwnerModal';
import { totalSharePercentage } from '../validation/propertyValidation';
import type { Ownership, OwnershipLookup } from '../types/property.types';

type LookupBy = OwnershipLookup['by'];

const todayIso = () => new Date().toISOString().slice(0, 10);
const isCurrent = (o: Ownership) => o.startDate <= todayIso() && (!o.endDate || o.endDate >= todayIso());

const columns: Column<Ownership>[] = [
  { key: 'unitId', header: 'Unit', render: (o) => <strong>#{o.unitId}</strong> },
  { key: 'ownerId', header: 'Owner' },
  { key: 'sharePercentage', header: 'Share', align: 'right', render: (o) => `${Number(o.sharePercentage).toFixed(2)}%` },
  { key: 'startDate', header: 'From' },
  { key: 'endDate', header: 'To', render: (o) => o.endDate || '—' },
  {
    key: 'status',
    header: 'Status',
    render: (o) =>
      isCurrent(o) ? (
        <Badge variant="success" size="sm" dot>
          Current
        </Badge>
      ) : (
        <Badge variant="neutral" size="sm">
          {o.startDate > todayIso() ? 'Upcoming' : 'Past'}
        </Badge>
      ),
  },
];

export const OwnershipsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeRole } = useAppSelector((state) => state.auth);
  const { ownerships, ownershipLookup, ownershipsLoading, ownershipsError } = useAppSelector((state) => state.property);
  const canManage = activeRole === 'ADMIN';

  const [lookupBy, setLookupBy] = useState<LookupBy>('unit');
  const [query, setQuery] = useState('');
  const [queryError, setQueryError] = useState<string | undefined>();
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const search = (event?: React.FormEvent) => {
    event?.preventDefault();
    const value = query.trim();
    if (!value) return setQueryError(lookupBy === 'unit' ? 'Enter a unit ID.' : 'Enter an owner ID.');
    if (lookupBy === 'unit' && (!Number.isInteger(Number(value)) || Number(value) < 1)) {
      return setQueryError('Unit ID must be a positive whole number.');
    }
    setQueryError(undefined);
    dispatch(fetchOwnerships(lookupBy === 'unit' ? { by: 'unit', unitId: Number(value) } : { by: 'owner', ownerId: value }));
  };

  const handleAssigned = (ownership: Ownership) => {
    setSuccessMessage(`Owner ${ownership.ownerId} assigned ${ownership.sharePercentage}% of unit #${ownership.unitId}.`);
    setLookupBy('unit');
    setQuery(String(ownership.unitId));
    dispatch(fetchOwnerships({ by: 'unit', unitId: ownership.unitId }));
  };

  const allocated = totalSharePercentage(ownerships);

  const renderResults = () => {
    if (!ownershipLookup) {
      return (
        <EmptyState
          icon={<KeyRound size={32} />}
          title="Look up ownership records"
          description="Search by unit to see its full ownership history, or by owner to see every unit they hold."
        />
      );
    }
    if (ownershipsError) {
      return <ErrorMessage title="Could not load ownership records" message={ownershipsError.message} onRetry={() => search()} />;
    }
    const title =
      ownershipLookup.by === 'unit' ? `Ownership history · Unit #${ownershipLookup.unitId}` : `Units held by ${ownershipLookup.ownerId}`;
    return (
      <Card
        title={title}
        subtitle={ownershipLookup.by === 'unit' && ownerships.length > 0 ? `${allocated}% of shares allocated · ${Math.max(0, 100 - allocated)}% unallocated` : undefined}
        padding="none"
      >
        <Table
          columns={columns}
          data={ownerships}
          keyExtractor={(o) => o.id}
          isLoading={ownershipsLoading}
          emptyText="No ownership records found."
          striped
        />
      </Card>
    );
  };

  return (
    <PageContainer
      title="Ownerships"
      subtitle="Legal ownership records linking units to owner profiles."
      actions={
        canManage && (
          <Button size="sm" leftIcon={<UserPlus size={16} />} onClick={() => setIsAssignOpen(true)}>
            Assign Owner
          </Button>
        )
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {successMessage && <Alert type="success" message={successMessage} onDismiss={() => setSuccessMessage(null)} />}

        <Card padding="md">
          <form onSubmit={search} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ width: '180px' }}>
              <Select
                label="Search by"
                value={lookupBy}
                options={[
                  { value: 'unit', label: 'Unit ID' },
                  { value: 'owner', label: 'Owner ID' },
                ]}
                onChange={(event) => {
                  setLookupBy(event.target.value as LookupBy);
                  setQueryError(undefined);
                }}
              />
            </div>
            <div style={{ flex: '1 1 240px' }}>
              <Input
                label={lookupBy === 'unit' ? 'Unit ID' : 'Owner ID'}
                type={lookupBy === 'unit' ? 'number' : 'text'}
                placeholder={lookupBy === 'unit' ? 'e.g. 101' : 'Owner profile ID'}
                value={query}
                error={queryError}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div style={{ paddingTop: '1.6rem' }}>
              <Button type="submit" leftIcon={<Search size={16} />} isLoading={ownershipsLoading}>
                Search
              </Button>
            </div>
          </form>
        </Card>

        {renderResults()}
      </div>

      {canManage && isAssignOpen && (
        <AssignOwnerModal
          isOpen
          onClose={() => setIsAssignOpen(false)}
          initialUnitId={ownershipLookup?.by === 'unit' ? String(ownershipLookup.unitId) : undefined}
          onAssigned={handleAssigned}
        />
      )}
    </PageContainer>
  );
};
