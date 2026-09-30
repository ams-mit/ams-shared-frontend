import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Home, KeyRound, Mail, Pencil, Phone, ShieldCheck, User } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/feedback/Alert';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { ROUTES } from '@/constants/routes';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { useFlashMessage } from '@/hooks/useFlashMessage';
import { useCurrentAccess } from '@/features/users/hooks/useCurrentAccess';
import { getFullName } from '@/features/users/utils/userFormat';
import { AccountStatusBadge } from '@/features/users/components/AccountStatusBadge';
import { ProfileField, ProfileFieldList } from '@/features/users/components/ProfileField';
import { RoleBadges } from '@/features/users/components/RoleBadges';
import { UserAvatar } from '@/features/users/components/UserAvatar';
import { profileApi } from '../api/profileApi';

interface SecurityActionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

const SecurityAction: React.FC<SecurityActionProps> = ({ icon, title, description, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: '0.875rem',
      padding: '0.875rem 1rem',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--color-border)',
      backgroundColor: 'var(--color-surface)',
      textAlign: 'left',
      cursor: 'pointer',
      transition: 'all var(--transition-fast)',
    }}
    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
  >
    <span
      aria-hidden="true"
      style={{
        width: '36px',
        height: '36px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--color-accent-light)',
        color: 'var(--color-accent-active)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {icon}
    </span>
    <span style={{ flex: 1, minWidth: 0 }}>
      <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>{title}</span>
      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{description}</span>
    </span>
    <ChevronRight size={16} color="var(--color-text-light)" aria-hidden="true" />
  </button>
);

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const flash = useFlashMessage();
  const { userId, name, email, isAdmin, isStaff } = useCurrentAccess();
  const { data: profile, loading, error, reload } = useAsyncResource(() => profileApi.getMyProfile({ userId, name, email }), [userId]);

  return (
    <PageContainer
      title="My Profile"
      subtitle="Your personal details, account access and security settings."
      maxWidth="1100px"
      actions={
        profile && (
          <Button variant="primary" leftIcon={<Pencil size={16} />} onClick={() => navigate(ROUTES.PROFILE_EDIT)}>
            Edit Profile
          </Button>
        )
      }
    >
      {loading ? (
        <LoadingState message="Loading your profile..." />
      ) : error || !profile ? (
        <ErrorMessage title="Could not load your profile" message={error ?? 'Profile not found.'} onRetry={reload} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {flash && <Alert type="success" message={flash} />}
          {profile.pendingEmail && (
            <Alert
              type="info"
              title="Email change pending verification"
              message={`We sent a verification code to ${profile.pendingEmail}. Enter it on the Change Email page to confirm; until then, keep signing in with ${profile.email}.`}
              autoDismiss={false}
              showDismissButton={false}
            />
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>
            <Card title="Personal Information">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <UserAvatar user={profile} size={56} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                    {getFullName(profile)}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', wordBreak: 'break-word' }}>
                    {profile.email}
                  </div>
                </div>
              </div>
              <ProfileFieldList>
                <ProfileField label="First name" icon={<User size={15} />}>{profile.firstName}</ProfileField>
                <ProfileField label="Last name" icon={<User size={15} />}>{profile.lastName}</ProfileField>
                <ProfileField label="Email" icon={<Mail size={15} />}>
                  {profile.email}
                  {profile.pendingEmail && (
                    <div style={{ marginTop: '0.25rem' }}>
                      <Badge variant="warning" size="sm">Pending: {profile.pendingEmail}</Badge>
                    </div>
                  )}
                </ProfileField>
                <ProfileField label="Phone" icon={<Phone size={15} />}>{profile.phone}</ProfileField>
              </ProfileFieldList>
            </Card>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <Card title="Account & Access">
                <ProfileFieldList>
                  <ProfileField label="Account status" icon={<ShieldCheck size={15} />}>
                    <AccountStatusBadge status={profile.status} />
                  </ProfileField>
                  <ProfileField label="Roles" icon={<ShieldCheck size={15} />}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <RoleBadges roles={profile.roles} />
                    </div>
                  </ProfileField>
                </ProfileFieldList>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
                  Roles and account status are managed by a system administrator.
                </p>
              </Card>

              <Card title="Security & Settings">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  <SecurityAction
                    icon={<Mail size={18} />}
                    title="Change email address"
                    description="Request a new sign-in email. It must be verified before it takes effect."
                    onClick={() => navigate(ROUTES.PROFILE_EMAIL_CHANGE)}
                  />
                  <SecurityAction
                    icon={<KeyRound size={18} />}
                    title="Change password"
                    description="Update the password you use to sign in."
                    onClick={() => navigate(ROUTES.PROFILE_CHANGE_PASSWORD)}
                  />
                  {!isAdmin && !isStaff && (
                    <SecurityAction
                      icon={<Home size={18} />}
                      title="My apartment relationships"
                      description="View or request owner and tenant links to apartment units."
                      onClick={() => navigate(ROUTES.RELATIONSHIPS)}
                    />
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default ProfilePage;
