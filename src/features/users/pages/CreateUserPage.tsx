import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Copy, UserCheck, UserPlus } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/feedback/Alert';
import { ROUTES, buildUserDetailPath } from '@/constants/routes';
import { userApi } from '../api/userApi';
import { getFullName } from '../utils/userFormat';
import { UserForm } from '../components/UserForm';
import type { UserAccount, UserFormValues } from '../types/user.types';

interface CreatedAccount {
  user: UserAccount;
  temporaryPassword: string;
}

/** Shown once after creation — the temporary password is not retrievable afterwards. */
const AccountCreatedPanel: React.FC<{
  created: CreatedAccount;
  onViewUser: () => void;
  onCreateAnother: () => void;
}> = ({ created, onViewUser, onCreateAnother }) => {
  const [copied, setCopied] = useState(false);

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(created.temporaryPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <Alert
        type="success"
        title="Account created"
        message={`${getFullName(created.user)} (${created.user.email}) can now sign in.`}
        autoDismiss={false}
        showDismissButton={false}
      />
      <div>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Temporary password</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
          <code
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1rem',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface-hover)',
              color: 'var(--color-text)',
              letterSpacing: '0.04em',
            }}
          >
            {created.temporaryPassword}
          </code>
          <Button
            variant="outline"
            size="sm"
            leftIcon={copied ? <Check size={14} /> : <Copy size={14} />}
            onClick={copyPassword}
            aria-live="polite"
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
          Share it with the user securely. They must replace it with their own password the first time they sign
          in. For security it will not be shown again.
        </p>
      </div>
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
        <Button variant="outline" leftIcon={<UserPlus size={16} />} onClick={onCreateAnother}>
          Create Another
        </Button>
        <Button variant="primary" leftIcon={<UserCheck size={16} />} onClick={onViewUser}>
          View User
        </Button>
      </div>
    </div>
  );
};

export const CreateUserPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedAccount | null>(null);
  const [formKey, setFormKey] = useState(0);

  const handleSubmit = async (values: UserFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const user = await userApi.createUser(values);
      setCreated({ user, temporaryPassword: values.temporaryPassword });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'The user could not be created.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const createAnother = () => {
    setCreated(null);
    setFormKey((key) => key + 1);
  };

  return (
    <PageContainer
      title="Create User"
      subtitle="Register a new AMS user account and assign their initial roles."
      maxWidth="960px"
      actions={
        <Button variant="outline" leftIcon={<ArrowLeft size={16} />} onClick={() => navigate(ROUTES.USERS)}>
          Back to Users
        </Button>
      }
    >
      <Card padding="lg">
        {created ? (
          <AccountCreatedPanel
            created={created}
            onViewUser={() => navigate(buildUserDetailPath(created.user.id))}
            onCreateAnother={createAnother}
          />
        ) : (
          <UserForm
            key={formKey}
            mode="create"
            isSubmitting={isSubmitting}
            submitError={submitError}
            onSubmit={handleSubmit}
            onCancel={() => navigate(ROUTES.USERS)}
          />
        )}
      </Card>
    </PageContainer>
  );
};

export default CreateUserPage;
