import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/feedback/Alert';
import { useAppDispatch } from '@/app/store/hooks';
import type { ApiErrorInfo } from '@/services/api/apiError';
import { createUnit } from '../store/unitSlice';
import type { Building, Unit, UnitType } from '../types/unit.types';

export interface AddUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildings: Building[];
  unitTypes: UnitType[];
  existingUnits: Unit[];
}

interface FormState {
  buildingId: string;
  floorId: string;
  unitTypeId: string;
  unitNumber: string;
}

const EMPTY_FORM: FormState = { buildingId: '', floorId: '', unitTypeId: '', unitNumber: '' };
const FORM_ID = 'add-unit-form';

export const AddUnitModal: React.FC<AddUnitModalProps> = ({ isOpen, onClose, buildings, unitTypes, existingUnits }) => {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitError, setSubmitError] = useState<ApiErrorInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // PROP-005 rejects inactive buildings, floors and unit types.
  const activeBuildings = buildings.filter((b) => b.status === 'ACTIVE');
  const building = buildings.find((b) => b.id === form.buildingId);

  const set = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value, ...(field === 'buildingId' ? { floorId: '' } : {}) }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const close = () => {
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setSubmitError(null);
    onClose();
  };

  const validate = () => {
    const errors: Partial<Record<keyof FormState, string>> = {};
    const unitNumber = form.unitNumber.trim();
    if (!form.buildingId) errors.buildingId = 'Select a building.';
    if (!form.floorId) errors.floorId = 'Select a floor.';
    if (!form.unitTypeId) errors.unitTypeId = 'Select a unit type.';
    if (!unitNumber) errors.unitNumber = 'Unit number is required.';
    else if (unitNumber.length > 50) errors.unitNumber = 'Unit number must be 50 characters or fewer.';
    // Unit numbers are unique within a building (PROP-005).
    else if (
      existingUnits.some(
        (u) => u.buildingId === form.buildingId && u.unitNumber.toLowerCase() === unitNumber.toLowerCase()
      )
    ) {
      errors.unitNumber = `Unit ${unitNumber} already exists in this building.`;
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await dispatch(
        createUnit({
          unitNumber: form.unitNumber.trim(),
          buildingId: form.buildingId,
          floorId: form.floorId,
          unitTypeId: form.unitTypeId,
        })
      ).unwrap();
      close();
    } catch (err) {
      const apiError = err as ApiErrorInfo;
      setSubmitError(
        apiError.code === 'UNIT_ALREADY_EXISTS' ? { ...apiError, message: 'A unit with this number already exists in this building.' } : apiError
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Add Unit"
      maxWidth="540px"
      footer={
        <>
          <Button type="button" variant="outline" onClick={close} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} isLoading={isSubmitting}>
            Add Unit
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {submitError && (
          <Alert type="error" title="Could not add unit" message={submitError.message} autoDismiss={false} />
        )}
        <Select
          label="Building"
          placeholder="Select a building"
          value={form.buildingId}
          error={fieldErrors.buildingId}
          options={activeBuildings.map((b) => ({ value: b.id, label: `${b.name} (${b.buildingCode})` }))}
          onChange={(event) => set('buildingId', event.target.value)}
        />
        <Select
          label="Floor"
          placeholder={building ? 'Select a floor' : 'Select a building first'}
          value={form.floorId}
          error={fieldErrors.floorId}
          disabled={!building}
          options={[...(building?.floors ?? [])]
            .filter((f) => f.status === 'ACTIVE')
            .sort((a, b) => a.floorNumber - b.floorNumber)
            .map((f) => ({ value: f.id, label: f.name || `Floor ${f.floorNumber}` }))}
          onChange={(event) => set('floorId', event.target.value)}
        />
        <Select
          label="Unit Type"
          placeholder="Select a unit type"
          value={form.unitTypeId}
          error={fieldErrors.unitTypeId}
          options={unitTypes
            .filter((t) => t.status === 'ACTIVE')
            .map((t) => ({ value: t.id, label: t.name, subLabel: `${t.code} · capacity ${t.capacity}` }))}
          onChange={(event) => set('unitTypeId', event.target.value)}
        />
        <Input
          label="Unit Number"
          required
          placeholder="e.g. 305"
          value={form.unitNumber}
          error={fieldErrors.unitNumber}
          onChange={(event) => set('unitNumber', event.target.value)}
          helperText="New units start as Available."
        />
      </form>
    </Modal>
  );
};
