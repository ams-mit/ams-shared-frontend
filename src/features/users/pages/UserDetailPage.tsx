import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Hash, KeyRound, Lock, Mail, Pencil, Phone, User, UserPlus } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/feedback/Alert';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { ROUTES, buildUserEditPath } from '@/constants/routes';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { useFlashMessage } from '@/hooks/useFlashMessage';
import { formatDate } from '@/utils/date';
import { userApi } from '../api/userApi';
import { ACCOUNT_STATUS_CONFIG, isAccountLocked } from '../constants/accountStatus';
import { getRoleLabel } from '../constants/systemRoles';
import { useCurrentAccess } from '../hooks/useCurrentAccess';
import { getFullName } from '../utils/userFormat';
import { AccountStatusBadge } from '../components/AccountStatusBadge';
import { ProfileField, ProfileFieldList } from '../components/ProfileField';
import { RoleAssignmentPanel } from '../components/RoleAssignmentPanel';
import { UserAvatar } from '../components/UserAvatar';

export const UserDetailPage: React.FC = () => {
  const { userId = '' } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const flash = useFlashMessage();
  const { userId: currentUserId } = useCurrentAccess();
  const { data: user, setData: setUser, loading, error, reload } = useAsyncResource(
    () => userApi.getUserById(userId),
    [userId]
  );

  return (
    <PageContainer
      title={user ? getFullName(user) : 'User Details'}
      subtitle="Review account information and manage role assignments."
      actions={
        <>
          <Button variant="outline" leftIcon={<ArrowLeft size={16} />} onClick={() => navigate(ROUTES.USERS)}>
            Back to Users
          </Button>
          {user && (
            <Button variant="primary" leftIcon={<Pencil size={16} />} onClick={() => navigate(buildUserEditPath(user.id))}>
              Edit User
            </Button>
          )}
        </>
      }
    >
      {loading ? (
        <LoadingState message="Loading user account..." />
      ) : error || !user ? (
        <ErrorMessage title="Could not load user" message={error ?? 'User not found.'} onRetry={reload} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {flash && <Alert type="success" message={flash} />}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>
            <Card title="Account Details">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <UserAvatar user={user} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                    {getFullName(user)}
                  </div>
                  <div style={{ marginTop: '0.25rem' }}>
                    <AccountStatusBadge status={user.status} />
                  </div>
                </div>
              </div>
              <ProfileFieldList>
                <ProfileField label="First name" icon={<User size={15} />}>{user.firstName}</ProfileField>
                <ProfileField label="Last name" icon={<User size={15} />}>{user.lastName}</ProfileField>
                <ProfileField label="Email" icon={<Mail size={15} />}>
                  {user.email}
                  {user.pendingEmail && (
                    <div style={{ marginTop: '0.25rem' }}>
                      <Badge variant="warning" size="sm">
                        Change pending: {user.pendingEmail}
                      </Badge>
                    </div>
                  )}
                </ProfileField>
                <ProfileField label="Phone" icon={<Phone size={15} />}>{user.phone}</ProfileField>
                <ProfileField label="Account status" icon={<User size={15} />}>
                  {ACCOUNT_STATUS_CONFIG[user.status].description}
                </ProfileField>
                <ProfileField label="Created" icon={<CalendarDays size={15} />}>{formatDate(user.createdAt)}</ProfileField>
                {user.requestedRole && (
                  <ProfileField label="Requested role" icon={<UserPlus size={15} />}>
                    {getRoleLabel(user.requestedRole)}
                  </ProfileField>
                )}
                <ProfileField label="Password" icon={<KeyRound size={15} />}>
                  {user.mustChangePassword ? (
                    <Badge variant="info" size="sm">Must change at next sign-in</Badge>
                  ) : (
                    'Set by user'
                  )}
                </ProfileField>
                <ProfileField label="Sign-in lock" icon={<Lock size={15} />}>
                  {isAccountLocked(user) ? (
                    <Badge variant="danger" size="sm">
                      Locked after {user.failedAttemptCount ?? 5} failed attempts
                    </Badge>
                  ) : (
                    'Not locked'
                  )}
                </ProfileField>
                <ProfileField label="User ID" icon={<Hash size={15} />}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>{user.id}</span>
                </ProfileField>
              </ProfileFieldList>
            </Card>

            <RoleAssignmentPanel user={user} actorUserId={currentUserId} onUserUpdated={setUser} />
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default UserDetailPage;
