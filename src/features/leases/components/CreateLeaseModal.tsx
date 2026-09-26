import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/feedback/Alert';
import { useAppDispatch } from '@/app/store/hooks';
import type { ApiErrorInfo } from '@/services/api/apiError';
import { createLease } from '../store/leaseSlice';
import { leaseErrorTitle } from '../utils/leaseErrors';
import {
  formatLeaseDuration,
  hasErrors,
  validateLeaseForm,
  type LeaseFieldErrors,
  type LeaseFormValues,
} from '../validation/leaseValidation';

export interface CreateLeaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const EMPTY_FORM: LeaseFormValues = { unitId: '', tenantId: '', startDate: '', endDate: '', customNotes: '' };
const FORM_ID = 'create-lease-form';

export const CreateLeaseModal: React.FC<CreateLeaseModalProps> = ({ isOpen, onClose, onCreated }) => {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState<LeaseFormValues>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<LeaseFieldErrors>({});
  const [submitError, setSubmitError] = useState<ApiErrorInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof LeaseFormValues) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const close = () => {
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setSubmitError(null);
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);

    const errors = validateLeaseForm(form);
    setFieldErrors(errors);
    if (hasErrors(errors)) return;

    setIsSubmitting(true);
    try {
      await dispatch(
        createLease({
          unitId: form.unitId.trim(),
          tenantId: form.tenantId.trim(),
          startDate: form.startDate,
          endDate: form.endDate,
          customNotes: form.customNotes.trim() || undefined,
        })
      ).unwrap();
      onCreated();
      close();
    } catch (err) {
      const apiError = err as ApiErrorInfo;
      if (apiError.fieldErrors) setFieldErrors(apiError.fieldErrors as LeaseFieldErrors);
      setSubmitError(apiError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const duration = formatLeaseDuration(form.startDate, form.endDate);

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Draft New Lease"
      subtitle="New leases start as DRAFT and are activated separately."
      maxWidth="560px"
      footer={
        <>
          <Button type="button" variant="outline" onClick={close} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} isLoading={isSubmitting}>
            Create Lease
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {submitError && (
          <Alert
            type="error"
            title={leaseErrorTitle(submitError)}
            message={submitError.message}
            autoDismiss={false}
            onDismiss={() => setSubmitError(null)}
          />
        )}

        <Input
          label="Unit ID"
          required
          placeholder="e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6"
          value={form.unitId}
          error={fieldErrors.unitId}
          onChange={updateField('unitId')}
          helperText="UUID of the unit in property-unit-service."
        />

        <Input
          label="Primary Tenant ID"
          required
          placeholder="Tenant UUID"
          value={form.tenantId}
          error={fieldErrors.tenantId}
          onChange={updateField('tenantId')}
          helperText="Validated against identity-access-service when you submit."
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <Input
            type="date"
            label="Start Date"
            required
            value={form.startDate}
            error={fieldErrors.startDate}
            onChange={updateField('startDate')}
          />
          <Input
            type="date"
            label="End Date"
            required
            min={form.startDate || undefined}
            value={form.endDate}
            error={fieldErrors.endDate}
            onChange={updateField('endDate')}
          />
        </div>

        {duration && (
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Lease term: {duration}</p>
        )}

        <Input
          label="Notes (optional)"
          placeholder="Special terms, parking, pet clauses…"
          value={form.customNotes}
          onChange={updateField('customNotes')}
        />
      </form>
    </Modal>
  );
};
