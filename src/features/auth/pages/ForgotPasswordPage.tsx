import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/feedback/Alert';
import { Building2, KeyRound, ArrowLeft } from 'lucide-react';
import { authApi } from '../api/authApi';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [demoCode, setDemoCode] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Please enter your corporate email address.');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const result = await authApi.forgotPassword(trimmedEmail);
      setDemoCode(result.demoResetCode);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The reset request could not be sent.');
    } finally {
      setLoading(false);
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
            Forgot Password?
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-secondary)', marginTop: '4px' }}>
            Enter your corporate email address and we'll help you reset your password.
          </p>
        </div>

        <Card>
          {error && (
            <div style={{ marginBottom: '16px' }}>
              <Alert type="error" message={error} autoDismiss={false} />
            </div>
          )}

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ marginBottom: '16px' }}>
                <Alert
                  type="success"
                  message={`If an account exists for ${email.trim()}, a password reset code has been emailed to it.`}
                  autoDismiss={false}
                />
              </div>
              {demoCode && (
                <div style={{ marginBottom: '16px' }}>
                  <Alert
                    type="info"
                    title="Demo mode"
                    message={`No email is sent in the demo. Your reset code is ${demoCode} (valid for 30 minutes).`}
                    autoDismiss={false}
                  />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Button
                  variant="primary"
                  style={{ width: '100%' }}
                  leftIcon={<KeyRound size={16} />}
                  onClick={() => navigate(demoCode ? `${ROUTES.RESET_PASSWORD}?token=${demoCode}` : ROUTES.RESET_PASSWORD)}
                >
                  I have a reset code
                </Button>
                <Button
                  variant="secondary"
                  style={{ width: '100%' }}
                  leftIcon={<ArrowLeft size={16} />}
                  onClick={() => navigate(ROUTES.LOGIN)}
                >
                  Back to Login
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input
                label="Corporate Email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="user@ams.internal"
              />

              <Button
                type="submit"
                variant="primary"
                style={{ width: '100%' }}
                isLoading={loading}
                leftIcon={<KeyRound size={16} />}
              >
                Send Reset Instructions
              </Button>

              <div style={{ textAlign: 'center', fontSize: '0.875rem', marginTop: '4px' }}>
                <Link
                  to={ROUTES.LOGIN}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--color-secondary)',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  <ArrowLeft size={14} /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
