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
  floorNumber: string;
  unitTypeId: string;
  unitNumber: string;
}

const EMPTY_FORM: FormState = { buildingId: '', floorNumber: '', unitTypeId: '', unitNumber: '' };
const FORM_ID = 'add-unit-form';

export const AddUnitModal: React.FC<AddUnitModalProps> = ({ isOpen, onClose, buildings, unitTypes, existingUnits }) => {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitError, setSubmitError] = useState<ApiErrorInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const building = buildings.find((b) => String(b.id) === form.buildingId);

  const set = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value, ...(field === 'buildingId' ? { floorNumber: '' } : {}) }));
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
    if (!form.floorNumber) errors.floorNumber = 'Select a floor.';
    if (!form.unitTypeId) errors.unitTypeId = 'Select a unit type.';
    if (!unitNumber) errors.unitNumber = 'Unit number is required.';
    else if (
      existingUnits.some(
        (u) =>
          String(u.buildingId) === form.buildingId &&
          String(u.floorNumber) === form.floorNumber &&
          u.unitNumber.toLowerCase() === unitNumber.toLowerCase()
      )
    ) {
      errors.unitNumber = `Unit ${unitNumber} already exists on this floor.`;
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
          buildingId: Number(form.buildingId),
          floorNumber: Number(form.floorNumber),
          unitTypeId: Number(form.unitTypeId),
          status: 'AVAILABLE',
        })
      ).unwrap();
      close();
    } catch (err) {
      const apiError = err as ApiErrorInfo;
      setSubmitError(
        apiError.status === 409 ? { ...apiError, message: 'A unit with this number already exists on this floor.' } : apiError
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
          options={buildings.map((b) => ({ value: String(b.id), label: `${b.name} (${b.buildingCode})` }))}
          onChange={(event) => set('buildingId', event.target.value)}
        />
        <Select
          label="Floor"
          placeholder={building ? 'Select a floor' : 'Select a building first'}
          value={form.floorNumber}
          error={fieldErrors.floorNumber}
          disabled={!building}
          options={(building?.floors ?? []).map((f) => ({ value: String(f.floorNumber), label: f.floorName || `Floor ${f.floorNumber}` }))}
          onChange={(event) => set('floorNumber', event.target.value)}
        />
        <Select
          label="Unit Type"
          placeholder="Select a unit type"
          value={form.unitTypeId}
          error={fieldErrors.unitTypeId}
          options={unitTypes.map((t) => ({ value: String(t.id), label: t.typeName, subLabel: `Capacity ${t.capacityLimit}` }))}
          onChange={(event) => set('unitTypeId', event.target.value)}
        />
        <Input
          label="Unit Number"
          required
          placeholder="e.g. 305"
          value={form.unitNumber}
          error={fieldErrors.unitNumber}
          onChange={(event) => set('unitNumber', event.target.value)}
          helperText="New units start as Available; use the status controls to change it afterwards."
        />
      </form>
    </Modal>
  );
};
