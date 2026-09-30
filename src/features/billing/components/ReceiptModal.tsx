// src/features/billing/components/ReceiptModal.tsx
import React from 'react';
import { Button } from '@/components/ui/Button';
import type { Receipt } from '../types/billing.types';
import './ReceiptModal.css';

interface Props {
  receipt: Receipt | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<Props> = ({ receipt, isOpen, onClose }) => {
  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card receipt-card">
        <div className="modal-header">
          <h3>Payment Receipt</h3>
          <button type="button" className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="receipt-content" id="printable-receipt">
          <div className="receipt-header">
            <h4>APARTMENT MANAGEMENT SYSTEM</h4>
            <p>Official Payment Acknowledgment</p>
            <div className="receipt-number">Receipt No: REC-{receipt.id}</div>
          </div>

          <div className="receipt-divider" />

          <div className="receipt-grid">
            <div><span className="label">Unit Reference:</span> <strong>{receipt.unitId}</strong></div>
            <div><span className="label">Billing Period:</span> <strong>{receipt.billingPeriod}</strong></div>
            <div><span className="label">Payment Method:</span> <strong>{receipt.paymentMethod}</strong></div>
            <div><span className="label">Reference No:</span> <strong>{receipt.referenceNumber}</strong></div>
            <div><span className="label">Date of Payment:</span> <strong>{new Date(receipt.paymentDate).toLocaleDateString()}</strong></div>
            <div><span className="label">Generated On:</span> <strong>{new Date(receipt.issuedAt).toLocaleDateString()}</strong></div>
          </div>

          <div className="receipt-amount-box">
            <span className="amount-label">Total Amount Paid</span>
            <span className="amount-value">LKR {Number(receipt.amountPaid).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>

          <p className="receipt-footer-note">
            * This is an immutable, system-generated payment receipt.
          </p>
        </div>

        <div className="modal-actions" style={{ padding: '16px 24px', background: '#f9fafb' }}>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handlePrint}>
            Print Receipt
          </Button>
        </div>
      </div>
    </div>
  );
};