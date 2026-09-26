import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/feedback/Alert';
import { Building2, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
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

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
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
              <Alert variant="error">{error}</Alert>
            </div>
          )}

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ marginBottom: '16px' }}>
                <Alert variant="success" icon={<CheckCircle2 size={18} />}>
                  Instructions sent! If an account exists for <strong>{email}</strong>, password reset instructions have been dispatched.
                </Alert>
              </div>

              <Button
                variant="secondary"
                fullWidth
                leftIcon={<ArrowLeft size={16} />}
                onClick={() => navigate(ROUTES.LOGIN)}
              >
                Back to Login
              </Button>
            </div>
          ) : (
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

              <Button
                type="submit"
                variant="primary"
                fullWidth
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
