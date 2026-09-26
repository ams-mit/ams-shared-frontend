import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/feedback/Alert';
import { useAppDispatch } from '@/app/store/hooks';
import { createBuilding } from '../store/propertySlice';
import { fetchInventory } from '@/features/units/store/unitSlice';
import type { ApiErrorInfo } from '@/services/api/apiError';
import type { Building } from '../types/property.types';
import {
  MAX_FLOOR_COUNT,
  generateFloors,
  validateBuilding,
  type BuildingFormValues,
  type FieldErrors,
} from '../validation/propertyValidation';

export interface AddBuildingModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingBuildings: Building[];
  onCreated: (building: Building) => void;
}

const EMPTY_FORM: BuildingFormValues = { buildingCode: '', name: '', address: '', floorCount: '' };
const FORM_ID = 'add-building-form';

export const AddBuildingModal: React.FC<AddBuildingModalProps> = ({ isOpen, onClose, existingBuildings, onCreated }) => {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState<BuildingFormValues>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<keyof BuildingFormValues>>({});
  const [submitError, setSubmitError] = useState<ApiErrorInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof BuildingFormValues) => (event: React.ChangeEvent<HTMLInputElement>) => {
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
    const errors = validateBuilding(form, existingBuildings);
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    setIsSubmitting(true);
    try {
      const building = await dispatch(
        createBuilding({
          buildingCode: form.buildingCode.trim(),
          name: form.name.trim(),
          address: form.address.trim(),
          floors: generateFloors(Number(form.floorCount)),
        })
      ).unwrap();
      dispatch(fetchInventory());
      onCreated(building);
      close();
    } catch (err) {
      setSubmitError(err as ApiErrorInfo);
    } finally {
      setIsSubmitting(false);
    }
  };

  const floorCount = Number(form.floorCount);
  const showFloorPreview = Number.isInteger(floorCount) && floorCount >= 1 && floorCount <= MAX_FLOOR_COUNT;

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Add Building"
      subtitle="Floors are generated automatically from the floor count."
      maxWidth="540px"
      footer={
        <>
          <Button type="button" variant="outline" onClick={close} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} isLoading={isSubmitting}>
            Create Building
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {submitError && (
          <Alert type="error" title="Could not create building" message={submitError.message} autoDismiss={false} />
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)', gap: '1rem' }}>
          <Input
            label="Building Code"
            required
            placeholder="e.g. TWR-A"
            maxLength={50}
            value={form.buildingCode}
            error={fieldErrors.buildingCode}
            onChange={updateField('buildingCode')}
          />
          <Input
            label="Building Name"
            required
            placeholder="e.g. Tower A"
            value={form.name}
            error={fieldErrors.name}
            onChange={updateField('name')}
          />
        </div>
        <Input
          label="Address"
          required
          placeholder="Street, city"
          value={form.address}
          error={fieldErrors.address}
          onChange={updateField('address')}
        />
        <Input
          type="number"
          label="Number of Floors"
          required
          min={1}
          max={MAX_FLOOR_COUNT}
          step={1}
          placeholder="e.g. 12"
          value={form.floorCount}
          error={fieldErrors.floorCount}
          onChange={updateField('floorCount')}
          helperText={showFloorPreview ? `Floors 1 – ${floorCount} will be created.` : undefined}
        />
      </form>
    </Modal>
  );
};
