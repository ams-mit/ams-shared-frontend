// src/features/utilities/pages/UtilitiesPage.tsx
import React, { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchUtilityRates, fetchUtilityCharges, createUtilityCharge } from '../store/utilitySlice';
import { RecordUtilityChargeModal } from '../components/RecordUtilityChargeModal';
import type { CreateUtilityChargeRequest } from '../types/utility.types';
import '@/features/billing/pages/ChargeRulesPage.css';

export const UtilitiesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { rates, ratesLoading, charges, chargesLoading, chargesError } = useAppSelector(
    (state) => state.utilities
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchUtilityRates());
    dispatch(fetchUtilityCharges());
  }, [dispatch]);

  const handleCreateCharge = async (data: CreateUtilityChargeRequest) => {
    setSubmitting(true);
    try {
      await dispatch(createUtilityCharge(data)).unwrap();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer
      title="Utility Metering & Rates"
      actions={
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          + Record Meter Reading
        </Button>
      }
    >
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ color: 'var(--color-primary, #1E3A5F)', marginBottom: '12px' }}>Active Tariff Rates</h4>
        {ratesLoading && <LoadingState message="Loading utility rates..." />}
        {rates.length > 0 && (
          <Card className="rules-card">
            <div className="table-responsive">
              <table className="ams-table">
                <thead>
                  <tr>
                    <th>Utility Type</th>
                    <th>Rate Per Unit</th>
                    <th>Unit of Measure</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map((r) => (
                    <tr key={r.id}>
                      <td className="font-semibold">{r.utilityType}</td>
                      <td>LKR {Number(r.ratePerUnit).toFixed(2)}</td>
                      <td>{r.unitOfMeasure}</td>
                      <td>
                        <Badge variant={r.status === 'ACTIVE' ? 'success' : 'neutral'}>
                          {r.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      <div>
        <h4 style={{ color: 'var(--color-primary, #1E3A5F)', marginBottom: '12px' }}>Recorded Consumption</h4>
        {chargesLoading && !charges.length && <LoadingState message="Loading utility charges..." />}
        {chargesError && <ErrorMessage message={chargesError} />}

        {!chargesLoading && !charges.length && !chargesError && (
          <EmptyState
            title="No Utility Readings"
            description="No meter readings have been recorded yet. Click above to log usage."
          />
        )}

        {charges.length > 0 && (
          <Card className="rules-card">
            <div className="table-responsive">
              <table className="ams-table">
                <thead>
                  <tr>
                    <th>Unit</th>
                    <th>Utility</th>
                    <th>Period</th>
                    <th>Usage</th>
                    <th>Rate</th>
                    <th>Calculated Amount</th>
                    <th>Recorded Date</th>
                  </tr>
                </thead>
                <tbody>
                  {charges.map((c) => (
                    <tr key={c.id}>
                      <td className="font-semibold">{c.unitId}</td>
                      <td>{c.utilityType}</td>
                      <td>{c.billingYear}/{c.billingMonth}</td>
                      <td>{c.usageValue}</td>
                      <td>LKR {Number(c.ratePerUnit).toFixed(2)}</td>
                      <td className="font-semibold">
                        LKR {Number(c.calculatedAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td>{new Date(c.recordedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      <RecordUtilityChargeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCharge}
        loading={submitting}
      />
    </PageContainer>
  );
};