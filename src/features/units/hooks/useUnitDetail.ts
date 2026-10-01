import { useEffect, useState } from 'react';
import { toApiError, type ApiErrorInfo } from '@/services/api/apiError';
import type { Lease } from '@/features/leases/types/lease.types';
import type { Occupancy } from '@/features/occupancies/types/occupancy.types';
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
  occupancies: Section<Occupancy>;
}

const EMPTY: UnitDetailState = {
  loading: false,
  ownerships: { data: [], error: null },
  leases: { data: [], error: null },
  occupancies: { data: [], error: null },
};

const toSection = <T,>(result: PromiseSettledResult<T[]>, fallback: string): Section<T> =>
  result.status === 'fulfilled'
    ? { data: result.value, error: null }
    : { data: [], error: toApiError(result.reason, fallback) };

/**
 * Loads the owner, lease history and current occupants shown in the unit drawer; each section
 * fails independently. Both services key the unit by the same UUID.
 */
export const useUnitDetail = (unitId: string | null): UnitDetailState => {
  const [state, setState] = useState<UnitDetailState>(EMPTY);

  useEffect(() => {
    if (unitId === null) return;
    let cancelled = false;
    setState({ ...EMPTY, loading: true });

    Promise.allSettled([
      unitApi.getOwnerships(unitId),
      unitApi.getLeaseHistory(unitId),
      unitApi.getCurrentOccupancies(unitId),
    ]).then(([ownerships, leases, occupancies]) => {
      if (cancelled) return;
      setState({
        loading: false,
        ownerships: toSection(ownerships, 'Could not load ownership records.'),
        leases: toSection(leases, 'Could not load lease history.'),
        occupancies: toSection(occupancies, 'Could not load current occupants.'),
      });
    });

    return () => {
      cancelled = true;
    };
  }, [unitId]);

  return state;
};
