import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/feedback/Alert';
import { useAppDispatch } from '@/app/store/hooks';
import type { ApiErrorInfo } from '@/services/api/apiError';
import { updateLeaseStatus } from '../store/leaseSlice';
import { leaseErrorTitle } from '../utils/leaseErrors';
import { LEASE_STATUS_LABEL } from './LeaseStatusBadge';
import { LEASE_TRANSITIONS, type Lease, type LeaseStatus } from '../types/lease.types';

export interface ChangeLeaseStatusModalProps {
  lease: Lease | null;
  onClose: () => void;
}

const FORM_ID = 'change-lease-status-form';

export const ChangeLeaseStatusModal: React.FC<ChangeLeaseStatusModalProps> = ({ lease, onClose }) => {
  const dispatch = useAppDispatch();
  const [target, setTarget] = useState<LeaseStatus | ''>('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<ApiErrorInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const close = () => {
    setTarget('');
    setReason('');
    setError(null);
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!lease || !target) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await dispatch(
        updateLeaseStatus({ leaseId: lease.id, status: target, reason: reason.trim() || undefined })
      ).unwrap();
      close();
    } catch (err) {
      setError(err as ApiErrorInfo);
    } finally {
      setIsSubmitting(false);
    }
  };

  const options = lease
    ? LEASE_TRANSITIONS[lease.status].map((status) => ({ value: status, label: LEASE_STATUS_LABEL[status] }))
    : [];

  return (
    <Modal
      isOpen={lease !== null}
      onClose={close}
      title="Change Lease Status"
      subtitle={lease ? `Currently ${LEASE_STATUS_LABEL[lease.status]}` : undefined}
      maxWidth="480px"
      footer={
        <>
          <Button type="button" variant="outline" onClick={close} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            variant={target === 'TERMINATED' ? 'danger' : 'primary'}
            isLoading={isSubmitting}
            disabled={!target}
          >
            Update Status
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {error && (
          <Alert type="error" title={leaseErrorTitle(error)} message={error.message} autoDismiss={false} />
        )}
        {target === 'ACTIVE' && (
          <Alert
            type="info"
            message="Activation re-checks date overlap, unit capacity and maintenance lock, then marks the unit OCCUPIED."
            autoDismiss={false}
            showDismissButton={false}
          />
        )}
        <Select
          label="New status"
          placeholder="Select a status"
          value={target}
          options={options}
          onChange={(event) => setTarget(event.target.value as LeaseStatus)}
        />
        <Input
          label="Reason (optional)"
          placeholder="e.g. Early move-out agreed with tenant"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      </form>
    </Modal>
  );
};
