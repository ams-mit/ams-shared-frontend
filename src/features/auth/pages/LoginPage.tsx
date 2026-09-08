import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/app/store/hooks';
import { setCredentials } from '@/features/auth/store/authSlice';
import { ROUTES } from '@/constants/routes';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/feedback/Alert';
import { Building2, LogIn } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@ams.internal');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    // Mock authentication login
    setTimeout(() => {
      setLoading(false);
      dispatch(
        setCredentials({
          user: {
            id: 'usr-001',
            name: 'Sarah Connor',
            email,
            role: 'ADMIN',
          },
          token: 'mock-jwt-token-ams-session-key',
        })
      );
      navigate(ROUTES.DASHBOARD);
    }, 500);
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
          {error && <Alert variant="error">{error}</Alert>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Corporate Email"
              type="email"
              isRequired
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@ams.internal"
            />

            <Input
              label="Password"
              type="password"
              isRequired
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <a href="#forgot" style={{ fontSize: '0.8125rem' }}>
                Forgot credentials?
              </a>
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
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
