import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Search } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, type Column } from '@/components/ui/Table';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { buildUserDetailPath } from '@/constants/routes';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { useCurrentAccess } from '@/features/users/hooks/useCurrentAccess';
import { userApi } from '@/features/users/api/userApi';
import { AccountStatusBadge } from '@/features/users/components/AccountStatusBadge';
import { getFullName } from '@/features/users/utils/userFormat';
import type { UserAccount } from '@/features/users/types/user.types';
import { propertyApi } from '@/features/property/api/propertyApi';
import { unitApi } from '@/features/units/api/unitApi';
import { profileIdFor } from '@/services/mock/people';

interface OwnerRow {
  user: UserAccount;
  profileId: string;
  holdings: { unit: string; share: number }[];
}

const loadOwners = async (): Promise<OwnerRow[]> => {
  const [owners, units, buildings] = await Promise.all([
    userApi.getUsers({ role: 'OWNER' }),
    unitApi.getUnits(),
    unitApi.getBuildings(),
  ]);
  const codeOf = new Map(buildings.map((b) => [b.id, b.buildingCode]));
  const labelOf = new Map(units.map((u) => [u.id, `${codeOf.get(u.buildingId) ?? '?'}-${u.unitNumber}`]));
  const ownerships = await Promise.all(
    owners.map((owner) => propertyApi.getOwnerships({ by: 'owner', ownerId: profileIdFor(owner.id) }))
  );
  return owners
    .map((user, i) => ({
      user,
      profileId: profileIdFor(user.id),
      holdings: ownerships[i]
        .filter((o) => o.status === 'ACTIVE')
        .map((o) => ({ unit: labelOf.get(o.unitId) ?? 'Unknown unit', share: o.ownershipPercentage }))
        .sort((a, b) => a.unit.localeCompare(b.unit)),
    }))
    .sort((a, b) => a.user.lastName.localeCompare(b.user.lastName));
};

export const OwnersPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useCurrentAccess();
  const { data: owners, loading, error, reload } = useAsyncResource(loadOwners, []);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (owners ?? []).filter(
      (row) =>
        !term ||
        getFullName(row.user).toLowerCase().includes(term) ||
        row.holdings.some((h) => h.unit.toLowerCase().includes(term))
    );
  }, [owners, search]);

  const columns: Column<OwnerRow>[] = [
    {
      key: 'name',
      header: 'Owner',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{getFullName(row.user)}</div>
          <code style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }} title="Owner profile ID">
            {row.profileId}
          </code>
        </div>
      ),
    },
    {
      key: 'units',
      header: 'Units owned',
      render: (row) =>
        row.holdings.length === 0 ? (
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No ownership recorded</span>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {row.holdings.map((h) => (
              <Badge key={h.unit} variant="neutral" size="sm">
                {h.unit} · {h.share}%
              </Badge>
            ))}
          </div>
        ),
    },
    { key: 'email', header: 'Email', render: (row) => row.user.email },
    { key: 'phone', header: 'Phone', render: (row) => row.user.phone ?? '—' },
    { key: 'status', header: 'Account', render: (row) => <AccountStatusBadge status={row.user.status} /> },
    ...(isAdmin
      ? [
          {
            key: 'actions',
            header: <span className="sr-only">Actions</span>,
            align: 'right' as const,
            render: (row: OwnerRow) => (
              <Button size="sm" variant="ghost" leftIcon={<Eye size={14} />} onClick={() => navigate(buildUserDetailPath(row.user.id))}>
                View
              </Button>
            ),
          },
        ]
      : []),
  ];

  return (
    <PageContainer
      title="Property Owners"
      subtitle="Owners and the units they hold. Assign or change shares on the Ownerships page."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Card padding="sm">
          <div style={{ maxWidth: '360px' }}>
            <Input
              aria-label="Search owners by name or unit"
              placeholder="Search by name or unit"
              leftIcon={<Search size={16} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </Card>
        {error ? (
          <ErrorMessage title="Could not load owners" message={error} onRetry={reload} />
        ) : (
          <Table
            columns={columns}
            data={filtered}
            keyExtractor={(row) => row.user.id}
            isLoading={loading}
            emptyText={search ? 'No owners match your search.' : 'No owners are registered yet.'}
          />
        )}
      </div>
    </PageContainer>
  );
};

export default OwnersPage;
