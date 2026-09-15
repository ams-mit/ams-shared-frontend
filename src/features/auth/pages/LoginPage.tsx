import React, { useState } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { setCredentials } from '@/features/auth/store/authSlice';
import { ROUTES } from '@/constants/routes';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/feedback/Alert';
import { Building2, LogIn, AlertTriangle, UserPlus } from 'lucide-react';

import { authApi } from '@/features/auth/api/authApi';

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const reduxAuthError = useAppSelector((state) => state.auth.error);

  const isSessionExpired =
    searchParams.get('reason') === 'session_expired' ||
    (location.state as { reason?: string })?.reason === 'session_expired' ||
    reduxAuthError?.includes('expired');

  const [email, setEmail] = useState('admin@ams.internal');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.login({ email: trimmedEmail, password });
      setLoading(false);

      if (response.user.accountStatus === 'LOCKED') {
        setError('Your account has been locked due to multiple failed attempts. Please contact support.');
        return;
      }
      if (response.user.accountStatus === 'INACTIVE' || response.user.accountStatus === 'SUSPENDED') {
        setError(`Your account status is ${response.user.accountStatus}. Access is restricted.`);
        return;
      }

      dispatch(
        setCredentials({
          user: response.user,
          token: response.token,
          mustChangePassword: response.mustChangePassword,
        })
      );

      if (response.mustChangePassword || response.user.mustChangePassword) {
        navigate(ROUTES.FORCE_CHANGE_PASSWORD);
      } else {
        navigate(ROUTES.DASHBOARD);
      }
    } catch (_err: unknown) {
      // Fallback for dev / mock environment
      setTimeout(() => {
        setLoading(false);

        // Simulated role mapping based on test email
        let role: 'ADMIN' | 'MANAGER' | 'OWNER' | 'TENANT' | 'STAFF' = 'ADMIN';
        let relStatus: 'OWNER' | 'TENANT' | 'STAFF' | 'RESIDENT' | 'NONE' = 'STAFF';

        if (trimmedEmail.includes('owner')) {
          role = 'OWNER';
          relStatus = 'OWNER';
        } else if (trimmedEmail.includes('tenant')) {
          role = 'TENANT';
          relStatus = 'TENANT';
        } else if (trimmedEmail.includes('resident')) {
          role = 'TENANT';
          relStatus = 'RESIDENT';
        } else if (trimmedEmail.includes('staff')) {
          role = 'STAFF';
          relStatus = 'STAFF';
        }

        const isMustChangePassword = trimmedEmail.includes('force') || password === 'temp123';

        dispatch(
          setCredentials({
            user: {
              id: 'usr-001',
              name: trimmedEmail.split('@')[0].toUpperCase(),
              email: trimmedEmail,
              role,
              relationshipStatus: relStatus,
              mustChangePassword: isMustChangePassword,
            },
            token: 'mock-jwt-token-ams-session-key',
            mustChangePassword: isMustChangePassword,
          })
        );

        if (isMustChangePassword) {
          navigate(ROUTES.FORCE_CHANGE_PASSWORD);
        } else {
          navigate(ROUTES.DASHBOARD);
        }
      }, 400);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-background)',
        padding: '24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <Building2 size={28} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            AMS Portal
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-secondary)', marginTop: '4px' }}>
            Apartment Management System
          </p>
        </div>

        <Card>
          {isSessionExpired && !error && (
            <div style={{ marginBottom: '16px' }}>
              <Alert
                variant="warning"
                title="Session Expired"
                icon={<AlertTriangle size={18} />}
              >
                {reduxAuthError || 'Your session has expired. Please sign in again to continue.'}
              </Alert>
            </div>
          )}

          {error && (
            <div style={{ marginBottom: '16px' }}>
              <Alert variant="error">{error}</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Corporate Email"
              type="email"
              isRequired
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder="user@ams.internal"
            />

            <Input
              label="Password"
              type="password"
              isRequired
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="••••••••"
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link to={ROUTES.FORGOT_PASSWORD} style={{ fontSize: '0.8125rem', color: 'var(--color-accent)', textDecoration: 'none' }}>
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={loading}
              leftIcon={<LogIn size={16} />}
            >
              Sign In to AMS
            </Button>

            <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '8px', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Button
                type="button"
                variant="secondary"
                fullWidth
                leftIcon={<UserPlus size={16} />}
                onClick={() => navigate(ROUTES.REGISTER)}
              >
                Register New Account
              </Button>

              <div style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--color-secondary)' }}>
                Don't have an account yet?{' '}
                <Link to={ROUTES.REGISTER} style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
                  Create Account
                </Link>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
