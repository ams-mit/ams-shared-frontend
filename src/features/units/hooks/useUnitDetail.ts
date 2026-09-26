import { useEffect, useState } from 'react';
import { toApiError, type ApiErrorInfo } from '@/services/api/apiError';
import type { Lease } from '@/features/leases/types/lease.types';
import { unitApi } from '../api/unitApi';
import type { Ownership } from '../types/unit.types';

interface Section<T> {
  data: T[];
  error: ApiErrorInfo | null;
}

interface UnitDetailState {
  loading: boolean;
  ownerships: Section<Ownership>;
  leases: Section<Lease>;
}

const EMPTY: UnitDetailState = {
  loading: false,
  ownerships: { data: [], error: null },
  leases: { data: [], error: null },
};

const toSection = <T,>(result: PromiseSettledResult<T[]>, fallback: string): Section<T> =>
  result.status === 'fulfilled'
    ? { data: result.value, error: null }
    : { data: [], error: toApiError(result.reason, fallback) };

/** Loads the owner and lease history shown in the unit drawer; each section fails independently. */
export const useUnitDetail = (unitId: number | null): UnitDetailState => {
  const [state, setState] = useState<UnitDetailState>(EMPTY);

  useEffect(() => {
    if (unitId === null) return;
    let cancelled = false;
    setState({ ...EMPTY, loading: true });

    Promise.allSettled([unitApi.getOwnerships(unitId), unitApi.getLeaseHistory(unitId)]).then(
      ([ownerships, leases]) => {
        if (cancelled) return;
        setState({
          loading: false,
          ownerships: toSection(ownerships, 'Could not load ownership records.'),
          leases: toSection(leases, 'Could not load lease history.'),
        });
      }
    );

    return () => {
      cancelled = true;
    };
  }, [unitId]);

  return state;
};
