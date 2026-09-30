// src/features/billing/pages/ReceiptsPage.tsx
import React, { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchReceiptsByUnit } from '../store/billingSlice';
import { ReceiptModal } from '../components/ReceiptModal';
import type { Receipt } from '../types/billing.types';
import './ChargeRulesPage.css';

export const ReceiptsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { receipts, receiptsLoading, receiptsError } = useAppSelector((state) => state.billing);
  const [unitSearch, setUnitSearch] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (unitSearch.trim()) {
      dispatch(fetchReceiptsByUnit(unitSearch.trim()));
    }
  };

  return (
    <PageContainer title="Receipts">
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', maxWidth: '400px', marginBottom: '20px' }}>
        <Input
          type="text"
          placeholder="Enter Unit ID (e.g. U-101)..."
          value={unitSearch}
          onChange={(e) => setUnitSearch(e.target.value)}
        />
        <Button variant="primary" type="submit">
          Search
        </Button>
      </form>

      {receiptsLoading && <LoadingState message="Loading payment receipts..." />}
      {receiptsError && <ErrorMessage message={receiptsError} />}

      {!receiptsLoading && !receipts.length && !receiptsError && (
        <EmptyState
          title="No Receipts Found"
          description="Enter a Unit ID above to find and view confirmed payment receipts."
        />
      )}

      {receipts.length > 0 && (
        <Card className="rules-card">
          <div className="table-responsive">
            <table className="ams-table">
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>Unit ID</th>
                  <th>Billing Period</th>
                  <th>Amount Paid</th>
                  <th>Method</th>
                  <th>Reference</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((r) => (
                  <tr key={r.id}>
                    <td className="font-semibold">REC-{r.id}</td>
                    <td>{r.unitId}</td>
                    <td>{r.billingPeriod}</td>
                    <td>LKR {Number(r.amountPaid).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td>{r.paymentMethod}</td>
                    <td>{r.referenceNumber}</td>
                    <td>
                      <Button variant="secondary" size="sm" onClick={() => setSelectedReceipt(r)}>
                        View & Print
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <ReceiptModal
        isOpen={!!selectedReceipt}
        receipt={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </PageContainer>
  );
};