import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building, Home, LogIn, UserPlus } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/feedback/Alert';
import { getRoleLabel } from '@/features/users/constants/systemRoles';
import {
  hasErrors,
  stripEmpty,
  validateEmailField,
  validatePersonName,
  validatePhoneField,
  type FieldErrors,
} from '@/features/users/validation/userValidation';
import type { SelfRegistrationRole } from '@/features/users/types/user.types';
import { authApi, AuthError, type RegisterRequest } from '../api/authApi';
import { AuthPageShell } from '../components/AuthPageShell';
import { PasswordRequirements } from '../components/PasswordRequirements';
import { validatePasswordPolicy } from '../validation/passwordValidation';

const ROLE_OPTIONS: { role: SelfRegistrationRole; description: string; icon: React.ReactNode }[] = [
  { role: 'TENANT_RESIDENT', description: 'You live in a unit as a tenant or household member.', icon: <Home size={18} /> },
  { role: 'OWNER', description: 'You own a unit in the building.', icon: <Building size={18} /> },
];

const EMPTY_FORM: RegisterRequest = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  requestedRole: 'TENANT_RESIDENT',
  password: '',
  confirmPassword: '',
};

const validate = (values: RegisterRequest): FieldErrors<RegisterRequest> =>
  stripEmpty<RegisterRequest>({
    firstName: validatePersonName(values.firstName, 'First name'),
    lastName: validatePersonName(values.lastName, 'Last name'),
    email: validateEmailField(values.email),
    phone: validatePhoneField(values.phone ?? ''),
    password: validatePasswordPolicy(values.password),
    confirmPassword: !values.confirmPassword
      ? 'Please confirm your password.'
      : values.confirmPassword !== values.password
      ? 'Passwords do not match.'
      : undefined,
  });

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState<RegisterRequest>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors<RegisterRequest>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setField = <K extends keyof RegisterRequest>(field: K, value: RegisterRequest[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const validation = validate(values);
    setErrors(validation);
    if (hasErrors(validation)) return;

    setLoading(true);
    try {
      const response = await authApi.register(values);
      setSubmitted(response.message);
    } catch (err) {
      setSubmitError(err instanceof AuthError ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthPageShell icon={<UserPlus size={26} />} title="Request submitted" subtitle="Apartment Management System">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Alert type="success" message={submitted} autoDismiss={false} showDismissButton={false} />
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            You'll be able to sign in with <strong>{values.email.trim()}</strong> once an administrator approves your
            request.
          </p>
          <Button variant="primary" leftIcon={<LogIn size={16} />} onClick={() => navigate(ROUTES.LOGIN)} style={{ width: '100%' }}>
            Back to Sign In
          </Button>
        </div>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell
      icon={<UserPlus size={26} />}
      title="Request an AMS account"
      subtitle="For residents and owners. Staff accounts are created by an administrator."
      maxWidth="560px"
      footer={
        <>
          Already have an account? <Link to={ROUTES.LOGIN}>Sign in</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {hasErrors(errors) && (
          <Alert
            key={Object.keys(errors).join()}
            type="error"
            title="Please fix the highlighted fields"
            message="Your request has not been submitted yet."
            autoDismiss={false}
            showDismissButton={false}
          />
        )}
        {submitError && <Alert key={submitError} type="error" message={submitError} autoDismiss={false} />}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <Input
            label="First Name"
            required
            autoComplete="given-name"
            value={values.firstName}
            onChange={(e) => setField('firstName', e.target.value)}
            error={errors.firstName}
            disabled={loading}
          />
          <Input
            label="Last Name"
            required
            autoComplete="family-name"
            value={values.lastName}
            onChange={(e) => setField('lastName', e.target.value)}
            error={errors.lastName}
            disabled={loading}
          />
        </div>
        <Input
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={values.email}
          onChange={(e) => setField('email', e.target.value)}
          error={errors.email}
          disabled={loading}
        />
        <Input
          label="Phone"
          type="tel"
          autoComplete="tel"
          value={values.phone}
          onChange={(e) => setField('phone', e.target.value)}
          error={errors.phone}
          helperText="Optional."
          disabled={loading}
        />

        <fieldset style={{ border: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <legend style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>
            I am a <span style={{ color: 'var(--color-danger)' }}>*</span>
          </legend>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.625rem' }}>
            {ROLE_OPTIONS.map(({ role, description, icon }) => {
              const checked = values.requestedRole === role;
              return (
                <label
                  key={role}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.625rem',
                    padding: '0.75rem 0.875rem',
                    borderRadius: 'var(--radius-md)',
                    border: checked ? '1.5px solid var(--color-accent)' : '1px solid var(--color-border)',
                    backgroundColor: checked ? 'var(--color-accent-subtle)' : 'var(--color-surface)',
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="requestedRole"
                    value={role}
                    checked={checked}
                    onChange={() => setField('requestedRole', role)}
                    disabled={loading}
                    style={{ marginTop: '0.2rem', accentColor: 'var(--color-accent)' }}
                  />
                  <span style={{ color: checked ? 'var(--color-accent-active)' : 'var(--color-secondary)', marginTop: '1px' }} aria-hidden="true">
                    {icon}
                  </span>
                  <span>
                    <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600 }}>{getRoleLabel(role)}</span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{description}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <Input
            label="Password"
            type="password"
            required
            autoComplete="new-password"
            value={values.password}
            onChange={(e) => setField('password', e.target.value)}
            error={errors.password}
            aria-describedby="register-password-rules"
            disabled={loading}
          />
          <Input
            label="Confirm Password"
            type="password"
            required
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={(e) => setField('confirmPassword', e.target.value)}
            error={errors.confirmPassword}
            disabled={loading}
          />
        </div>
        <PasswordRequirements id="register-password-rules" password={values.password} />

        <Button type="submit" variant="primary" isLoading={loading} leftIcon={<UserPlus size={16} />} style={{ width: '100%' }}>
          Submit Request
        </Button>
      </form>
    </AuthPageShell>
  );
};

export default RegisterPage;
