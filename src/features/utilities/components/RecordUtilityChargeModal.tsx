// src/features/utilities/components/RecordUtilityChargeModal.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/feedback/Alert';
import type { CreateUtilityChargeRequest, UtilityType } from '../types/utility.types';
import '@/features/billing/components/CreateChargeRuleModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUtilityChargeRequest) => Promise<void>;
  loading: boolean;
}

export const RecordUtilityChargeModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, loading }) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [unitId, setUnitId] = useState('');
  const [utilityType, setUtilityType] = useState<UtilityType>('WATER');
  const [billingYear, setBillingYear] = useState<number>(currentYear);
  const [billingMonth, setBillingMonth] = useState<number>(currentMonth);
  const [usageValue, setUsageValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!unitId.trim()) {
      setError('Unit ID is required.');
      return;
    }

    const parsedUsage = parseFloat(usageValue);
    if (isNaN(parsedUsage) || parsedUsage < 0) {
      setError('Usage consumption must be a positive number.');
      return;
    }

    try {
      await onSubmit({
        unitId: unitId.trim(),
        utilityType,
        billingYear: Number(billingYear),
        billingMonth: Number(billingMonth),
        usageValue: parsedUsage,
      });
      setUsageValue('');
      setUnitId('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to record utility charge.');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Record Utility Meter Reading</h3>
          <button type="button" className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          {error && <Alert type="error" message={error} autoDismiss={false} />}

          <div className="form-group">
            <label className="form-label">Unit Reference *</label>
            <Input
              type="text"
              placeholder="e.g. U-101"
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Utility Type *</label>
              <select
                className="form-select"
                value={utilityType}
                onChange={(e) => setUtilityType(e.target.value as UtilityType)}
                disabled={loading}
              >
                <option value="WATER">WATER</option>
                <option value="ELECTRICITY">ELECTRICITY</option>
                <option value="GAS">GAS</option>
                <option value="PARKING">PARKING</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Usage Units (Consumption) *</label>
              <Input
                type="number"
                step="0.01"
                placeholder="e.g. 15.5"
                value={usageValue}
                onChange={(e) => setUsageValue(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Year *</label>
              <Input
                type="number"
                value={billingYear.toString()}
                onChange={(e) => setBillingYear(Number(e.target.value))}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Month *</label>
              <select
                className="form-select"
                value={billingMonth}
                onChange={(e) => setBillingMonth(Number(e.target.value))}
                disabled={loading}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Record Reading'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};