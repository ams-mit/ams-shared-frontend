import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/feedback/Alert';
import { useAppDispatch } from '@/app/store/hooks';
import { createUnitType } from '../store/propertySlice';
import { fetchInventory } from '@/features/units/store/unitSlice';
import type { ApiErrorInfo } from '@/services/api/apiError';
import { validateUnitType, type FieldErrors, type UnitTypeFormValues } from '../validation/propertyValidation';

export interface UnitTypeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMPTY_FORM: UnitTypeFormValues = { typeName: '', baseRent: '', capacityLimit: '1', amenitiesSummary: '' };
const FORM_ID = 'unit-type-form';

export const UnitTypeFormModal: React.FC<UnitTypeFormModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
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
    const errors = validateUnitType(form);
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    setIsSubmitting(true);
    try {
      await dispatch(
        createUnitType({
          typeName: form.typeName.trim(),
          baseRent: Number(form.baseRent),
          capacityLimit: Number(form.capacityLimit),
          amenitiesSummary: form.amenitiesSummary.trim() || null,
        })
      ).unwrap();
      dispatch(fetchInventory());
      close();
    } catch (err) {
      setSubmitError(err as ApiErrorInfo);
    } finally {
      setIsSubmitting(false);
    }
  };

  const capacity = Number(form.capacityLimit);

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="New Unit Type"
      subtitle="Define a layout's baseline rent and occupancy capacity."
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
        <Input
          label="Type Name"
          required
          placeholder="e.g. 1-Bedroom Standard, Co-Living Flat"
          value={form.typeName}
          error={fieldErrors.typeName}
          onChange={updateField('typeName')}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <Input
            type="number"
            label="Base Monthly Rent"
            required
            min={0}
            step="0.01"
            placeholder="e.g. 85000"
            value={form.baseRent}
            error={fieldErrors.baseRent}
            onChange={updateField('baseRent')}
          />
          <Input
            type="number"
            label="Capacity Limit"
            required
            min={1}
            step={1}
            value={form.capacityLimit}
            error={fieldErrors.capacityLimit}
            onChange={updateField('capacityLimit')}
            helperText={
              Number.isInteger(capacity) && capacity > 1
                ? 'Multi-occupancy: up to this many concurrent leases.'
                : 'Standard unit: overlapping leases are blocked.'
            }
          />
        </div>
        <Input
          label="Amenities (optional)"
          placeholder="e.g. Balcony, en-suite, shared kitchen"
          value={form.amenitiesSummary}
          onChange={updateField('amenitiesSummary')}
        />
      </form>
    </Modal>
  );
};
