import React, { useState } from 'react';
import { KeyRound, RefreshCw, Save, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/feedback/Alert';
import { validatePasswordPolicy } from '@/features/auth/validation/passwordValidation';
import { ACCOUNT_STATUS_CONFIG, ALLOWED_STATUS_TRANSITIONS } from '../constants/accountStatus';
import { hasErrors, validateUserForm, type FieldErrors } from '../validation/userValidation';
import { getFullName } from '../utils/userFormat';
import { generateTemporaryPassword } from '../utils/temporaryPassword';
import type { AccountStatus, UserFormValues } from '../types/user.types';
import { RoleSelector } from './RoleSelector';

export const EMPTY_USER_FORM: UserFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  roles: [],
  status: 'ACTIVE',
  temporaryPassword: '',
};

const statusOptions = (current: AccountStatus) =>
  [current, ...ALLOWED_STATUS_TRANSITIONS[current]].map((status) => ({
    value: status,
    label: ACCOUNT_STATUS_CONFIG[status].label,
    subLabel: ACCOUNT_STATUS_CONFIG[status].description,
  }));

export interface UserFormProps {
  mode: 'create' | 'edit';
  initialValues?: UserFormValues;
  isSubmitting: boolean;
  submitError?: string | null;
  onSubmit: (values: UserFormValues) => void;
  onCancel: () => void;
}

export const UserForm: React.FC<UserFormProps> = ({
  mode,
  initialValues = EMPTY_USER_FORM,
  isSubmitting,
  submitError,
  onSubmit,
  onCancel,
}) => {
  const isCreate = mode === 'create';
  const [values, setValues] = useState<UserFormValues>(() =>
    isCreate && !initialValues.temporaryPassword
      ? { ...initialValues, temporaryPassword: generateTemporaryPassword() }
      : initialValues
  );
  const [errors, setErrors] = useState<FieldErrors<UserFormValues>>({});

  const setField = <K extends keyof UserFormValues>(field: K, value: UserFormValues[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateUserForm(values, { requireRole: isCreate });
    if (isCreate) {
      const passwordError = validatePasswordPolicy(values.temporaryPassword, 'Temporary password');
      if (passwordError) validation.temporaryPassword = passwordError;
    }
    setErrors(validation);
    if (!hasErrors(validation)) onSubmit(values);
  };

  const fullName = getFullName(values);

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {hasErrors(errors) && (
        <Alert
          key={Object.keys(errors).join()}
          type="error"
          title="Please fix the highlighted fields"
          message="Some required information is missing or invalid."
          autoDismiss={false}
          showDismissButton={false}
        />
      )}
      {submitError && (
        <Alert key={submitError} type="error" title="Could not save user" message={submitError} autoDismiss={false} />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <Input
          label="First Name"
          required
          value={values.firstName}
          onChange={(e) => setField('firstName', e.target.value)}
          error={errors.firstName}
          aria-invalid={Boolean(errors.firstName)}
          disabled={isSubmitting}
          autoComplete="given-name"
          placeholder="e.g. Jordan"
        />
        <Input
          label="Last Name"
          required
          value={values.lastName}
          onChange={(e) => setField('lastName', e.target.value)}
          error={errors.lastName}
          aria-invalid={Boolean(errors.lastName)}
          disabled={isSubmitting}
          autoComplete="family-name"
          placeholder="e.g. Lee"
        />
      </div>

      <Input
        label="Full Name"
        value={fullName}
        readOnly
        disabled
        helperText="Generated automatically from the first and last name."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <Input
          label="Email"
          type="email"
          required
          value={values.email}
          onChange={(e) => setField('email', e.target.value)}
          error={errors.email}
          aria-invalid={Boolean(errors.email)}
          disabled={isSubmitting}
          autoComplete="email"
          placeholder="name@example.com"
        />
        <Input
          label="Phone"
          type="tel"
          value={values.phone}
          onChange={(e) => setField('phone', e.target.value)}
          error={errors.phone}
          aria-invalid={Boolean(errors.phone)}
          disabled={isSubmitting}
          autoComplete="tel"
          placeholder="+1 555-0100"
          helperText="Optional."
        />
      </div>

      {isCreate ? (
        <fieldset
          style={{
            margin: 0,
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface-hover)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <legend
            style={{
              padding: '0 0.375rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--color-text)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
            }}
          >
            <KeyRound size={15} color="var(--color-secondary)" aria-hidden="true" />
            Temporary password
          </legend>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '0.5rem' }}>
            <div style={{ flex: '1 1 220px' }}>
              <Input
                aria-label="Temporary password"
                value={values.temporaryPassword}
                onChange={(e) => setField('temporaryPassword', e.target.value)}
                error={errors.temporaryPassword}
                aria-invalid={Boolean(errors.temporaryPassword)}
                disabled={isSubmitting}
                autoComplete="off"
                spellCheck={false}
                style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}
                helperText="At least 8 characters, including a number."
              />
            </div>
            <Button
              type="button"
              variant="outline"
              leftIcon={<RefreshCw size={14} />}
              onClick={() => setField('temporaryPassword', generateTemporaryPassword())}
              disabled={isSubmitting}
              style={{ minHeight: '40px' }}
            >
              Generate
            </Button>
          </div>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            The account is created as <strong>Active</strong>. The user signs in with this password and should then
            change it from their profile. It is shown again only on the next screen.
          </p>
        </fieldset>
      ) : (
        <Select
          label="Account Status"
          required
          options={statusOptions(initialValues.status)}
          value={values.status}
          onChange={(e) => setField('status', e.target.value as AccountStatus)}
          disabled={isSubmitting || ALLOWED_STATUS_TRANSITIONS[initialValues.status].length === 0}
          searchable={false}
          helperText={
            ALLOWED_STATUS_TRANSITIONS[initialValues.status].length === 0
              ? 'This status is final and cannot be changed.'
              : 'Only status changes allowed by the identity service are listed.'
          }
        />
      )}

      {isCreate && (
        <RoleSelector
          required
          selected={values.roles}
          onChange={(roles) => setField('roles', roles)}
          error={errors.roles}
          disabled={isSubmitting}
        />
      )}

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          gap: '0.75rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--color-border-subtle)',
        }}
      >
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          leftIcon={isCreate ? <UserPlus size={16} /> : <Save size={16} />}
        >
          {isCreate ? 'Create User' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};
