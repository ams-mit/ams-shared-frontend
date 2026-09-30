import React, { useMemo, useState } from 'react';
import { Check, ClipboardCheck, Search, X } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Alert } from '@/components/feedback/Alert';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { useCurrentAccess } from '@/features/users/hooks/useCurrentAccess';
import { ConfirmationModal } from '@/features/users/components/ConfirmationModal';
import { relationshipApi } from '../api/relationshipApi';
import {
  REJECTION_REASON_MIN_LENGTH,
  RELATIONSHIP_STATUSES,
  RELATIONSHIP_STATUS_CONFIG,
  RELATIONSHIP_TYPE_CONFIG,
} from '../constants/relationships';
import { RelationshipReviewTable } from '../components/RelationshipReviewTable';
import { RelationshipRequestDetails } from '../components/RelationshipRequestDetails';
import { TextAreaField } from '../components/TextAreaField';
import type { ApartmentRelationship, RelationshipStatus } from '../types/relationship.types';

type StatusFilter = RelationshipStatus | 'ALL';
type ReviewAction = { type: 'approve' | 'reject'; request: ApartmentRelationship };
type Feedback = { type: 'success' | 'error'; message: string };

const FILTERS: StatusFilter[] = [...RELATIONSHIP_STATUSES, 'ALL'];

const FILTER_LABELS: Record<StatusFilter, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  ALL: 'All',
};

const EMPTY_MESSAGES: Record<StatusFilter, string> = {
  PENDING: 'There are no relationship requests waiting for review.',
  APPROVED: 'No requests have been approved yet.',
  REJECTED: 'No requests have been rejected.',
  ALL: 'No relationship requests have been submitted yet.',
};

const describeRequest = (req: ApartmentRelationship) =>
  `${req.requesterName} as ${RELATIONSHIP_TYPE_CONFIG[req.relationshipType].label} of ${req.unitReference}`;

export const RelationshipReviewPage: React.FC = () => {
  const { name: reviewerName } = useCurrentAccess();
  const { data: requests, setData: setRequests, loading, error, reload } = useAsyncResource(
    () => relationshipApi.getRelationshipRequests(),
    []
  );

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('PENDING');
  const [search, setSearch] = useState('');
  const [viewing, setViewing] = useState<ApartmentRelationship | null>(null);
  const [action, setAction] = useState<ReviewAction | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const counts = useMemo(() => {
    const all = requests ?? [];
    return Object.fromEntries(
      FILTERS.map((f) => [f, f === 'ALL' ? all.length : all.filter((r) => r.status === f).length])
    ) as Record<StatusFilter, number>;
  }, [requests]);

  const visibleRequests = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (requests ?? []).filter(
      (r) =>
        (statusFilter === 'ALL' || r.status === statusFilter) &&
        (!term || r.requesterName.toLowerCase().includes(term) || r.unitReference.toLowerCase().includes(term))
    );
  }, [requests, statusFilter, search]);

  const openAction = (type: ReviewAction['type'], request: ApartmentRelationship) => {
    setViewing(null);
    setFeedback(null);
    setRejectReason('');
    setRejectError(undefined);
    setAction({ type, request });
  };

  const closeAction = () => {
    if (!isSaving) setAction(null);
  };

  const confirmAction = async () => {
    if (!action) return;
    if (action.type === 'reject' && rejectReason.trim().length < REJECTION_REASON_MIN_LENGTH) {
      setRejectError(`Enter a reason of at least ${REJECTION_REASON_MIN_LENGTH} characters so the requester knows what to fix.`);
      return;
    }

    setIsSaving(true);
    try {
      const updated =
        action.type === 'approve'
          ? await relationshipApi.approveRequest(action.request.relationshipId, reviewerName)
          : await relationshipApi.rejectRequest(action.request.relationshipId, reviewerName, rejectReason);
      setRequests((prev) => (prev ?? []).map((r) => (r.relationshipId === updated.relationshipId ? updated : r)));
      setFeedback({
        type: 'success',
        message: `${action.type === 'approve' ? 'Approved' : 'Rejected'} ${describeRequest(updated)}.`,
      });
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'The review could not be saved.' });
      reload();
    } finally {
      setIsSaving(false);
      setAction(null);
    }
  };

  return (
    <PageContainer
      title="Relationship Requests"
      subtitle="Verify residents' owner and tenant requests before they gain access to unit features."
    >
      {loading && !requests ? (
        <LoadingState message="Loading relationship requests..." />
      ) : error ? (
        <ErrorMessage title="Could not load relationship requests" message={error} onRetry={reload} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {feedback && (
            <Alert
              key={feedback.message}
              type={feedback.type}
              message={feedback.message}
              autoDismiss={feedback.type === 'success'}
              onDismiss={() => setFeedback(null)}
            />
          )}

          <Card padding="sm">
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
              }}
            >
              <div role="group" aria-label="Filter by status" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {FILTERS.map((filter) => {
                  const isActive = statusFilter === filter;
                  return (
                    <button
                      key={filter}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setStatusFilter(filter)}
                      style={{
                        padding: '0.5rem 0.875rem',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        border: 'none',
                        backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                        color: isActive ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      {FILTER_LABELS[filter]}
                      <span
                        style={{
                          padding: '0.0625rem 0.45rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.6875rem',
                          backgroundColor: isActive ? 'var(--color-accent)' : 'var(--color-surface-sunken)',
                          color: isActive ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
                        }}
                      >
                        {counts[filter]}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div style={{ flex: '0 1 280px', minWidth: '200px' }}>
                <Input
                  aria-label="Search by requester or unit"
                  placeholder="Search requester or unit"
                  leftIcon={<Search size={16} />}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </Card>

          {visibleRequests.length === 0 ? (
            <EmptyState
              icon={<ClipboardCheck size={26} />}
              title={search ? 'No matching requests' : `No ${statusFilter === 'ALL' ? '' : FILTER_LABELS[statusFilter].toLowerCase() + ' '}requests`}
              description={search ? 'Try a different requester name or unit.' : EMPTY_MESSAGES[statusFilter]}
            />
          ) : (
            <RelationshipReviewTable
              requests={visibleRequests}
              onView={setViewing}
              onApprove={(req) => openAction('approve', req)}
              onReject={(req) => openAction('reject', req)}
            />
          )}
        </div>
      )}

      <Modal
        isOpen={viewing !== null}
        onClose={() => setViewing(null)}
        title="Relationship Request"
        subtitle={viewing ? `${RELATIONSHIP_STATUS_CONFIG[viewing.status].label} · ${viewing.unitReference}` : undefined}
        footer={
          viewing?.status === 'PENDING' ? (
            <>
              <Button variant="danger" leftIcon={<X size={16} />} onClick={() => openAction('reject', viewing)}>
                Reject
              </Button>
              <Button variant="primary" leftIcon={<Check size={16} />} onClick={() => openAction('approve', viewing)}>
                Approve
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setViewing(null)}>
              Close
            </Button>
          )
        }
      >
        {viewing && <RelationshipRequestDetails request={viewing} />}
      </Modal>

      <ConfirmationModal
        isOpen={action?.type === 'approve'}
        title="Approve relationship?"
        description={
          action && (
            <>
              Approve <strong>{describeRequest(action.request)}</strong>? They will gain access to features for this
              unit.
            </>
          )
        }
        confirmLabel="Approve Request"
        isConfirming={isSaving}
        onConfirm={confirmAction}
        onCancel={closeAction}
      />

      <ConfirmationModal
        isOpen={action?.type === 'reject'}
        title="Reject relationship?"
        tone="danger"
        description={
          action && (
            <>
              Reject <strong>{describeRequest(action.request)}</strong>? The requester will see the reason below.
            </>
          )
        }
        confirmLabel="Reject Request"
        isConfirming={isSaving}
        onConfirm={confirmAction}
        onCancel={closeAction}
      >
        <TextAreaField
          label="Reason for rejection"
          required
          rows={4}
          maxLength={500}
          value={rejectReason}
          onChange={(e) => {
            setRejectReason(e.target.value);
            if (rejectError) setRejectError(undefined);
          }}
          error={rejectError}
          disabled={isSaving}
          placeholder="e.g. The ownership transfer is not yet recorded for this unit."
          helperText={`At least ${REJECTION_REASON_MIN_LENGTH} characters.`}
        />
      </ConfirmationModal>
    </PageContainer>
  );
};

export default RelationshipReviewPage;
