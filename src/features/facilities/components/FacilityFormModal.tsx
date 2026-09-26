import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/feedback/Alert';
import { Facility, FacilityRequest } from '../types/facility.types';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { createFacility, updateFacility, clearFeedback } from '../store/facilitySlice';

export interface FacilityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  facilityToEdit?: Facility | null;
}

export const FacilityFormModal: React.FC<FacilityFormModalProps> = ({
  isOpen,
  onClose,
  facilityToEdit,
}) => {
  const dispatch = useAppDispatch();
  const { actionLoading, error } = useAppSelector((state) => state.facilities);

  const isEditing = !!facilityToEdit;

  const [name, setName] = useState('');
  const [type, setType] = useState('RECREATION');
  const [capacity, setCapacity] = useState<number>(20);
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('22:00');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [bookingFee, setBookingFee] = useState<string>('0');
  const [maxHours, setMaxHours] = useState<string>('4');
  const [imageUrl, setImageUrl] = useState('');
  const [rules, setRules] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (facilityToEdit) {
      setName(facilityToEdit.name);
      setType(facilityToEdit.type || 'RECREATION');
      setCapacity(facilityToEdit.capacity);
      setLocation(facilityToEdit.location);
      setStartTime(facilityToEdit.operatingHoursStart?.slice(0, 5) || '06:00');
      setEndTime(facilityToEdit.operatingHoursEnd?.slice(0, 5) || '22:00');
      setStatus(facilityToEdit.status);
      setBookingFee(facilityToEdit.bookingFee != null ? String(facilityToEdit.bookingFee) : '0');
      setMaxHours(facilityToEdit.maxHoursPerBooking != null ? String(facilityToEdit.maxHoursPerBooking) : '4');
      setImageUrl(facilityToEdit.imageUrl || '');
      setRules(facilityToEdit.rulesAndGuidelines || '');
    } else {
      setName('');
      setType('RECREATION');
      setCapacity(20);
      setLocation('');
      setStartTime('06:00');
      setEndTime('22:00');
      setStatus('ACTIVE');
      setBookingFee('0');
      setMaxHours('4');
      setImageUrl('');
      setRules('');
    }
    setLocalError(null);
  }, [facilityToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    dispatch(clearFeedback());

    if (!name.trim()) {
      setLocalError('Please enter facility name.');
      return;
    }
    if (!location.trim()) {
      setLocalError('Please specify facility location.');
      return;
    }
    if (capacity <= 0) {
      setLocalError('Capacity must be a positive integer.');
      return;
    }

    const payload: FacilityRequest = {
      name: name.trim(),
      type: type.trim(),
      capacity: Number(capacity),
      location: location.trim(),
      operatingHoursStart: startTime.length === 5 ? `${startTime}:00` : startTime,
      operatingHoursEnd: endTime.length === 5 ? `${endTime}:00` : endTime,
      status,
      bookingFee: bookingFee ? parseFloat(bookingFee) : 0,
      maxHoursPerBooking: maxHours ? parseInt(maxHours, 10) : 4,
      imageUrl: imageUrl.trim() || undefined,
      rulesAndGuidelines: rules.trim() || undefined,
    };

    if (isEditing && facilityToEdit) {
      const res = await dispatch(updateFacility({ id: facilityToEdit.id, data: payload }));
      if (updateFacility.fulfilled.match(res)) {
        onClose();
      }
    } else {
      const res = await dispatch(createFacility(payload));
      if (createFacility.fulfilled.match(res)) {
        onClose();
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Facility: ${facilityToEdit.name}` : 'Add Community Facility'}
      subtitle={
        isEditing
          ? 'Modify facility operational hours, rules, capacity, or maintenance state'
          : 'Register a new shared amenity, recreation venue, or equipment zone'
      }
      maxWidth="600px"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={actionLoading}
          >
            {isEditing ? 'Save Changes' : 'Create Facility'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {localError && <Alert type="error" message={localError} onDismiss={() => setLocalError(null)} />}
        {error && <Alert type="error" message={error} />}

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
          <Input
            label="Facility Name"
            placeholder="e.g. Skyline Infinity Pool"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Select
            label="Facility Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={[
              { value: 'RECREATION', label: 'Recreation' },
              { value: 'FITNESS', label: 'Fitness & Gym' },
              { value: 'SPORTS', label: 'Sports Courts' },
              { value: 'COMMUNITY_HALL', label: 'Community Hall' },
              { value: 'BBQ_AREA', label: 'BBQ Area' },
              { value: 'MEETING_ROOM', label: 'Meeting Room' },
            ]}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Location / Floor"
            placeholder="e.g. Tower B - 5th Floor"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <Input
            label="Max Capacity (Persons)"
            type="number"
            min={1}
            required
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <Input
            label="Opening Time"
            type="time"
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <Input
            label="Closing Time"
            type="time"
            required
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
            options={[
              { value: 'ACTIVE', label: 'Active (Available)' },
              { value: 'INACTIVE', label: 'Under Maintenance' },
            ]}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Booking Fee ($ / LKR)"
            type="number"
            min={0}
            step="any"
            value={bookingFee}
            onChange={(e) => setBookingFee(e.target.value)}
          />
          <Input
            label="Max Hours Per Booking"
            type="number"
            min={1}
            max={24}
            value={maxHours}
            onChange={(e) => setMaxHours(e.target.value)}
          />
        </div>

        <Input
          label="Image URL (Optional)"
          placeholder="https://..."
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)' }}>
            Rules & Guidelines (Optional)
          </label>
          <textarea
            rows={3}
            style={{
              padding: '0.625rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              fontFamily: 'inherit',
              fontSize: '0.875rem',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              resize: 'vertical',
            }}
            placeholder="e.g. Appropriate swimwear required. Children must be supervised."
            value={rules}
            onChange={(e) => setRules(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};
