import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/feedback/Alert';
import { VisitorRequest } from '../types/visitor.types';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { registerVisitor, clearVisitorFeedback } from '../store/visitorSlice';
import { Phone, Car } from 'lucide-react';

export interface VisitorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VisitorFormModal: React.FC<VisitorFormModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.auth);
  const { actionLoading, error, successMessage } = useAppSelector((state) => state.visitors);

  const [visitorName, setVisitorName] = useState('');
  const [unitId, setUnitId] = useState(currentUser.unitId || 'Tower A - 402');
  const [purpose, setPurpose] = useState('Personal / Family Visit');
  const [visitDate, setVisitDate] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setUnitId(currentUser.unitId || 'Tower A - 402');
    const today = new Date().toISOString().split('T')[0];
    setVisitDate(today);
    setVisitorName('');
    setVisitorPhone('');
    setVehicleNumber('');
  }, [currentUser, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    dispatch(clearVisitorFeedback());

    if (!visitorName.trim()) {
      setLocalError('Please enter the visitor’s full legal name.');
      return;
    }
    if (!unitId.trim()) {
      setLocalError('Please enter the target apartment unit.');
      return;
    }
    if (!visitDate) {
      setLocalError('Please select the scheduled date of arrival.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (visitDate < todayStr) {
      setLocalError('Arrival date cannot be in the past. Please select today or an upcoming date.');
      return;
    }

    const request: VisitorRequest = {
      visitorName: visitorName.trim(),
      residentId: currentUser.id,
      unitId: unitId.trim(),
      purpose,
      visitDate,
      visitorPhone: visitorPhone.trim() || undefined,
      vehicleNumber: vehicleNumber.trim() || undefined,
    };

    const res = await dispatch(registerVisitor(request));
    if (registerVisitor.fulfilled.match(res)) {
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pre-Register Expected Visitor"
      subtitle="Grant security clearance and issue a digital gate entry permit"
      maxWidth="540px"
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
            Issue Gate Clearance
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {localError && <Alert type="error" message={localError} onDismiss={() => setLocalError(null)} />}
        {error && <Alert type="error" message={error} />}
        {successMessage && <Alert type="success" message={successMessage} />}

        <Input
          label="Visitor Full Name"
          placeholder="e.g. Johnathan Doe"
          required
          value={visitorName}
          onChange={(e) => setVisitorName(e.target.value)}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Phone Number (Optional)"
            placeholder="e.g. +94 77 123 4567"
            value={visitorPhone}
            onChange={(e) => setVisitorPhone(e.target.value)}
            leftIcon={<Phone size={14} />}
          />
          <Input
            label="Vehicle Number (Optional)"
            placeholder="e.g. WP CAB-4521"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
            leftIcon={<Car size={14} />}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Apartment Unit"
            placeholder="e.g. Tower A - 402"
            required
            value={unitId}
            onChange={(e) => setUnitId(e.target.value)}
          />
          <Input
            label="Arrival Date"
            type="date"
            required
            min={new Date().toISOString().split('T')[0]}
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
          />
        </div>

        <Select
          label="Purpose of Visit"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          options={[
            { value: 'Personal / Family Visit', label: 'Personal / Family Visit' },
            { value: 'Food & Grocery Delivery', label: 'Food & Grocery Delivery' },
            { value: 'Courier / Parcel Drop-off', label: 'Courier / Parcel Drop-off' },
            { value: 'Maintenance / Service Contractor', label: 'Maintenance / Service Contractor' },
            { value: 'Business / Official Meeting', label: 'Business / Official Meeting' },
            { value: 'Guest Stay', label: 'Guest Stay' },
          ]}
        />

        <div
          style={{
            padding: '0.875rem',
            backgroundColor: 'var(--color-surface-hover)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-subtle)',
            fontSize: '0.8125rem',
            color: 'var(--color-text-secondary)',
          }}
        >
          <div>
            <strong>Host Resident:</strong> {currentUser.name} ({currentUser.id})
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            Upon registration, security staff at the front barrier will see this record as <em>EXPECTED</em> and can verify the visitor upon arrival.
          </div>
        </div>
      </form>
    </Modal>
  );
};
