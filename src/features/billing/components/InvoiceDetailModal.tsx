// src/features/billing/components/InvoiceDetailModal.tsx
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { billingApi } from '../api/billingApi';
import type { Invoice, InvoiceLine } from '../types/billing.types';
import './InvoiceDetailModal.css';

interface Props {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceDetailModal: React.FC<Props> = ({ invoice, isOpen, onClose }) => {
  const [lines, setLines] = useState<InvoiceLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (invoice && isOpen) {
      setLoading(true);
      setError(null);
      billingApi
        .getInvoiceLines(invoice.id)
        .then((data) => setLines(data))
        .catch((err: any) => setError(err.message || 'Failed to fetch invoice lines'))
        .finally(() => setLoading(false));
    }
  }, [invoice, isOpen]);

  if (!isOpen || !invoice) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card invoice-detail-card">
        <div className="modal-header">
          <h3>Invoice Snapshot — #{invoice.id}</h3>
          <button type="button" className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="invoice-meta-section">
          <div><strong>Unit:</strong> {invoice.unitId}</div>
          <div><strong>Period:</strong> {invoice.billingYear}/{invoice.billingMonth}</div>
          <div>
            <strong>Status:</strong>{' '}
            <Badge variant={invoice.status === 'PAID' ? 'success' : invoice.status === 'OVERDUE' ? 'danger' : 'neutral'}>
              {invoice.status}
            </Badge>
          </div>
          <div><strong>Issued:</strong> {new Date(invoice.issuedAt).toLocaleDateString()}</div>
        </div>

        <div className="modal-body">
          {loading && <LoadingState message="Loading frozen line items..." />}
          {error && <ErrorMessage message={error} />}

          {!loading && !error && (
            <table className="ams-table lines-table">
              <thead>
                <tr>
                  <th>Line Item Description</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Snapshot Amount</th>
                </tr>
              </thead>
              <tbody>
                {lines.length > 0 ? (
                  lines.map((line) => (
                    <tr key={line.id}>
                      <td>{line.chargeRuleName}</td>
                      <td>{line.chargeType}</td>
                      <td style={{ textAlign: 'right' }}>
                        LKR {Number(line.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: '#6b7280' }}>
                      No separate line items recorded.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan={2}>Total Amount:</th>
                  <th style={{ textAlign: 'right' }}>
                    LKR {Number(invoice.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </th>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        <div className="modal-actions" style={{ padding: '16px 24px' }}>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};