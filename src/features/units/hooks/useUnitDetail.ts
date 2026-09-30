import { useEffect, useState } from 'react';
import { useAppSelector } from '@/app/store/hooks';
import { selectGrantedRoles } from '@/features/auth/store/permissions';
import { toApiError, type ApiErrorInfo } from '@/services/api/apiError';
import type { Lease } from '@/features/leases/types/lease.types';
import type { Occupancy } from '@/features/occupancies/types/occupancy.types';
import { occupancyApi } from '@/features/occupancies/api/occupancyApi';
import { unitApi } from '../api/unitApi';
interface Section<T> {
  data: T[];
  error: ApiErrorInfo | null;
}
interface Detail {
  loading: boolean;
  leases: Section<Lease>;
  occupancies: Section<Occupancy>;
  canViewLeases: boolean;
}
const section = <T>(result: PromiseSettledResult<T[]>): Section<T> =>
  result.status === 'fulfilled'
    ? { data: result.value, error: null }
    : { data: [], error: toApiError(result.reason, 'Could not load records.') };
export const useUnitDetail = (unitId: string | null, refresh = 0): Detail => {
  const roles = useAppSelector(selectGrantedRoles);
  const manager = roles.includes('MANAGER');
  const canViewLeases = manager || roles.includes('OWNER');
  const [state, setState] = useState<Detail>({
    loading: false,
    leases: { data: [], error: null },
    occupancies: { data: [], error: null },
    canViewLeases,
  });
  useEffect(() => {
    let cancelled = false;
    setState({
      loading: !!unitId,
      leases: { data: [], error: null },
      occupancies: { data: [], error: null },
      canViewLeases,
    });
    if (!unitId) return;
    Promise.allSettled([
      canViewLeases
        ? unitApi.getLeaseHistory(unitId)
        : Promise.resolve([] as Lease[]),
      manager
        ? occupancyApi.forUnit(unitId)
        : Promise.resolve([] as Occupancy[]),
    ]).then(([leases, occupancies]) => {
      if (!cancelled)
        setState({
          loading: false,
          leases: section(leases),
          occupancies: section(occupancies),
          canViewLeases,
        });
    });
    return () => {
      cancelled = true;
    };
  }, [unitId, manager, canViewLeases, refresh]);
  return state;
};
