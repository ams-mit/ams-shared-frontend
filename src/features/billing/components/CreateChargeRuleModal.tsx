// src/features/billing/components/CreateChargeRuleModal.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/feedback/Alert';
import type { CreateChargeRuleRequest, ChargeType, BillingPeriodType } from '../types/billing.types';
import './CreateChargeRuleModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateChargeRuleRequest) => Promise<void>;
  loading: boolean;
}

export const CreateChargeRuleModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, loading }) => {
  const [name, setName] = useState('');
  const [chargeType, setChargeType] = useState<ChargeType>('MANAGEMENT_FEE');
  const [amount, setAmount] = useState('');
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriodType>('MONTHLY');
  const [applicableToAllUnits, setApplicableToAllUnits] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Charge rule name is required.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be a positive number.');
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        chargeType,
        amount: parsedAmount,
        billingPeriod,
        applicableToAllUnits,
      });
      setName('');
      setAmount('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save charge rule.');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Create Charge Rule</h3>
          <button type="button" className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          {error && <Alert type="error" message={error} autoDismiss={false} />}

          <div className="form-group">
            <label className="form-label">Rule Name *</label>
            <Input
              type="text"
              placeholder="e.g. Monthly Maintenance Fee"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Charge Type *</label>
              <select
                className="form-select"
                value={chargeType}
                onChange={(e) => setChargeType(e.target.value as ChargeType)}
                disabled={loading}
              >
                <option value="MANAGEMENT_FEE">MANAGEMENT</option>
                <option value="PARKING_FEE">PARKING</option>
                <option value="FACILITY_FEE">FACILITY</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Billing Period *</label>
              <select
                className="form-select"
                value={billingPeriod}
                onChange={(e) => setBillingPeriod(e.target.value as BillingPeriodType)}
                disabled={loading}
              >
                <option value="MONTHLY">MONTHLY</option>
                <option value="QUARTERLY">QUARTERLY</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Amount (LKR) *</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={applicableToAllUnits}
                onChange={(e) => setApplicableToAllUnits(e.target.checked)}
                disabled={loading}
              />
              <span style={{ marginLeft: '8px' }}>Apply to all active units</span>
            </label>
          </div>

          <div className="modal-actions">
            <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Rule'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};