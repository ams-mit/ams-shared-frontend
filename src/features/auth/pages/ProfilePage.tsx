import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/store/hooks';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';
import { User, Mail, Shield, Key, KeyRound, CheckCircle2 } from 'lucide-react';
import { authApi } from '../api/authApi';
import type { User as UserType } from '../store/authSlice';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const reduxUser = useAppSelector((state) => state.auth.user);
  const [profile, setProfile] = useState<UserType | null>(reduxUser);

  useEffect(() => {
    let isMounted = true;
    authApi
      .getProfile()
      .then((data) => {
        if (isMounted && data) {
          setProfile((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => {
        // Silent catch: fallback to redux user data
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const currentUser = profile || reduxUser;
  const firstName = currentUser?.firstName || currentUser?.name?.split(' ')[0] || 'Authorized';
  const lastName = currentUser?.lastName || currentUser?.name?.split(' ').slice(1).join(' ') || 'User';
  const accountStatus = currentUser?.accountStatus || 'ACTIVE';
  const grantedRoles = currentUser?.grantedRoles && currentUser.grantedRoles.length > 0
    ? currentUser.grantedRoles
    : [currentUser?.role || 'ADMIN'];

  return (
    <PageContainer
      title="My Profile"
      description="View read-only account credentials, assigned security roles, and account status."
      actions={
        <Button
          variant="primary"
          leftIcon={<KeyRound size={16} />}
          onClick={() => navigate(ROUTES.PROFILE_CHANGE_PASSWORD)}
        >
          Change Password
        </Button>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        <Card title="Read-Only Identity Information">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                }}
              >
                {firstName.charAt(0)}{lastName.charAt(0)}
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                  {firstName} {lastName}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-secondary)' }}>
                  {currentUser?.email || 'user@ams.internal'}
                </p>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  <User size={16} /> First Name
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  {firstName}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  <User size={16} /> Last Name
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  {lastName}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  <Mail size={16} /> Corporate Email
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  {currentUser?.email || 'user@ams.internal'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  <CheckCircle2 size={16} /> Account Status
                </span>
                <Badge variant={accountStatus === 'ACTIVE' ? 'success' : 'warning'}>
                  {accountStatus}
                </Badge>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  <Shield size={16} /> Granted Roles
                </span>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {grantedRoles.map((r) => (
                    <Badge key={r} variant="accent">
                      {r}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Security & Credentials">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Key size={20} color="var(--color-accent)" />
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600 }}>Security Authentication</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', marginTop: '2px' }}>
                  Manage corporate password policy and authentication credentials.
                </p>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
              <Button
                variant="secondary"
                fullWidth
                leftIcon={<KeyRound size={16} />}
                onClick={() => navigate(ROUTES.PROFILE_CHANGE_PASSWORD)}
              >
                Go to Change Password Page
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};

export default ProfilePage;
