// src/features/billing/pages/InvoicesPage.tsx
import React, { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchInvoices, generateInvoice } from '../store/billingSlice'; // <-- Imported here once
import { GenerateInvoiceModal } from '../components/GenerateInvoiceModal';
import { InvoiceDetailModal } from '../components/InvoiceDetailModal';
import type { Invoice, GenerateInvoiceRequest } from '../types/billing.types';
import './ChargeRulesPage.css';

export const InvoicesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { invoices, invoicesLoading, invoicesError } = useAppSelector((state) => state.billing);

  const [unitFilter, setUnitFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    dispatch(fetchInvoices({ unitId: unitFilter || undefined, status: statusFilter || undefined }));
  }, [dispatch, unitFilter, statusFilter]);

  const handleGenerate = async (data: GenerateInvoiceRequest) => {
    setGenerating(true);
    try {
      await dispatch(generateInvoice(data)).unwrap();
      setIsGenerateOpen(false); // Close modal on successful generation
      dispatch(fetchInvoices({ unitId: unitFilter || undefined, status: statusFilter || undefined }));
    } catch (err) {
      console.error('Failed to generate invoice:', err);
    } finally {
      setGenerating(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'OVERDUE':
        return 'danger';
      case 'PARTIALLY_PAID':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  // Safely ensure invoices is handled as an array
  const invoiceList = Array.isArray(invoices) ? invoices : [];

  return (
    <PageContainer
      title="Invoices"
      actions={
        <Button variant="primary" onClick={() => setIsGenerateOpen(true)}>
          + Generate Invoice
        </Button>
      }
    >
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ flex: '1', maxWidth: '300px' }}>
          <Input
            type="text"
            placeholder="Filter by Unit ID..."
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
          />
        </div>
        <div>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
          >
            <option value="">All Statuses</option>
            <option value="ISSUED">ISSUED</option>
            <option value="PARTIALLY_PAID">PARTIALLY PAID</option>
            <option value="PAID">PAID</option>
            <option value="OVERDUE">OVERDUE</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {invoicesLoading && !invoiceList.length && <LoadingState message="Loading invoices..." />}
      {invoicesError && <ErrorMessage message={invoicesError} />}

      {!invoicesLoading && !invoiceList.length && !invoicesError && (
        <EmptyState
          title="No Invoices Found"
          description="There are currently no invoices matching your selection. Click above to generate one."
        />
      )}

      {invoiceList.length > 0 && (
        <Card className="rules-card">
          <div className="table-responsive">
            <table className="ams-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Unit</th>
                  <th>Billing Period</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Issued Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoiceList.map((inv) => (
                  <tr key={inv.id}>
                    <td className="font-semibold">#{inv.id}</td>
                    <td>{inv.unitId}</td>
                    <td>{inv.billingYear}/{inv.billingMonth}</td>
                    <td>LKR {Number(inv.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td>
                      <Badge variant={getStatusVariant(inv.status)}>
                        {inv.status}
                      </Badge>
                    </td>
                    <td>{inv.issuedAt ? new Date(inv.issuedAt).toLocaleDateString() : '-'}</td>
                    <td>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedInvoice(inv)}
                      >
                        View Snapshot
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <GenerateInvoiceModal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        onSubmit={handleGenerate}
        loading={generating}
      />

      <InvoiceDetailModal
        isOpen={!!selectedInvoice}
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </PageContainer>
  );
};