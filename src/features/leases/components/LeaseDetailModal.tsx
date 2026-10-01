import React, { useCallback, useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/feedback/Alert';
import { toApiError, type ApiErrorInfo } from '@/services/api/apiError';
import { occupancyApi } from '@/features/occupancies/api/occupancyApi';
import type { Occupancy } from '@/features/occupancies/types/occupancy.types';
import { leaseApi } from '../api/leaseApi';
import { leaseErrorTitle } from '../utils/leaseErrors';
import { localToday } from '../validation/leaseValidation';
import { LEASE_STATUS_LABEL, LeaseStatusBadge } from './LeaseStatusBadge';
import type { Lease, LeaseHistoryItem } from '../types/lease.types';

export interface LeaseDetailModalProps {
  lease: Lease | null;
  canManage: boolean;
  onClose: () => void;
}

interface Section<T> {
  data: T[];
  error: ApiErrorInfo | null;
}

const mono: React.CSSProperties = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '0.8125rem' };
const muted: React.CSSProperties = { margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' };
const row: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.625rem 0.75rem',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  fontSize: '0.8125rem',
};

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)' }}>
    {children}
  </h3>
);

const OCCUPANCY_VARIANT = { PENDING: 'warning', ACTIVE: 'success', ENDED: 'neutral', CANCELLED: 'neutral' } as const;

const toSection = <T,>(result: PromiseSettledResult<T[]>, fallback: string): Section<T> =>
  result.status === 'fulfilled' ? { data: result.value, error: null } : { data: [], error: toApiError(result.reason, fallback) };

export const LeaseDetailModal: React.FC<LeaseDetailModalProps> = ({ lease, canManage, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Section<LeaseHistoryItem>>({ data: [], error: null });
  const [occupancies, setOccupancies] = useState<Section<Occupancy>>({ data: [], error: null });
  const [moveInDate, setMoveInDate] = useState(localToday());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<ApiErrorInfo | null>(null);

  const load = useCallback(async (target: Lease, signal?: { cancelled: boolean }) => {
    setLoading(true);
    const [historyResult, occupancyResult] = await Promise.allSettled([
      leaseApi.history(target.id).then((h) => h.history),
      occupancyApi
        .forUnit(target.unitId, { includeHistory: true, size: 100 })
        .then((list) => list.filter((o) => o.leaseId === target.id)),
    ]);
    if (signal?.cancelled) return;
    setHistory(toSection(historyResult, 'Could not load status history.'));
    setOccupancies(toSection(occupancyResult, 'Could not load occupancy records.'));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!lease) return;
    const signal = { cancelled: false };
    setActionError(null);
    setMoveInDate(lease.startDate > localToday() ? lease.startDate : localToday());
    load(lease, signal);
    return () => {
      signal.cancelled = true;
    };
  }, [lease, load]);

  if (!lease) return null;

  const run = async (key: string, action: () => Promise<unknown>) => {
    setBusyId(key);
    setActionError(null);
    try {
      await action();
      await load(lease);
    } catch (err) {
      setActionError(toApiError(err, 'The occupancy update failed.'));
    } finally {
      setBusyId(null);
    }
  };

  const registerMoveIn = (residentId: string) =>
    run(residentId, () =>
      occupancyApi.register({ unitId: lease.unitId, residentId, leaseId: lease.id, startDate: moveInDate })
    );

  const recordMoveOut = (occupancy: Occupancy) =>
    run(occupancy.id, () =>
      occupancyApi.updateStatus(occupancy.id, { status: 'ENDED', effectiveDate: localToday(), reason: 'Move-out recorded' })
    );

  const activeFor = (residentId: string) => occupancies.data.find((o) => o.residentId === residentId && o.status === 'ACTIVE');
  const canRegister = canManage && lease.status === 'ACTIVE';

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Lease Details"
      subtitle={`${lease.startDate} → ${lease.endDate}`}
      maxWidth="640px"
      footer={
        <Button type="button" variant="outline" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', fontSize: '0.875rem' }}>
          <span>
            Status <LeaseStatusBadge status={lease.status} />
          </span>
          <span>
            Lease <span style={mono}>{lease.id}</span>
          </span>
          <span>
            Unit <span style={mono}>{lease.unitId}</span>
          </span>
          {lease.notes && <span>Notes: {lease.notes}</span>}
        </div>

        {actionError && (
          <Alert
            type="error"
            title={leaseErrorTitle(actionError)}
            message={actionError.message}
            autoDismiss={false}
            onDismiss={() => setActionError(null)}
          />
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
            <Spinner />
          </div>
        ) : (
          <>
            <section>
              <SectionTitle>Residents & Occupancy</SectionTitle>
              {occupancies.error && <p style={muted}>{occupancies.error.message}</p>}
              {canRegister && (
                <div style={{ maxWidth: '220px', marginBottom: '0.75rem' }}>
                  <Input
                    type="date"
                    label="Move-in date"
                    value={moveInDate}
                    min={lease.startDate}
                    max={lease.endDate}
                    onChange={(event) => setMoveInDate(event.target.value)}
                  />
                </div>
              )}
              <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {lease.occupants.map((residentId, index) => {
                  const active = activeFor(residentId);
                  return (
                    <li key={residentId} style={row}>
                      <span>
                        <span style={mono}>{residentId}</span>
                        {index === 0 && <span style={{ color: 'var(--color-text-muted)' }}> · primary tenant</span>}
                        {active && <span style={{ color: 'var(--color-text-muted)' }}> · moved in {active.startDate}</span>}
                      </span>
                      {active ? (
                        canManage ? (
                          <Button size="sm" variant="outline" isLoading={busyId === active.id} onClick={() => recordMoveOut(active)}>
                            Record move-out
                          </Button>
                        ) : (
                          <Badge variant="success" dot>
                            In residence
                          </Badge>
                        )
                      ) : canRegister ? (
                        <Button size="sm" isLoading={busyId === residentId} disabled={!moveInDate} onClick={() => registerMoveIn(residentId)}>
                          Register move-in
                        </Button>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)' }}>Not in residence</span>
                      )}
                    </li>
                  );
                })}
              </ol>
              {!canRegister && canManage && lease.status !== 'ACTIVE' && (
                <p style={{ ...muted, marginTop: '0.5rem' }}>Move-ins can be registered once the lease is active.</p>
              )}
            </section>

            {occupancies.data.some((o) => o.status !== 'ACTIVE') && (
              <section>
                <SectionTitle>Past Occupancy</SectionTitle>
                <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {occupancies.data
                    .filter((o) => o.status !== 'ACTIVE')
                    .map((o) => (
                      <li key={o.id} style={row}>
                        <span>
                          <span style={mono}>{o.residentId.slice(0, 8)}…</span> {o.startDate} → {o.endDate ?? '—'}
                        </span>
                        <Badge variant={OCCUPANCY_VARIANT[o.status]} dot>
                          {o.status.charAt(0) + o.status.slice(1).toLowerCase()}
                        </Badge>
                      </li>
                    ))}
                </ol>
              </section>
            )}

            <section>
              <SectionTitle>Status History</SectionTitle>
              {history.error ? (
                <p style={muted}>{history.error.message}</p>
              ) : history.data.length === 0 ? (
                <p style={muted}>No status changes recorded.</p>
              ) : (
                <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {history.data.map((item) => (
                    <li key={`${item.status}-${item.changedAt}`} style={row}>
                      <span>
                        <strong>{LEASE_STATUS_LABEL[item.status] ?? item.status}</strong>
                        {item.reason && <span style={{ color: 'var(--color-text-muted)' }}> · {item.reason}</span>}
                      </span>
                      <span style={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(item.changedAt).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </>
        )}
      </div>
    </Modal>
  );
};
