import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { ROUTES, buildUserDetailPath } from '@/constants/routes';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { withFlash } from '@/hooks/useFlashMessage';
import { userApi } from '../api/userApi';
import { getFullName } from '../utils/userFormat';
import { UserForm } from '../components/UserForm';
import type { UserFormValues } from '../types/user.types';

export const EditUserPage: React.FC = () => {
  const { userId = '' } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { data: user, loading, error, reload } = useAsyncResource(() => userApi.getUserById(userId), [userId]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const backToDetail = () => navigate(buildUserDetailPath(userId));

  const handleSubmit = async (values: UserFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const updated = await userApi.updateUser(userId, values);
      navigate(buildUserDetailPath(userId), withFlash(`${getFullName(updated)}'s account details were updated.`));
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'The changes could not be saved.');
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer
      title={user ? `Edit ${getFullName(user)}` : 'Edit User'}
      subtitle="Update account details and status. Roles are managed on the user's detail page."
      maxWidth="960px"
      actions={
        <Button variant="outline" leftIcon={<ArrowLeft size={16} />} onClick={user ? backToDetail : () => navigate(ROUTES.USERS)}>
          {user ? 'Back to User' : 'Back to Users'}
        </Button>
      }
    >
      {loading ? (
        <LoadingState message="Loading user account..." />
      ) : error || !user ? (
        <ErrorMessage title="Could not load user" message={error ?? 'User not found.'} onRetry={reload} />
      ) : (
        <Card padding="lg">
          <UserForm
            mode="edit"
            initialValues={{
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phone: user.phone ?? '',
              roles: user.roles,
              status: user.status,
              temporaryPassword: '',
            }}
            isSubmitting={isSubmitting}
            submitError={submitError}
            onSubmit={handleSubmit}
            onCancel={backToDetail}
          />
        </Card>
      )}
    </PageContainer>
  );
};

export default EditUserPage;
