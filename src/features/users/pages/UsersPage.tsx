import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Users, UserCheck } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { Alert } from '@/components/feedback/Alert';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ROUTES, buildUserDetailPath, buildUserEditPath } from '@/constants/routes';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { useCurrentAccess } from '../hooks/useCurrentAccess';
import { userApi } from '../api/userApi';
import { registrationApi } from '../api/registrationApi';
import { SYSTEM_ROLES, getRoleLabel } from '../constants/systemRoles';
import { ACCOUNT_STATUSES, ACCOUNT_STATUS_CONFIG } from '../constants/accountStatus';
import { filterUsers } from '../utils/userFormat';
import { UsersTable } from '../components/UsersTable';
import { RegistrationTable } from '../components/RegistrationTable';
import { RegistrationDetailsModal } from '../components/RegistrationDetailsModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { TextAreaField } from '@/features/residents/components/TextAreaField';
import type { AccountStatus, SystemRole, UserListFilters } from '../types/user.types';
import type { RegistrationRequest, RegistrationStatus } from '../types/registration.types';

type MainTab = 'ACCOUNTS' | 'REGISTRATIONS';
type RegStatusFilter = RegistrationStatus | 'ALL';

const ROLE_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All roles' },
  ...SYSTEM_ROLES.map((role) => ({ value: role, label: getRoleLabel(role) })),
];

const STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All statuses' },
  ...ACCOUNT_STATUSES.map((status) => ({ value: status, label: ACCOUNT_STATUS_CONFIG[status].label })),
];

const REG_STATUS_FILTERS: RegStatusFilter[] = ['PENDING', 'APPROVED', 'REJECTED', 'ALL'];

const REG_FILTER_LABELS: Record<RegStatusFilter, string> = {
  PENDING: 'Pending Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  ALL: 'All Requests',
};

const MIN_REJECTION_REASON_LENGTH = 5;

export const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const { name: reviewerName } = useCurrentAccess();

  // Tab state
  const [activeTab, setActiveTab] = useState<MainTab>('ACCOUNTS');

  // Active Users Resource
  const { data: users, loading: usersLoading, error: usersError, reload: reloadUsers } = useAsyncResource(
    () => userApi.getUsers(),
    []
  );
  const [userFilters, setUserFilters] = useState<UserListFilters>({ search: '', role: 'ALL', status: 'ALL' });

  // Registration Requests Resource (SCRUM-17)
  const {
    data: registrations,
    setData: setRegistrations,
    loading: regLoading,
    error: regError,
    reload: reloadRegistrations,
  } = useAsyncResource(() => registrationApi.getRegistrationRequests(), []);

  const [regStatusFilter, setRegStatusFilter] = useState<RegStatusFilter>('PENDING');
  const [regSearch, setRegSearch] = useState('');

  // Modals & Action States for SCRUM-17
  const [viewingReg, setViewingReg] = useState<RegistrationRequest | null>(null);
  const [actionReg, setActionReg] = useState<{ type: 'approve' | 'reject'; request: RegistrationRequest } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState<string | undefined>();
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filtered Users
  const filteredUsers = useMemo(() => filterUsers(users ?? [], userFilters), [users, userFilters]);
  const hasActiveUserFilters = userFilters.search !== '' || userFilters.role !== 'ALL' || userFilters.status !== 'ALL';

  // Counts for Registrations
  const pendingCount = useMemo(
    () => (registrations ?? []).filter((r) => r.status === 'PENDING').length,
    [registrations]
  );

  const regCounts = useMemo(() => {
    const list = registrations ?? [];
    return {
      PENDING: list.filter((r) => r.status === 'PENDING').length,
      APPROVED: list.filter((r) => r.status === 'APPROVED').length,
      REJECTED: list.filter((r) => r.status === 'REJECTED').length,
      ALL: list.length,
    };
  }, [registrations]);

  // Filtered Registrations
  const filteredRegistrations = useMemo(() => {
    const term = regSearch.trim().toLowerCase();
    return (registrations ?? []).filter((r) => {
      const matchesStatus = regStatusFilter === 'ALL' || r.status === regStatusFilter;
      const fullName = `${r.firstName} ${r.lastName}`.toLowerCase();
      const matchesSearch = !term || fullName.includes(term) || r.email.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [registrations, regStatusFilter, regSearch]);

  // Handlers for Registration Approval / Rejection
  const openApproveModal = (req: RegistrationRequest) => {
    setViewingReg(null);
    setFeedback(null);
    setActionReg({ type: 'approve', request: req });
  };

  const openRejectModal = (req: RegistrationRequest) => {
    setViewingReg(null);
    setFeedback(null);
    setRejectionReason('');
    setRejectionError(undefined);
    setActionReg({ type: 'reject', request: req });
  };

  const handleConfirmAction = async () => {
    if (!actionReg) return;

    if (actionReg.type === 'reject') {
      if (rejectionReason.trim().length < MIN_REJECTION_REASON_LENGTH) {
        setRejectionError(`Please enter a rejection reason of at least ${MIN_REJECTION_REASON_LENGTH} characters.`);
        return;
      }
    }

    setIsActionLoading(true);
    try {
      if (actionReg.type === 'approve') {
        const updated = await registrationApi.approveRegistration(actionReg.request.id, reviewerName);
        setRegistrations((prev) => (prev ?? []).map((r) => (r.id === updated.id ? updated : r)));
        setFeedback({
          type: 'success',
          message: `Approved registration request for ${updated.firstName} ${updated.lastName}. User account has been activated.`,
        });
        reloadUsers();
      } else {
        const updated = await registrationApi.rejectRegistration(
          actionReg.request.id,
          rejectionReason.trim(),
          reviewerName
        );
        setRegistrations((prev) => (prev ?? []).map((r) => (r.id === updated.id ? updated : r)));
        setFeedback({
          type: 'success',
          message: `Rejected registration request for ${updated.firstName} ${updated.lastName}. The account is suspended.`,
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Action could not be completed.',
      });
      reloadRegistrations();
    } finally {
      setIsActionLoading(false);
      setActionReg(null);
    }
  };

  return (
    <PageContainer
      title="User Administration"
      subtitle="Administer user accounts, permissions, and review pending self-registration requests."
      actions={
        activeTab === 'ACCOUNTS' ? (
          <Button variant="primary" leftIcon={<UserPlus size={16} />} onClick={() => navigate(ROUTES.USER_CREATE)}>
            Create User
          </Button>
        ) : undefined
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {feedback && (
          <Alert
            type={feedback.type}
            message={feedback.message}
            autoDismiss={feedback.type === 'success'}
            onDismiss={() => setFeedback(null)}
          />
        )}

        {/* Tab Selection Bar */}
        <div style={{ borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '1rem', marginBottom: '0.25rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('ACCOUNTS')}
            style={{
              padding: '0.75rem 1rem',
              fontWeight: 700,
              fontSize: '0.9375rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === 'ACCOUNTS' ? 'var(--color-primary)' : 'var(--color-text-muted)',
              borderBottom: activeTab === 'ACCOUNTS' ? '3px solid var(--color-accent)' : '3px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Users size={18} />
            User Accounts ({users?.length ?? 0})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('REGISTRATIONS')}
            style={{
              padding: '0.75rem 1rem',
              fontWeight: 700,
              fontSize: '0.9375rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === 'REGISTRATIONS' ? 'var(--color-primary)' : 'var(--color-text-muted)',
              borderBottom: activeTab === 'REGISTRATIONS' ? '3px solid var(--color-accent)' : '3px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all var(--transition-fast)',
            }}
          >
            <UserCheck size={18} />
            Registration Requests
            {pendingCount > 0 && (
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '9999px',
                }}
              >
                {pendingCount} Pending
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: ACCOUNTS VIEW */}
        {activeTab === 'ACCOUNTS' && (
          <>
            <Card padding="md">
              <div
                role="search"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}
              >
                <Input
                  label="Search"
                  placeholder="Name or email"
                  leftIcon={<Search size={16} />}
                  value={userFilters.search}
                  onChange={(e) => setUserFilters((prev) => ({ ...prev, search: e.target.value }))}
                />
                <Select
                  label="Role"
                  options={ROLE_FILTER_OPTIONS}
                  value={userFilters.role}
                  onChange={(e) => setUserFilters((prev) => ({ ...prev, role: e.target.value as SystemRole | 'ALL' }))}
                />
                <Select
                  label="Account Status"
                  options={STATUS_FILTER_OPTIONS}
                  value={userFilters.status}
                  searchable={false}
                  onChange={(e) => setUserFilters((prev) => ({ ...prev, status: e.target.value as AccountStatus | 'ALL' }))}
                />
              </div>
            </Card>

            {usersError ? (
              <ErrorMessage title="Could not load users" message={usersError} onRetry={reloadUsers} />
            ) : (
              <>
                {!usersLoading && (
                  <div
                    aria-live="polite"
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      fontSize: '0.8125rem',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    <span>
                      Showing {filteredUsers.length} of {users?.length ?? 0} users
                    </span>
                    {hasActiveUserFilters && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setUserFilters({ search: '', role: 'ALL', status: 'ALL' })}
                      >
                        Clear filters
                      </Button>
                    )}
                  </div>
                )}
                <UsersTable
                  users={filteredUsers}
                  isLoading={usersLoading}
                  emptyText={hasActiveUserFilters ? 'No users match the selected filters.' : 'No user accounts have been created yet.'}
                  onView={(user) => navigate(buildUserDetailPath(user.id))}
                  onEdit={(user) => navigate(buildUserEditPath(user.id))}
                />
              </>
            )}
          </>
        )}

        {/* TAB 2: REGISTRATION REQUESTS VIEW (SCRUM-17) */}
        {activeTab === 'REGISTRATIONS' && (
          <>
            <Card padding="sm">
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                }}
              >
                <div role="group" aria-label="Filter by registration status" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {REG_STATUS_FILTERS.map((status) => {
                    const isActive = regStatusFilter === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => setRegStatusFilter(status)}
                        style={{
                          padding: '0.5rem 0.875rem',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          cursor: 'pointer',
                          border: 'none',
                          backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                          color: isActive ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
                          transition: 'all var(--transition-fast)',
                        }}
                      >
                        {REG_FILTER_LABELS[status]}
                        <span
                          style={{
                            padding: '0.0625rem 0.45rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.6875rem',
                            backgroundColor: isActive ? 'var(--color-accent)' : 'var(--color-surface-sunken)',
                            color: isActive ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
                          }}
                        >
                          {regCounts[status]}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div style={{ flex: '0 1 280px', minWidth: '200px' }}>
                  <Input
                    placeholder="Search applicant name or email"
                    leftIcon={<Search size={16} />}
                    value={regSearch}
                    onChange={(e) => setRegSearch(e.target.value)}
                  />
                </div>
              </div>
            </Card>

            {regLoading && !registrations ? (
              <LoadingState message="Loading registration requests..." />
            ) : regError ? (
              <ErrorMessage title="Could not load registration requests" message={regError} onRetry={reloadRegistrations} />
            ) : filteredRegistrations.length === 0 ? (
              <EmptyState
                icon={<UserCheck size={28} />}
                title={regSearch ? 'No matching registration requests' : 'No registration requests found'}
                description={
                  regSearch
                    ? 'Try searching with a different name or email address.'
                    : regStatusFilter === 'PENDING'
                    ? 'There are currently no pending registration requests waiting for approval.'
                    : `No ${REG_FILTER_LABELS[regStatusFilter].toLowerCase()} records found.`
                }
              />
            ) : (
              <RegistrationTable
                requests={filteredRegistrations}
                isLoading={regLoading}
                emptyText="No registration requests found."
                onView={(req) => setViewingReg(req)}
                onApprove={openApproveModal}
                onReject={openRejectModal}
              />
            )}
          </>
        )}
      </div>

      {/* Details View Modal */}
      <RegistrationDetailsModal
        request={viewingReg}
        onClose={() => setViewingReg(null)}
        onApprove={openApproveModal}
        onReject={openRejectModal}
      />

      {/* Approve Confirmation Modal */}
      <ConfirmationModal
        isOpen={actionReg?.type === 'approve'}
        title="Approve Registration Request?"
        description={
          actionReg && (
            <>
              Approve self-registration for <strong>{actionReg.request.firstName} {actionReg.request.lastName}</strong> ({actionReg.request.email})? Their account becomes active, so they can sign in with the password they chose. Self-registrations get the Tenant / Resident role; assign other roles from their user page if needed.
            </>
          )
        }
        confirmLabel="Approve Registration"
        isConfirming={isActionLoading}
        onConfirm={handleConfirmAction}
        onCancel={() => setActionReg(null)}
      />

      {/* Reject Confirmation Modal */}
      <ConfirmationModal
        isOpen={actionReg?.type === 'reject'}
        title="Reject Registration Request?"
        tone="danger"
        description={
          actionReg && (
            <>
              Reject self-registration for <strong>{actionReg.request.firstName} {actionReg.request.lastName}</strong> ({actionReg.request.email})? Please state the reason for rejection below.
            </>
          )
        }
        confirmLabel="Reject Registration"
        isConfirming={isActionLoading}
        onConfirm={handleConfirmAction}
        onCancel={() => setActionReg(null)}
      >
        <TextAreaField
          label="Reason for rejection"
          required
          rows={4}
          maxLength={500}
          value={rejectionReason}
          onChange={(e) => {
            setRejectionReason(e.target.value);
            if (rejectionError) setRejectionError(undefined);
          }}
          error={rejectionError}
          disabled={isActionLoading}
          placeholder="e.g. Identity documents do not match building occupancy records."
          helperText={`Minimum ${MIN_REJECTION_REASON_LENGTH} characters required.`}
        />
      </ConfirmationModal>
    </PageContainer>
  );
};

export default UsersPage;
