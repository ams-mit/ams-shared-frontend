// src/features/billing/pages/FinanceDashboardPage.tsx
import React, { useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchFinanceDashboard } from '../store/billingSlice';
import './FinanceDashboardPage.css';

export const FinanceDashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dashboardSummary, arrears, dashboardLoading, dashboardError } = useAppSelector(
    (state) => state.billing
  );

  useEffect(() => {
    dispatch(fetchFinanceDashboard());
  }, [dispatch]);

  return (
    <PageContainer title="Finance Dashboard">
      {dashboardLoading && !dashboardSummary && <LoadingState message="Loading financial indicators..." />}
      {dashboardError && <ErrorMessage message={dashboardError} />}

      {dashboardSummary && (
        <div className="dashboard-metrics-grid">
          <Card className="metric-tile">
            <span className="metric-title">Invoiced This Month</span>
            <span className="metric-value">
              LKR {Number(dashboardSummary.totalInvoicedThisMonth).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </Card>

          <Card className="metric-tile">
            <span className="metric-title">Collected This Month</span>
            <span className="metric-value accent-text">
              LKR {Number(dashboardSummary.totalCollectedThisMonth).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </Card>

          <Card className="metric-tile">
            <span className="metric-title">Total Arrears (Outstanding)</span>
            <span className="metric-value danger-text">
              LKR {Number(dashboardSummary.totalOutstanding).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </Card>

          <Card className="metric-tile">
            <span className="metric-title">Collection Rate</span>
            <span className="metric-value">
              {Number(dashboardSummary.collectionRatePercent).toFixed(1)}%
            </span>
            <span className="metric-sub">Overdue accounts: {dashboardSummary.overdueAccountsCount}</span>
          </Card>
        </div>
      )}

      <div style={{ marginTop: '32px' }}>
        <h3 style={{ color: 'var(--color-primary, #1E3A5F)', marginBottom: '16px' }}>Arrears & Overdue Register</h3>
        <Card className="rules-card">
          <div className="table-responsive">
            <table className="ams-table">
              <thead>
                <tr>
                  <th>Unit ID</th>
                  <th>Occupant / Resident</th>
                  <th>Outstanding Amount</th>
                  <th>Overdue Duration</th>
                  <th>Last Payment</th>
                </tr>
              </thead>
              <tbody>
                {arrears.length > 0 ? (
                  arrears.map((item) => (
                    <tr key={item.unitId}>
                      <td className="font-semibold">{item.unitId}</td>
                      <td>{item.residentName}</td>
                      <td className="danger-text" style={{ fontWeight: 600 }}>
                        LKR {Number(item.outstandingBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        <Badge variant={item.overdueMonths >= 3 ? 'danger' : 'warning'}>
                          {item.overdueMonths} Months Overdue
                        </Badge>
                      </td>
                      <td>{item.lastPaymentDate ? new Date(item.lastPaymentDate).toLocaleDateString() : 'None'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>
                      No units currently in arrears.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};