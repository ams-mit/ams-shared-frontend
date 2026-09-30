import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, ShieldAlert } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { setMustChangePassword } from '@/features/auth/store/authSlice';
import { ROUTES } from '@/constants/routes';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/feedback/Alert';
import { hasErrors, type FieldErrors } from '@/features/users/validation/userValidation';
import { authApi, AuthError } from '../api/authApi';
import { AuthPageShell } from '../components/AuthPageShell';
import { PasswordRequirements } from '../components/PasswordRequirements';
import { validatePasswordPolicy } from '../validation/passwordValidation';

interface ForcedChangeValues {
  newPassword: string;
  confirmPassword: string;
}

export const ForceChangePasswordPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, currentUser } = useAppSelector((state) => state.auth);
  const userId = user?.id ?? currentUser.id;

  const [values, setValues] = useState<ForcedChangeValues>({ newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState<FieldErrors<ForcedChangeValues>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setField = (field: keyof ForcedChangeValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const validation: FieldErrors<ForcedChangeValues> = {};
    const policyError = validatePasswordPolicy(values.newPassword, 'New password');
    if (policyError) validation.newPassword = policyError;
    if (!values.confirmPassword) validation.confirmPassword = 'Please confirm your new password.';
    else if (values.confirmPassword !== values.newPassword) validation.confirmPassword = 'Passwords do not match.';
    setErrors(validation);
    if (hasErrors(validation)) return;

    setLoading(true);
    try {
      await authApi.forceChangePassword({ userId, newPassword: values.newPassword });
      dispatch(setMustChangePassword(false));
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setSubmitError(err instanceof AuthError ? err.message : 'Your password could not be changed.');
      setLoading(false);
    }
  };

  return (
    <AuthPageShell
      icon={<ShieldAlert size={26} />}
      title="Set your password"
      subtitle="You signed in with a temporary password. Choose your own password to continue."
    >
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {submitError && <Alert key={submitError} type="error" message={submitError} autoDismiss={false} />}
        <Input
          label="New Password"
          type="password"
          required
          autoComplete="new-password"
          value={values.newPassword}
          onChange={(e) => setField('newPassword', e.target.value)}
          error={errors.newPassword}
          aria-describedby="forced-password-rules"
          disabled={loading}
        />
        <PasswordRequirements id="forced-password-rules" password={values.newPassword} />
        <Input
          label="Confirm New Password"
          type="password"
          required
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={(e) => setField('confirmPassword', e.target.value)}
          error={errors.confirmPassword}
          disabled={loading}
        />
        <Button type="submit" variant="primary" isLoading={loading} leftIcon={<KeyRound size={16} />} style={{ width: '100%' }}>
          Save Password &amp; Continue
        </Button>
      </form>
    </AuthPageShell>
  );
};

export default ForceChangePasswordPage;
