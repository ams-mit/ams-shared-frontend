import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/feedback/Alert';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { createUnitType } from '../store/propertySlice';
import { fetchInventory } from '@/features/units/store/unitSlice';
import type { ApiErrorInfo } from '@/services/api/apiError';
import { validateUnitType, type FieldErrors, type UnitTypeFormValues } from '../validation/propertyValidation';

export interface UnitTypeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMPTY_FORM: UnitTypeFormValues = { code: '', name: '', capacity: '1', description: '' };
const FORM_ID = 'unit-type-form';

export const UnitTypeFormModal: React.FC<UnitTypeFormModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const existingTypes = useAppSelector((state) => state.units.unitTypes);
  const [form, setForm] = useState<UnitTypeFormValues>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<keyof UnitTypeFormValues>>({});
  const [submitError, setSubmitError] = useState<ApiErrorInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof UnitTypeFormValues) => (event: React.ChangeEvent<HTMLInputElement>) => {
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
    const errors = validateUnitType(form, existingTypes);
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    setIsSubmitting(true);
    try {
      await dispatch(
        createUnitType({
          code: form.code.trim(),
          name: form.name.trim(),
          capacity: Number(form.capacity),
          description: form.description.trim() || undefined,
        })
      ).unwrap();
      dispatch(fetchInventory());
      close();
    } catch (err) {
      const apiError = err as ApiErrorInfo;
      if (apiError.code === 'UNIT_TYPE_ALREADY_EXISTS') setFieldErrors({ code: apiError.message });
      setSubmitError(apiError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const capacity = Number(form.capacity);

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="New Unit Type"
      subtitle="Define a layout and its occupancy capacity."
      maxWidth="520px"
      footer={
        <>
          <Button type="button" variant="outline" onClick={close} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} isLoading={isSubmitting}>
            Save Unit Type
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {submitError && (
          <Alert type="error" title="Could not save unit type" message={submitError.message} autoDismiss={false} />
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)', gap: '1rem' }}>
          <Input
            label="Type Code"
            required
            maxLength={50}
            placeholder="e.g. STD-1B"
            value={form.code}
            error={fieldErrors.code}
            onChange={updateField('code')}
          />
          <Input
            label="Type Name"
            required
            placeholder="e.g. 1-Bedroom Standard, Co-Living Flat"
            value={form.name}
            error={fieldErrors.name}
            onChange={updateField('name')}
          />
        </div>
        <Input
          type="number"
          label="Capacity"
          required
          min={1}
          step={1}
          value={form.capacity}
          error={fieldErrors.capacity}
          onChange={updateField('capacity')}
          helperText={
            Number.isInteger(capacity) && capacity > 1
              ? 'Multi-occupancy: up to this many concurrent occupants.'
              : 'Standard unit: overlapping leases are blocked.'
          }
        />
        <Input
          label="Description (optional)"
          placeholder="e.g. Balcony, en-suite, shared kitchen"
          maxLength={500}
          value={form.description}
          error={fieldErrors.description}
          onChange={updateField('description')}
        />
      </form>
    </Modal>
  );
};
