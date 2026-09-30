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
      </form>
    </AuthPageShell>
  );
};

export default LoginPage;
