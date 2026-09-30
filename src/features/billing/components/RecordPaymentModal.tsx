// src/features/billing/components/RecordPaymentModal.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/feedback/Alert';
import type { RecordPaymentRequest, PaymentMethod } from '../types/billing.types';
import './CreateChargeRuleModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RecordPaymentRequest) => Promise<void>;
  loading: boolean;
  defaultInvoiceId?: number;
  maxPayableAmount?: number;
}

export const RecordPaymentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  defaultInvoiceId,
  maxPayableAmount,
}) => {
  const [invoiceId, setInvoiceId] = useState(defaultInvoiceId?.toString() || '');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedInvoiceId = parseInt(invoiceId, 10);
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedInvoiceId) || parsedInvoiceId <= 0) {
      setError('Please provide a valid numeric Invoice ID.');
      return;
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Payment amount must be greater than zero.');
      return;
    }

    // Critical Business Rule: Prevent Overpayment on client-side
    if (maxPayableAmount !== undefined && parsedAmount > maxPayableAmount) {
      setError(`Overpayment not allowed. The maximum balance due on this invoice is LKR ${maxPayableAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}.`);
      return;
    }

    if (!referenceNumber.trim()) {
      setError('Transaction reference number is required.');
      return;
    }

    try {
      await onSubmit({
        invoiceId: parsedInvoiceId,
        amount: parsedAmount,
        paymentDate,
        paymentMethod,
        referenceNumber: referenceNumber.trim(),
      });
      setAmount('');
      setReferenceNumber('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to record simulated payment.');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Record Simulated Payment</h3>
          <button type="button" className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          {error && <Alert type="error" message={error} autoDismiss={false} />}

          <div className="form-group">
            <label className="form-label">Invoice ID *</label>
            <Input
              type="number"
              placeholder="e.g. 101"
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
              disabled={loading || !!defaultInvoiceId}
              required
            />
          </div>

          <div className="form-row">
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

            <div className="form-group">
              <label className="form-label">Payment Date *</label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Method *</label>
              <select
                className="form-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                disabled={loading}
              >
                <option value="BANK_TRANSFER">BANK TRANSFER</option>
                <option value="CARD">CARD (SIMULATED)</option>
                <option value="CASH">CASH</option>
                <option value="CHEQUE">CHEQUE</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Reference / Slip # *</label>
              <Input
                type="text"
                placeholder="e.g. TXN-884920"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="modal-actions">
            <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Recording...' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};