import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Search, UserPlus } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, type Column } from '@/components/ui/Table';
import { Alert } from '@/components/feedback/Alert';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { ROUTES, buildUserDetailPath } from '@/constants/routes';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { useCurrentAccess } from '@/features/users/hooks/useCurrentAccess';
import { PROFILE_STATUS_CONFIG, PROFILE_TYPE_LABELS } from '../constants/profiles';
import { getFullName } from '@/features/users/utils/userFormat';
import { residentApi } from '../api/residentApi';
import { RELATIONSHIP_TYPE_CONFIG } from '../constants/relationships';
import { RestrictedValue } from '../components/RestrictedValue';
import { getRestrictedFieldVisibility, presentRestrictedValue } from '../utils/profileVisibility';
import type { ResidentDirectoryEntry } from '../types/resident.types';

const PRIVACY_NOTICE = {
  admin: 'You are viewing full contact details as a system administrator.',
  staff: 'Resident contact details are partially masked. Contact management if you need full details.',
  resident: 'Other residents’ contact details are private. Only your own details are shown.',
};

export const ResidentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { userId, role, isAdmin, isStaff } = useCurrentAccess();
  const { data: residents, loading, error, reload } = useAsyncResource(() => residentApi.getResidentDirectory(), []);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (residents ?? []).filter(
      (r) =>
        !term ||
        getFullName(r).toLowerCase().includes(term) ||
        r.units.some((u) => u.unitReference.toLowerCase().includes(term))
    );
  }, [residents, search]);

  const viewer = { userId, role };

  const columns: Column<ResidentDirectoryEntry>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (r) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
          {getFullName(r)}
          {r.userId === userId && (
            <Badge variant="accent" size="sm">
              You
            </Badge>
          )}
          {r.profileTypes.map((type) => (
            <Badge key={type} variant="neutral" size="sm">
              {PROFILE_TYPE_LABELS[type]}
            </Badge>
          ))}
          {isAdmin && r.profileId && (
            <code
              title="Resident profile ID (use it when drafting a lease)"
              style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 400, color: 'var(--color-text-muted)' }}
            >
              {r.profileId}
            </code>
          )}
        </span>
      ),
    },
    {
      key: 'units',
      header: 'Units',
      render: (r) =>
        r.units.length === 0 ? (
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No approved unit</span>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', minWidth: '150px' }}>
            {r.units.map((u) => (
              <Badge key={`${u.unitReference}-${u.relationshipType}`} variant="neutral" size="sm">
                {u.unitReference} · {RELATIONSHIP_TYPE_CONFIG[u.relationshipType].label}
              </Badge>
            ))}
          </div>
        ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (r) => {
        const visibility = getRestrictedFieldVisibility(viewer, r.userId);
        return (
          <RestrictedValue
            visibility={visibility}
            display={presentRestrictedValue(r.email, 'email', visibility)}
            fieldLabel="Email"
          />
        );
      },
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (r) => {
        const visibility = getRestrictedFieldVisibility(viewer, r.userId);
        return (
          <RestrictedValue
            visibility={visibility}
            display={presentRestrictedValue(r.phone, 'phone', visibility)}
            fieldLabel="Phone"
          />
        );
      },
    },
    ...(isAdmin
      ? [
          {
            key: 'status',
            header: 'Profile',
            render: (r: ResidentDirectoryEntry) => (
              <Badge variant={PROFILE_STATUS_CONFIG[r.status].badgeVariant} size="sm">
                {PROFILE_STATUS_CONFIG[r.status].label}
              </Badge>
            ),
          },
          {
            key: 'actions',
            header: <span className="sr-only">Actions</span>,
            align: 'right' as const,
            render: (r: ResidentDirectoryEntry) => (
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<Eye size={14} />}
                onClick={() => navigate(buildUserDetailPath(r.userId))}
                aria-label={`View account for ${getFullName(r)}`}
              >
                View
              </Button>
            ),
          },
        ]
      : []),
  ];

  return (
    <PageContainer
      title="Residents Directory"
      subtitle="Owners and tenants linked to apartment units through approved relationships."
      actions={
        isAdmin && (
          <Button variant="primary" leftIcon={<UserPlus size={16} />} onClick={() => navigate(ROUTES.USER_CREATE)}>
            Add Resident
          </Button>
        )
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Alert
          type="info"
          message={isAdmin ? PRIVACY_NOTICE.admin : isStaff ? PRIVACY_NOTICE.staff : PRIVACY_NOTICE.resident}
          autoDismiss={false}
          showDismissButton={false}
        />

        <Card padding="sm">
          <div style={{ maxWidth: '360px' }}>
            <Input
              aria-label="Search residents by name or unit"
              placeholder="Search by name or unit"
              leftIcon={<Search size={16} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </Card>

        {error ? (
          <ErrorMessage title="Could not load residents" message={error} onRetry={reload} />
        ) : (
          <Table
            columns={columns}
            data={filtered}
            keyExtractor={(r) => r.userId}
            isLoading={loading}
            emptyText={search ? 'No residents match your search.' : 'No residents are registered yet.'}
          />
        )}
      </div>
    </PageContainer>
  );
};

export default ResidentsPage;
