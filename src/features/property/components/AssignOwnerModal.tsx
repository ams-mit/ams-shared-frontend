import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/feedback/Alert';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchInventory } from '@/features/units/store/unitSlice';
import { unitOptions } from '@/features/units/utils/unitLabel';
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
  ownershipPercentage: '100',
  startDate: '',
  endDate: '',
});

const SERVER_FIELD: Record<string, keyof OwnershipFormValues> = {
  OWNER_NOT_FOUND: 'ownerId',
  UNIT_NOT_FOUND: 'unitId',
};

export const AssignOwnerModal: React.FC<AssignOwnerModalProps> = ({ isOpen, onClose, initialUnitId, onAssigned }) => {
  const dispatch = useAppDispatch();
  const { units, buildings, loading: inventoryLoading } = useAppSelector((state) => state.units);
  const [form, setForm] = useState<OwnershipFormValues>(() => emptyForm(initialUnitId));
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<keyof OwnershipFormValues>>({});
  const [submitError, setSubmitError] = useState<ApiErrorInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && units.length === 0) dispatch(fetchInventory());
  }, [dispatch, isOpen, units.length]);

  const setField = (field: keyof OwnershipFormValues, value: string) => {
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
      let existing: Ownership[] = [];
      try {
        existing = await propertyApi.getOwnerships({ by: 'unit', unitId: form.unitId });
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
          unitId: form.unitId,
          ownerId: form.ownerId.trim(),
          ownershipPercentage: Number(form.ownershipPercentage),
          startDate: form.startDate,
          endDate: form.endDate || null,
        })
      ).unwrap();
      onAssigned(ownership);
      close();
    } catch (err) {
      const apiError = (err as ApiErrorInfo).message ? (err as ApiErrorInfo) : toApiError(err, 'Failed to assign owner.');
      const field = apiError.code ? SERVER_FIELD[apiError.code] : undefined;
      if (field) setFieldErrors((prev) => ({ ...prev, [field]: apiError.message }));
      setSubmitError(apiError);
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
          <Select
            label="Unit"
            placeholder={inventoryLoading && units.length === 0 ? 'Loading units…' : 'Select a unit'}
            searchable
            value={form.unitId}
            error={fieldErrors.unitId}
            options={unitOptions(units, buildings)}
            onChange={(event) => setField('unitId', event.target.value)}
          />
          <Input
            type="number"
            label="Share (%)"
            required
            min={0.01}
            max={100}
            step="0.01"
            value={form.ownershipPercentage}
            error={fieldErrors.ownershipPercentage}
            onChange={(event) => setField('ownershipPercentage', event.target.value)}
          />
        </div>
        <Input
          label="Owner Profile ID"
          required
          placeholder="Resident profile UUID"
          value={form.ownerId}
          error={fieldErrors.ownerId}
          onChange={(event) => setField('ownerId', event.target.value)}
          helperText="Validated against Resident Management when you save."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <Input
            type="date"
            label="Start Date"
            required
            value={form.startDate}
            error={fieldErrors.startDate}
            onChange={(event) => setField('startDate', event.target.value)}
          />
          <Input
            type="date"
            label="End Date (optional)"
            min={form.startDate || undefined}
            value={form.endDate}
            error={fieldErrors.endDate}
            onChange={(event) => setField('endDate', event.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};
