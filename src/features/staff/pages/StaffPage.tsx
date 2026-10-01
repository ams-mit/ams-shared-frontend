import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Search, UserPlus } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table, type Column } from '@/components/ui/Table';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { ROUTES, buildUserDetailPath } from '@/constants/routes';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { useCurrentAccess } from '@/features/users/hooks/useCurrentAccess';
import { userApi } from '@/features/users/api/userApi';
import { AccountStatusBadge } from '@/features/users/components/AccountStatusBadge';
import { RoleBadges } from '@/features/users/components/RoleBadges';
import { getRoleLabel } from '@/features/users/constants/systemRoles';
import { getFullName } from '@/features/users/utils/userFormat';
import type { SystemRole, UserAccount } from '@/features/users/types/user.types';

const STAFF_ROLES: SystemRole[] = [
  'SYSTEM_ADMINISTRATOR',
  'APARTMENT_MANAGER',
  'FINANCE_OFFICER',
  'MAINTENANCE_COORDINATOR',
  'TECHNICIAN',
  'SERVICE_STAFF',
  'SECURITY_OFFICER',
];

const ROLE_OPTIONS = [{ value: 'ALL', label: 'All staff roles' }, ...STAFF_ROLES.map((r) => ({ value: r, label: getRoleLabel(r) }))];

const loadStaff = async (): Promise<UserAccount[]> =>
  (await userApi.getUsers())
    .filter((u) => u.roles.some((r) => STAFF_ROLES.includes(r)))
    .sort((a, b) => a.lastName.localeCompare(b.lastName));

export const StaffPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useCurrentAccess();
  const { data: staff, loading, error, reload } = useAsyncResource(loadStaff, []);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<SystemRole | 'ALL'>('ALL');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (staff ?? []).filter(
      (u) =>
        (role === 'ALL' || u.roles.includes(role)) &&
        (!term || getFullName(u).toLowerCase().includes(term) || u.email.toLowerCase().includes(term))
    );
  }, [staff, search, role]);

  const columns: Column<UserAccount>[] = [
    { key: 'name', header: 'Name', render: (u) => <span style={{ fontWeight: 600 }}>{getFullName(u)}</span> },
    { key: 'roles', header: 'Roles', render: (u) => <RoleBadges roles={u.roles.filter((r) => STAFF_ROLES.includes(r))} /> },
    { key: 'email', header: 'Email', render: (u) => u.email },
    { key: 'phone', header: 'Phone', render: (u) => u.phone ?? '—' },
    { key: 'status', header: 'Account', render: (u) => <AccountStatusBadge status={u.status} /> },
    ...(isAdmin
      ? [
          {
            key: 'actions',
            header: <span className="sr-only">Actions</span>,
            align: 'right' as const,
            render: (u: UserAccount) => (
              <Button size="sm" variant="ghost" leftIcon={<Eye size={14} />} onClick={() => navigate(buildUserDetailPath(u.id))}>
                View
              </Button>
            ),
          },
        ]
      : []),
  ];

  return (
    <PageContainer
      title="Building Staff"
      subtitle="Management, finance, maintenance, service and security personnel."
      actions={
        isAdmin && (
          <Button variant="primary" leftIcon={<UserPlus size={16} />} onClick={() => navigate(ROUTES.USER_CREATE)}>
            Add Staff Member
          </Button>
        )
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Card padding="sm">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <Input
              aria-label="Search staff by name or email"
              placeholder="Search by name or email"
              leftIcon={<Search size={16} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              aria-label="Filter by role"
              options={ROLE_OPTIONS}
              value={role}
              searchable={false}
              onChange={(e) => setRole(e.target.value as SystemRole | 'ALL')}
            />
          </div>
        </Card>
        {error ? (
          <ErrorMessage title="Could not load staff" message={error} onRetry={reload} />
        ) : (
          <Table
            columns={columns}
            data={filtered}
            keyExtractor={(u) => u.id}
            isLoading={loading}
            emptyText={search || role !== 'ALL' ? 'No staff match the filters.' : 'No staff accounts yet.'}
          />
        )}
      </div>
    </PageContainer>
  );
};

export default StaffPage;
