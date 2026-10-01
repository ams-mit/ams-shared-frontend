// src/features/billing/pages/ChargeRulesPage.tsx
import React, { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchChargeRules, createChargeRule, toggleChargeRuleStatus } from '../store/billingSlice';
import { CreateChargeRuleModal } from '../components/CreateChargeRuleModal';
import type { CreateChargeRuleRequest } from '../types/billing.types';
import './ChargeRulesPage.css';

export const ChargeRulesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { chargeRules, chargeRulesLoading, chargeRulesError } = useAppSelector((state) => state.billing);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchChargeRules());
  }, [dispatch]);

  const handleCreateRule = async (data: CreateChargeRuleRequest) => {
    setSubmitting(true);
    try {
      await dispatch(createChargeRule(data)).unwrap();
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: 'ACTIVE' | 'INACTIVE') => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await dispatch(toggleChargeRuleStatus({ id, status: nextStatus }));
  };

  return (
    <PageContainer
      title="Charge Rules"
      actions={
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          + Create Charge Rule
        </Button>
      }
    >
      {chargeRulesLoading && !chargeRules.length && <LoadingState message="Loading charge rules..." />}
      {chargeRulesError && <ErrorMessage message={chargeRulesError} />}

      {!chargeRulesLoading && !chargeRules.length && !chargeRulesError && (
        <EmptyState
          title="No Charge Rules"
          description="No billing charge rules have been configured yet. Click above to create the first rule."
        />
      )}

      {chargeRules.length > 0 && (
        <Card className="rules-card">
          <div className="table-responsive">
            <table className="ams-table">
              <thead>
                <tr>
                  <th>Rule Name</th>
                  <th>Type</th>
                  <th>Period</th>
                  <th>Amount</th>
                  <th>Applies To</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {chargeRules.map((rule) => (
                  <tr key={rule.id}>
                    <td className="font-semibold">{rule.name}</td>
                    <td>{rule.chargeType}</td>
                    <td>{rule.billingPeriod}</td>
                    <td>LKR {Number(rule.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td>{rule.applicableToAllUnits ? 'All Units' : 'Assigned Only'}</td>
                    <td>
                        <Badge variant={rule.status === 'ACTIVE' ? 'success' : 'neutral'}>
                            {rule.status}
                        </Badge>
                    </td>
                    <td>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleToggleStatus(rule.id, rule.status)}
                      >
                        {rule.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <CreateChargeRuleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateRule}
        loading={submitting}
      />
    </PageContainer>
  );
};