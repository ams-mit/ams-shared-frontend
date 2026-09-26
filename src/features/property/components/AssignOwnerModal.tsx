import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/feedback/Alert';
import { useAppDispatch } from '@/app/store/hooks';
import { propertyApi } from '../api/propertyApi';
import { createOwnership } from '../store/propertySlice';
import { toApiError, type ApiErrorInfo } from '@/services/api/apiError';
import type { Ownership } from '../types/property.types';
import { validateOwnership, type FieldErrors, type OwnershipFormValues } from '../validation/propertyValidation';

export interface AssignOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUnitId?: string;
  onAssigned: (ownership: Ownership) => void;
}

const FORM_ID = 'assign-owner-form';
const emptyForm = (unitId = ''): OwnershipFormValues => ({
  unitId,
  ownerId: '',
  sharePercentage: '100',
  startDate: '',
  endDate: '',
});

export const AssignOwnerModal: React.FC<AssignOwnerModalProps> = ({ isOpen, onClose, initialUnitId, onAssigned }) => {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState<OwnershipFormValues>(() => emptyForm(initialUnitId));
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<keyof OwnershipFormValues>>({});
  const [submitError, setSubmitError] = useState<ApiErrorInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof OwnershipFormValues) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const close = () => {
    setForm(emptyForm(initialUnitId));
    setFieldErrors({});
    setSubmitError(null);
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);

    const basicErrors = validateOwnership(form, []);
    setFieldErrors(basicErrors);
    if (Object.values(basicErrors).some(Boolean)) return;

    setIsSubmitting(true);
    try {
      const unitId = Number(form.unitId);
      let existing: Ownership[] = [];
      try {
        existing = await propertyApi.getOwnerships({ by: 'unit', unitId });
      } catch (err) {
        // Leave the share-limit check to the server if history can't be read, but not on auth errors.
        const apiError = toApiError(err, 'Could not read the current ownership of this unit.');
        if (apiError.status === 401 || apiError.status === 403) throw apiError;
      }

      const shareErrors = validateOwnership(form, existing);
      setFieldErrors(shareErrors);
      if (Object.values(shareErrors).some(Boolean)) return;

      const ownership = await dispatch(
        createOwnership({
          unitId,
          ownerId: form.ownerId.trim(),
          sharePercentage: Number(form.sharePercentage),
          startDate: form.startDate,
          endDate: form.endDate || null,
        })
      ).unwrap();
      onAssigned(ownership);
      close();
    } catch (err) {
      const apiError = (err as ApiErrorInfo).message ? (err as ApiErrorInfo) : toApiError(err, 'Failed to assign owner.');
      setSubmitError(
        apiError.status === 500
          ? {
              ...apiError,
              message:
                'The server rejected this ownership. The owner profile may not exist in Group 1, or the unit’s shares would exceed 100%.',
            }
          : apiError
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Assign Owner"
      subtitle="Link a unit to a validated owner profile with a share of ownership."
      maxWidth="540px"
      footer={
        <>
          <Button type="button" variant="outline" onClick={close} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} isLoading={isSubmitting}>
            Assign Owner
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {submitError && (
          <Alert type="error" title="Could not assign owner" message={submitError.message} autoDismiss={false} />
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <Input
            type="number"
            label="Unit ID"
            required
            min={1}
            step={1}
            value={form.unitId}
            error={fieldErrors.unitId}
            onChange={updateField('unitId')}
          />
          <Input
            type="number"
            label="Share (%)"
            required
            min={0.01}
            max={100}
            step="0.01"
            value={form.sharePercentage}
            error={fieldErrors.sharePercentage}
            onChange={updateField('sharePercentage')}
          />
        </div>
        <Input
          label="Owner Profile ID"
          required
          placeholder="Owner ID from Group 1"
          value={form.ownerId}
          error={fieldErrors.ownerId}
          onChange={updateField('ownerId')}
          helperText="Validated against the Group 1 identity service when you save."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
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
            label="End Date (optional)"
            min={form.startDate || undefined}
            value={form.endDate}
            error={fieldErrors.endDate}
            onChange={updateField('endDate')}
          />
        </div>
      </form>
    </Modal>
  );
};
