// src/features/billing/pages/PaymentsPage.tsx
import React, { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchPayments, recordPayment } from '../store/billingSlice';
import { RecordPaymentModal } from '../components/RecordPaymentModal';
import type { RecordPaymentRequest } from '../types/billing.types';
import './ChargeRulesPage.css';

export const PaymentsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { payments, paymentsLoading, paymentsError } = useAppSelector((state) => state.billing);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    dispatch(fetchPayments());
  }, [dispatch]);

  const handleRecordPayment = async (data: RecordPaymentRequest) => {
    setRecording(true);
    try {
      await dispatch(recordPayment(data)).unwrap();
    } finally {
      setRecording(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'REJECTED':
        return 'danger';
      default:
        return 'warning';
    }
  };

  return (
    <PageContainer
      title="Payments"
      actions={
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          + Record Payment
        </Button>
      }
    >
      {paymentsLoading && !payments.length && <LoadingState message="Loading payment transactions..." />}
      {paymentsError && <ErrorMessage message={paymentsError} />}

      {!paymentsLoading && !payments.length && !paymentsError && (
        <EmptyState
          title="No Payments Recorded"
          description="There are currently no recorded payments. Click above to record a payment."
        />
      )}

      {payments.length > 0 && (
        <Card className="rules-card">
          <div className="table-responsive">
            <table className="ams-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Invoice #</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Reference</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="font-semibold">#{p.id}</td>
                    <td>Invoice #{p.invoiceId}</td>
                    <td>LKR {Number(p.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td>{p.paymentMethod}</td>
                    <td>{p.referenceNumber}</td>
                    <td>{new Date(p.paymentDate).toLocaleDateString()}</td>
                    <td>
                      <Badge variant={getStatusBadge(p.status)}>
                        {p.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <RecordPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleRecordPayment}
        loading={recording}
      />
    </PageContainer>
  );
};