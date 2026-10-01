import React, { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, LogIn } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { setCredentials } from '@/features/auth/store/authSlice';
import { ROUTES } from '@/constants/routes';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/feedback/Alert';
import { authApi, AuthError } from '../api/authApi';
import { AuthPageShell } from '../components/AuthPageShell';
import { USE_MOCK_DATA, resetDemoData } from '@/services/mock/mockMode';

// Seeded demo accounts (see userMockStore). Shown only in the demo build.
const DEMO_ACCOUNTS = [
  { label: 'Administrator', email: 'admin@ams-community.org', password: 'admin123' },
  { label: 'Security staff', email: 'security.staff@ams-community.org', password: 'staff123' },
  { label: 'Finance officer', email: 'grace.o@ams-community.org', password: 'finance123' },
  { label: 'Resident (tenant)', email: 'sarah.j@ams-community.org', password: 'resident123' },
  { label: 'Owner', email: 'michael.c@ams-community.org', password: 'owner123' },
];

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const reduxAuthError = useAppSelector((state) => state.auth.error);

  const isSessionExpired =
    searchParams.get('reason') === 'session_expired' ||
    (location.state as { reason?: string } | null)?.reason === 'session_expired' ||
    Boolean(reduxAuthError?.includes('expired'));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.login({ email: email.trim(), password });
      dispatch(
        setCredentials({
          user: response.user,
          token: response.token,
          mustChangePassword: response.mustChangePassword,
        })
      );
      navigate(response.mustChangePassword ? ROUTES.FORCE_CHANGE_PASSWORD : ROUTES.DASHBOARD);
    } catch (err) {
      setError(err instanceof AuthError ? err.message : 'Sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <AuthPageShell
      icon={<Building2 size={26} />}
      title="Sign in to AMS"
      subtitle="Apartment Management System"
      footer={
        <>
          New resident or owner? <Link to={ROUTES.REGISTER}>Request an account</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {isSessionExpired && !error && (
          <Alert
            type="warning"
            title="Session expired"
            message={reduxAuthError || 'Your session has expired. Please sign in again.'}
            autoDismiss={false}
          />
        )}
        {error && <Alert key={error} type="error" message={error} autoDismiss={false} />}

        <Input
          label="Email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <div>
          <Input
            label="Password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            helperText="If an administrator created your account, use the temporary password you were given."
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.375rem' }}>
            <Link to={ROUTES.FORGOT_PASSWORD} style={{ fontSize: '0.8125rem' }}>
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" variant="primary" isLoading={loading} leftIcon={<LogIn size={16} />} style={{ width: '100%' }}>
          Sign In
        </Button>

        {USE_MOCK_DATA && (
          <div
            style={{
              borderTop: '1px solid var(--color-border-subtle)',
              paddingTop: '0.875rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              Demo mode: data is stored in this browser. Pick an account to fill in its details.
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {DEMO_ACCOUNTS.map((account) => (
                <Button
                  key={account.email}
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={loading}
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(account.password);
                    setError(null);
                  }}
                >
                  {account.label}
                </Button>
              ))}
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                if (window.confirm('Delete everything created in this demo and restore the original sample data?')) {
                  resetDemoData();
                  window.location.reload();
                }
              }}
              style={{
                alignSelf: 'flex-start',
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              Reset demo data
            </button>
          </div>
        )}
      </form>
    </AuthPageShell>
  );
};

export default LoginPage;
