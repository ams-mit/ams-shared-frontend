import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/feedback/Alert';
import { Building2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { authApi } from '../api/authApi';
import { PasswordRequirements } from '../components/PasswordRequirements';
import { validatePasswordPolicy } from '../validation/passwordValidation';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // The emailed link may carry the token; otherwise the user pastes the code from the email.
  const [resetToken, setResetToken] = useState(searchParams.get('token') ?? searchParams.get('resetToken') ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!resetToken.trim()) {
      setError('Enter the reset code from your email.');
      return;
    }

    const policyError = validatePasswordPolicy(password, 'New password');
    if (policyError) {
      setError(policyError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({
        resetToken: resetToken.trim(),
        newPassword: password,
        confirmNewPassword: confirmPassword,
      });
      setSuccess(true);
      setTimeout(() => navigate(ROUTES.LOGIN), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Your password could not be reset.');
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
            Set New Password
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-secondary)', marginTop: '4px' }}>
            Enter your new secure credential below
          </p>
        </div>

        <Card>
          {error && <Alert type="error" message={error} autoDismiss={false} />}
          {success && (
            <Alert type="success" message="Password updated successfully! Redirecting to login..." autoDismiss={false} />
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Reset Code"
              required
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
              autoComplete="one-time-code"
              spellCheck={false}
              helperText="From the password reset email."
            />

            <Input
              label="New Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <Input
              label="Confirm New Password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
            <PasswordRequirements password={password} />

            <Button
              type="submit"
              variant="primary"
              style={{ width: '100%' }}
              isLoading={loading}
              leftIcon={<ShieldCheck size={16} />}
            >
              Update Password
            </Button>

            <div style={{ textAlign: 'center', fontSize: '0.875rem', marginTop: '8px' }}>
              <Link to={ROUTES.LOGIN} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-secondary)' }}>
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
