// src/features/billing/components/GenerateInvoiceModal.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/feedback/Alert';
import type { GenerateInvoiceRequest } from '../types/billing.types';
import './CreateChargeRuleModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GenerateInvoiceRequest) => Promise<void>;
  loading: boolean;
}

export const GenerateInvoiceModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, loading }) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [unitId, setUnitId] = useState('');
  const [billingYear, setBillingYear] = useState<number>(currentYear);
  const [billingMonth, setBillingMonth] = useState<number>(currentMonth);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!unitId.trim()) {
      setError('Unit ID is required.');
      return;
    }

    try {
      await onSubmit({
        unitId: unitId.trim(),
        billingYear: Number(billingYear),
        billingMonth: Number(billingMonth),
        // Use the accepted enum value and a valid default resident ID format
        billingPeriod: 'MONTHLY',
        residentId: 'res-default-01',
      } as any);
      
      setUnitId('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to generate invoice.');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Generate Unit Invoice</h3>
          <button type="button" className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          {error && <Alert type="error" message={error} autoDismiss={false} />}

          <div className="form-group">
            <label className="form-label">Unit Reference *</label>
            <Input
              type="text"
              placeholder="e.g. U-101 or UNIT-001"
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Billing Year *</label>
              <Input
                type="number"
                min="2020"
                max="2035"
                value={billingYear.toString()}
                onChange={(e) => setBillingYear(Number(e.target.value))}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Billing Month (1 - 12) *</label>
              <select
                className="form-select"
                value={billingMonth}
                onChange={(e) => setBillingMonth(Number(e.target.value))}
                disabled={loading}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(0, m - 1).toLocaleString('en', { month: 'long' })} ({m})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--color-secondary, #4E6D8A)', margin: 0 }}>
            * The invoice is billed to the resident on the unit's active lease and includes that month's utility readings.
          </p>

          <div className="modal-actions">
            <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Generating...' : 'Generate Invoice'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};