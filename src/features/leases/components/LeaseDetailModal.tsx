import { localToday } from '../validation/leaseValidation';
import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/feedback/Alert';
import { toApiError } from '@/services/api/apiError';
import { leaseApi } from '../api/leaseApi';
import { occupancyApi } from '@/features/occupancies/api/occupancyApi';
import type { Occupancy } from '@/features/occupancies/types/occupancy.types';
import type { Lease, LeaseStatusHistory } from '../types/lease.types';
export const LeaseDetailModal = ({
  lease,
  onClose,
  onChanged,
}: {
  lease: Lease;
  onClose: () => void;
  onChanged: () => void;
}) => {
  const [history, setHistory] = useState<LeaseStatusHistory[]>([]);
  const [occupancies, setOccupancies] = useState<Occupancy[]>([]);
  const [historyError, setHistoryError] = useState('');
  const [occupancyError, setOccupancyError] = useState('');
  const [actionError, setActionError] = useState('');
  const [date, setDate] = useState(localToday());
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setHistory([]);
    setOccupancies([]);
    setHistoryError('');
    setOccupancyError('');
    Promise.allSettled([
      leaseApi.history(lease.id),
      occupancyApi.forUnit(lease.unitId),
    ]).then(([h, o]) => {
      if (cancelled) return;
      if (h.status === 'fulfilled') setHistory(h.value);
      else
        setHistoryError(
          toApiError(h.reason, 'Could not load status history.').message
        );
      if (o.status === 'fulfilled')
        setOccupancies(o.value.filter((row) => row.leaseId === lease.id));
      else
        setOccupancyError(
          toApiError(o.reason, 'Could not load physical occupants.').message
        );
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [lease.id, lease.unitId, refresh]);
  const act = async (id?: string) => {
    setActionError('');
    if (
      !id &&
      (!date ||
        date < lease.startDate ||
        date > lease.endDate ||
        date > localToday())
    ) {
      setActionError(
        'Move-in date must be within the lease term and cannot be in the future.'
      );
      return;
    }
    setBusy(true);
    try {
      if (id) await occupancyApi.deactivate(id);
      else
        await occupancyApi.register({
          unitId: lease.unitId,
          leaseId: lease.id,
          residentId: lease.tenantId,
          moveInDate: date,
        });
      setRefresh((n) => n + 1);
      onChanged();
    } catch (err) {
      setActionError(toApiError(err, 'Could not update occupancy.').message);
    } finally {
      setBusy(false);
    }
  };
  const hasTenant = occupancies.some(
    (o) => o.residentId === lease.tenantId && o.status === 'ACTIVE'
  );
  return (
    <Modal isOpen onClose={onClose} title="Lease Details" maxWidth="720px">
      <div style={{ display: 'grid', gap: '1rem' }}>
        <p>
          Lease: {lease.id}
          <br />
          Unit: {lease.unitId}
          <br />
          Tenant: {lease.tenantId}
          <br />
          {lease.startDate} → {lease.endDate} · {lease.status}
        </p>
        {actionError && (
          <Alert type="error" message={actionError} autoDismiss={false} />
        )}
        <h3>Physical Occupants</h3>
        {loading ? (
          <p>Loading…</p>
        ) : occupancyError ? (
          <Alert type="error" message={occupancyError} autoDismiss={false} />
        ) : occupancies.length ? (
          occupancies.map((o) => (
            <div key={o.id}>
              <p>
                {o.residentId} · Moved in {o.moveInDate}
              </p>
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => act(o.id)}
              >
                Record Move-out
              </Button>
            </div>
          ))
        ) : (
          <p>No current physical occupants recorded.</p>
        )}
        {lease.status === 'ACTIVE' &&
          !loading &&
          !occupancyError &&
          !hasTenant && (
            <div>
              <Input
                label="Tenant Move-in Date"
                type="date"
                min={lease.startDate}
                max={
                  lease.endDate < localToday() ? lease.endDate : localToday()
                }
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <Button disabled={busy} onClick={() => act()}>
                Register Tenant Move-in
              </Button>
            </div>
          )}
        <h3>Status History</h3>
        {loading ? (
          <p>Loading…</p>
        ) : historyError ? (
          <Alert type="error" message={historyError} autoDismiss={false} />
        ) : history.length ? (
          <ol>
            {history.map((h) => (
              <li key={h.id}>
                {h.fromStatus ?? 'Created'} → {h.toStatus} ·{' '}
                {new Date(h.changedAt).toLocaleString()} · {h.changedBy}
                {h.reason ? ` · ${h.reason}` : ''}
              </li>
            ))}
          </ol>
        ) : (
          <p>No status changes recorded.</p>
        )}
      </div>
    </Modal>
  );
};
