import type { FieldErrors } from '@/features/users/validation/userValidation';

// Password policy from identity-access-service (RegisterRequest, AdminCreateUserRequest,
// ChangePasswordRequest): 8–100 characters with at least one digit. Every password
// form uses these rules so the UI never rejects a password the API accepts, or vice versa.

export interface PasswordRule {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 100;

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: 'length',
    label: `At least ${PASSWORD_MIN_LENGTH} characters`,
    test: (pw) => pw.length >= PASSWORD_MIN_LENGTH && pw.length <= PASSWORD_MAX_LENGTH,
  },
  { id: 'number', label: 'At least one number', test: (pw) => /\d/.test(pw) },
];

/** Returns an error message when the password breaks the policy, otherwise undefined. */
export const validatePasswordPolicy = (password: string, label = 'Password'): string | undefined => {
  if (!password) return `${label} is required.`;
  if (PASSWORD_RULES.some((rule) => !rule.test(password))) {
    return `${label} must be at least ${PASSWORD_MIN_LENGTH} characters and include a number.`;
  }
  return undefined;
};

export interface ChangePasswordValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const validateChangePassword = (values: ChangePasswordValues): FieldErrors<ChangePasswordValues> => {
  const errors: FieldErrors<ChangePasswordValues> = {};

  if (!values.currentPassword) errors.currentPassword = 'Current password is required.';

  const policyError = validatePasswordPolicy(values.newPassword, 'New password');
  if (policyError) {
    errors.newPassword = policyError;
  } else if (values.newPassword === values.currentPassword) {
    errors.newPassword = 'New password must be different from your current password.';
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your new password.';
  } else if (values.confirmPassword !== values.newPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
};
