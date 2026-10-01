import { withFallbackApi } from '@/services/mock/mockMode';
import { mockUnitApi } from '@/services/mock/propertyLeaseMock';
import { fetchAllPages, propertyClient } from '@/features/property/api/propertyClient';
import { unwrap } from '@/features/leases/api/leaseApi';
import type { ApiEnvelope, Lease } from '@/features/leases/types/lease.types';
import { leaseApi } from '@/features/leases/api/leaseApi';
import { occupancyApi } from '@/features/occupancies/api/occupancyApi';
import type { Occupancy } from '@/features/occupancies/types/occupancy.types';
import type { Building, CreateUnitRequest, Ownership, Unit, UnitType } from '../types/unit.types';

const realUnitApi = {
  // PROP-002
  getBuildings: (): Promise<Building[]> => fetchAllPages<Building>('/buildings'),

  // PROP-004
  getUnitTypes: (): Promise<UnitType[]> => fetchAllPages<UnitType>('/unit-types'),

  // PROP-006
  getUnits: (): Promise<Unit[]> => fetchAllPages<Unit>('/units'),

  // PROP-005
  createUnit: async (payload: CreateUnitRequest): Promise<Unit> => {
    const response = await propertyClient.post<ApiEnvelope<Unit>>('/units', payload);
    return unwrap(response.data);
  },

  // PROP-008
  getOwnerships: (unitId: string): Promise<Ownership[]> => fetchAllPages<Ownership>('/ownerships', { unitId }),

  // lease-occupancy-service LEASE-005, newest first.
  getLeaseHistory: (unitId: string): Promise<Lease[]> => leaseApi.forUnit(unitId),

  // lease-occupancy-service LEASE-009, residents currently living in the unit.
  getCurrentOccupancies: (unitId: string): Promise<Occupancy[]> =>
    occupancyApi.forUnit(unitId, { status: 'ACTIVE', size: 100 }),
};

/** Real service first; the local data (services/mock) when the service is unavailable. */
export const unitApi: typeof realUnitApi = withFallbackApi(realUnitApi, mockUnitApi);
