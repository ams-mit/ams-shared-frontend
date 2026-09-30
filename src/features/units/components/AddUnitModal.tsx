import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/feedback/Alert';
import { useAppDispatch } from '@/app/store/hooks';
import { toApiError } from '@/services/api/apiError';
import { createUnit } from '../store/unitSlice';
import type { Building, Unit, UnitType } from '../types/unit.types';
export interface AddUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  unitTypes: UnitType[];
  buildings: Building[];
  existingUnits: Unit[];
}
export const AddUnitModal = ({
  isOpen,
  onClose,
  unitTypes,
  buildings,
  existingUnits,
}: AddUnitModalProps) => {
  const dispatch = useAppDispatch();
  const [floorId, setFloorId] = useState('');
  const [typeId, setTypeId] = useState('');
  const [number, setNumber] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const floorOptions = buildings.flatMap((building) =>
    building.floors.filter((floor) => floor.id != null).map((floor) => ({
      value: String(floor.id),
      label: `${building.name} (${building.buildingCode}) · Floor ${floor.floorNumber}${floor.floorName ? ` · ${floor.floorName}` : ''}`,
    }))
  );
  const close = () => {
    setFloorId('');
    setTypeId('');
    setNumber('');
    setError('');
    onClose();
  };
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (
      !Number.isSafeInteger(Number(floorId)) ||
      Number(floorId) < 1 ||
      !typeId ||
      !number.trim()
    ) {
      setError('Enter an existing floor ID, a unit type and a unit number.');
      return;
    }
    if (
      existingUnits.some(
        (u) =>
          u.floorId === Number(floorId) &&
          u.unitNumber.toLowerCase() === number.trim().toLowerCase()
      )
    ) {
      setError('This unit number already exists on the floor.');
      return;
    }
    setSaving(true);
    try {
      await dispatch(
        createUnit({
          floorId: Number(floorId),
          unitTypeId: Number(typeId),
          unitNumber: number.trim(),
        })
      ).unwrap();
      close();
    } catch (err) {
      setError(toApiError(err, 'Could not add unit.').message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Add Unit"
      footer={
        <>
          <Button variant="outline" onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="add-unit-form" isLoading={saving}>
            Add Unit
          </Button>
        </>
      }
    >
      <form
        id="add-unit-form"
        onSubmit={submit}
        style={{ display: 'grid', gap: '1rem' }}
      >
        {error && <Alert type="error" message={error} autoDismiss={false} />}
        <Select
          label="Floor"
          placeholder="Select a floor"
          options={floorOptions}
          required
          value={floorId}
          onChange={(e) => setFloorId(e.target.value)}
        />
        <Select
          label="Unit Type"
          placeholder="Select a unit type"
          required
          value={typeId}
          options={unitTypes.map((t) => ({
            value: String(t.id),
            label: t.typeName,
          }))}
          onChange={(e) => setTypeId(e.target.value)}
        />
        <Input
          label="Unit Number"
          required
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          helperText="New units start as Available."
        />
      </form>
    </Modal>
  );
};
