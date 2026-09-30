import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Plus } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Alert } from '@/components/feedback/Alert';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { ROUTES } from '@/constants/routes';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { useFlashMessage } from '@/hooks/useFlashMessage';
import { useCurrentAccess } from '@/features/users/hooks/useCurrentAccess';
import { relationshipApi } from '../api/relationshipApi';
import { RELATIONSHIP_STATUSES, RELATIONSHIP_STATUS_CONFIG } from '../constants/relationships';
import { RelationshipCard } from '../components/RelationshipCard';

export const MyRelationshipsPage: React.FC = () => {
  const navigate = useNavigate();
  const flash = useFlashMessage();
  const { userId } = useCurrentAccess();
  const { data: relationships, loading, error, reload } = useAsyncResource(
    () => relationshipApi.getMyRelationships(userId),
    [userId]
  );

  const summary = useMemo(
    () =>
      RELATIONSHIP_STATUSES.map((status) => ({
        status,
        count: (relationships ?? []).filter((r) => r.status === status).length,
      })),
    [relationships]
  );

  const goToRequest = () => navigate(ROUTES.RELATIONSHIP_REQUEST);

  return (
    <PageContainer
      title="My Relationships"
      subtitle="Your owner and tenant links to apartment units, and the status of each request."
      actions={
        <Button variant="primary" leftIcon={<Plus size={16} />} onClick={goToRequest}>
          Request Relationship
        </Button>
      }
    >
      {loading ? (
        <LoadingState message="Loading your relationships..." />
      ) : error || !relationships ? (
        <ErrorMessage title="Could not load your relationships" message={error ?? 'No data returned.'} onRetry={reload} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {flash && <Alert type="success" message={flash} />}

          {relationships.length === 0 ? (
            <EmptyState
              icon={<Home size={26} />}
              title="No apartment relationships yet"
              description="Request a link to the unit you own or live in. An administrator will verify it before it becomes active."
              actionText="Request Relationship"
              onAction={goToRequest}
            />
          ) : (
            <>
              <ul
                aria-label="Relationship summary"
                style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}
              >
                {summary.map(({ status, count }) => (
                  <li
                    key={status}
                    style={{
                      padding: '0.5rem 0.875rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      fontSize: '0.8125rem',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    <strong style={{ color: 'var(--color-primary)', fontSize: '1rem', marginRight: '0.375rem' }}>{count}</strong>
                    {RELATIONSHIP_STATUS_CONFIG[status].label}
                  </li>
                ))}
              </ul>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {relationships.map((relationship) => (
                  <RelationshipCard key={relationship.relationshipId} relationship={relationship} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </PageContainer>
  );
};

export default MyRelationshipsPage;
