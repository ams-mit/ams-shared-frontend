import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { ROUTES } from '@/constants/routes';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { userApi } from '../api/userApi';

export const RolesPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: roles, loading, error, reload } = useAsyncResource(() => userApi.getRoles(), []);

  return (
    <PageContainer
      title="Role Reference"
      subtitle="The system roles that can be assigned to AMS user accounts."
      maxWidth="960px"
      actions={
        <Button variant="outline" leftIcon={<ArrowLeft size={16} />} onClick={() => navigate(ROUTES.USERS)}>
          Back to Users
        </Button>
      }
    >
      {loading ? (
        <LoadingState message="Loading roles..." />
      ) : error || !roles ? (
        <ErrorMessage title="Could not load roles" message={error ?? 'No roles returned.'} onRetry={reload} />
      ) : (
        <Card padding="none">
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {roles.map((role, index) => (
              <li
                key={role.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.875rem',
                  padding: '1rem 1.5rem',
                  borderTop: index === 0 ? 'none' : '1px solid var(--color-border-subtle)',
                }}
              >
                <ShieldCheck size={18} color="var(--color-accent)" aria-hidden="true" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{role.name}</span>
                    <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {role.id}
                    </code>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.125rem' }}>
                    {role.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </PageContainer>
  );
};

export default RolesPage;
