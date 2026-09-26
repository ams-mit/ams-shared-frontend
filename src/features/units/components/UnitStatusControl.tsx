import React, { useState } from 'react';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/feedback/Alert';
import { useAppDispatch } from '@/app/store/hooks';
import type { ApiErrorInfo } from '@/services/api/apiError';
import { fetchInventory, updateUnitStatus } from '../store/unitSlice';
import { UNIT_STATUS_THEME } from './UnitStatusBadge';
import { UNIT_STATUS_TRANSITIONS, type Unit, type UnitStatus } from '../types/unit.types';

const transitionWarning = (from: UnitStatus, to: UnitStatus | ''): string | null => {
  if (from === 'OCCUPIED' && to === 'UNDER_MAINTENANCE') {
    return 'This unit has active occupants. A maintenance lock blocks new leases, and current occupants will need to be relocated to an available unit.';
  }
  if (to === 'INACTIVE') return 'Inactive is a final state — the unit cannot be moved to any other status afterwards.';
  return null;
};

export const UnitStatusControl: React.FC<{ unit: Unit }> = ({ unit }) => {
  const dispatch = useAppDispatch();
  const [target, setTarget] = useState<UnitStatus | ''>('');
  const [error, setError] = useState<ApiErrorInfo | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const allowed = UNIT_STATUS_TRANSITIONS[unit.status];
  // Drop a choice that stopped being legal after the unit's status was refreshed.
  const selected = target && allowed.includes(target) ? target : '';
  const warning = transitionWarning(unit.status, selected);

  if (allowed.length === 0) {
    return (
      <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
        {UNIT_STATUS_THEME[unit.status].label} is a final status; no further changes are allowed.
      </p>
    );
  }

  const save = async () => {
    if (!selected) return;
    setIsSaving(true);
    setError(null);
    try {
      await dispatch(updateUnitStatus({ unitId: unit.id, status: selected })).unwrap();
      setTarget('');
    } catch (err) {
      const apiError = err as ApiErrorInfo;
      // A rejected transition usually means the status changed elsewhere; reload the real state.
      if (apiError.status === 400 || apiError.status === 409) {
        dispatch(fetchInventory());
        setError({ ...apiError, message: `${apiError.message}. The unit list has been refreshed with its current status.` });
      } else {
        setError(apiError);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 180px' }}>
          <Select
            label="Change status to"
            placeholder="Select next status"
            value={selected}
            options={allowed.map((s) => ({ value: s, label: UNIT_STATUS_THEME[s].label }))}
            onChange={(event) => {
              setTarget(event.target.value as UnitStatus);
              setError(null);
            }}
          />
        </div>
        <Button
          size="md"
          variant={warning ? 'danger' : 'primary'}
          onClick={save}
          disabled={!selected}
          isLoading={isSaving}
        >
          {warning ? 'Confirm' : 'Update'}
        </Button>
      </div>
      {warning && <Alert type="warning" message={warning} autoDismiss={false} showDismissButton={false} />}
      {error && <Alert type="error" title="Status not changed" message={error.message} autoDismiss={false} onDismiss={() => setError(null)} />}
    </div>
  );
};
