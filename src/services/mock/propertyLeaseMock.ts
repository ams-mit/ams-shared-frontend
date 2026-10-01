import type {
  CreateLeaseRequest,
  Lease,
  LeaseHistory,
  LeaseHistoryItem,
  LeaseListFilters,
  LeaseStatus,
  PaginationMeta,
  UpdateLeaseStatusRequest,
} from '@/features/leases/types/lease.types';
import { LEASE_TRANSITIONS } from '@/features/leases/types/lease.types';
import type {
  CreateOccupancyRequest,
  Occupancy,
  UnitOccupancyFilters,
  UpdateOccupancyStatusRequest,
} from '@/features/occupancies/types/occupancy.types';
import { OCCUPANCY_TRANSITIONS } from '@/features/occupancies/types/occupancy.types';
import type {
  CreateBuildingRequest,
  CreateOwnershipRequest,
  CreateUnitTypeRequest,
  OwnershipLookup,
} from '@/features/property/types/property.types';
import type { Building, CreateUnitRequest, Floor, Ownership, Unit, UnitType } from '@/features/units/types/unit.types';
import { createCollection, fail, isManager, mockActor, nowIso, paginate, respond, today, uuid } from './mockDb';
import { findOwnerByProfileId, findResidentByProfileId, profileIdFor, stableUuid, toProfileId } from './people';

// Demo-mode stand-in for property-unit-service and lease-occupancy-service, following the same
// rules: unique building codes / unit-type codes / unit numbers, lease status transitions,
// no overlapping ACTIVE leases on a unit, unit-type capacity, ownership shares up to 100%.

// ---- Seed data -------------------------------------------------------------------------

const dayOffset = (days: number): string => new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
const SEEDED_AT = '2025-01-06T09:00:00Z';

const unitIdFor = (label: string) => stableUuid(`unit:${label}`);

const BUILDING_SEED = [
  { code: 'A', name: 'Tower A', address: '12 Lake Drive, Colombo 03', floors: 10 },
  { code: 'B', name: 'Tower B', address: '14 Lake Drive, Colombo 03', floors: 8 },
];

const UNIT_TYPE_SEED = [
  { code: 'STUDIO', name: 'Studio', capacity: 1, description: 'Open-plan studio with kitchenette.' },
  { code: '1BR', name: 'One Bedroom', capacity: 2, description: 'One bedroom, living area and balcony.' },
  { code: '2BR', name: 'Two Bedroom', capacity: 4, description: 'Two bedrooms, two bathrooms.' },
  { code: '3BR', name: 'Three Bedroom', capacity: 6, description: 'Three bedrooms with a family lounge.' },
];

// [label, unit type code, status]
const UNIT_SEED: [string, string, Unit['status']][] = [
  ['A-101', '2BR', 'AVAILABLE'],
  ['A-102', '1BR', 'AVAILABLE'],
  ['A-108', '1BR', 'OCCUPIED'],
  ['A-201', 'STUDIO', 'AVAILABLE'],
  ['A-305', '2BR', 'RESERVED'],
  ['A-402', '2BR', 'OCCUPIED'],
  ['A-610', '3BR', 'AVAILABLE'],
  ['A-904', '3BR', 'OCCUPIED'],
  ['B-101', 'STUDIO', 'AVAILABLE'],
  ['B-205', '2BR', 'OCCUPIED'],
  ['B-310', '1BR', 'AVAILABLE'],
  ['B-512', '3BR', 'AVAILABLE'],
  ['B-702', '1BR', 'UNDER_MAINTENANCE'],
  ['B-801', '2BR', 'AVAILABLE'],
];

const floorIdFor = (code: string, floor: number) => stableUuid(`floor:${code}:${floor}`);
const floorOf = (unitNumber: string) => Math.max(1, Math.floor(Number(unitNumber) / 100));

const buildings = createCollection<Building>('buildings', () =>
  BUILDING_SEED.map((b) => ({
    id: stableUuid(`building:${b.code}`),
    buildingCode: b.code,
    name: b.name,
    address: b.address,
    description: `${b.floors}-storey residential tower`,
    status: 'ACTIVE',
    floors: Array.from({ length: b.floors }, (_, i) => ({
      id: floorIdFor(b.code, i + 1),
      buildingId: stableUuid(`building:${b.code}`),
      floorNumber: i + 1,
      name: `Level ${i + 1}`,
      description: null,
      status: 'ACTIVE' as const,
    })),
    createdAt: SEEDED_AT,
    updatedAt: SEEDED_AT,
  }))
);

const unitTypes = createCollection<UnitType>('unit_types', () =>
  UNIT_TYPE_SEED.map((t) => ({
    id: stableUuid(`unit-type:${t.code}`),
    code: t.code,
    name: t.name,
    description: t.description,
    capacity: t.capacity,
    status: 'ACTIVE',
    createdAt: SEEDED_AT,
    updatedAt: SEEDED_AT,
  }))
);

const units = createCollection<Unit>('units', () =>
  UNIT_SEED.map(([label, typeCode, status]) => {
    const [code, number] = label.split('-');
    return {
      id: unitIdFor(label),
      unitNumber: number,
      buildingId: stableUuid(`building:${code}`),
      floorId: floorIdFor(code, floorOf(number)),
      unitTypeId: stableUuid(`unit-type:${typeCode}`),
      status,
      availability: status === 'AVAILABLE',
      createdAt: SEEDED_AT,
      updatedAt: SEEDED_AT,
    };
  })
);

// [unit label, owner user id, share %]
const OWNERSHIP_SEED: [string, string, number][] = [
  ['B-205', 'resident-002', 100],
  ['B-512', 'resident-004', 100],
  ['B-801', 'resident-006', 100],
  ['A-904', 'resident-006', 100],
  ['A-402', 'resident-006', 60],
  ['A-402', 'resident-004', 40],
  ['A-108', 'resident-002', 100],
];

const ownerships = createCollection<Ownership>('ownerships', () =>
  OWNERSHIP_SEED.map(([label, owner, share]) => ({
    id: stableUuid(`ownership:${label}:${owner}`),
    unitId: unitIdFor(label),
    ownerId: profileIdFor(owner),
    ownershipPercentage: share,
    startDate: '2024-01-01',
    endDate: null,
    status: 'ACTIVE',
    createdAt: SEEDED_AT,
    updatedAt: SEEDED_AT,
  }))
);

// [key, unit label, occupant user ids, start offset days, end offset days, status]
const LEASE_SEED: [string, string, string[], number, number, LeaseStatus][] = [
  ['sarah', 'A-402', ['resident-001'], -240, 125, 'ACTIVE'],
  ['priya', 'A-108', ['resident-003'], -150, 215, 'ACTIVE'],
  ['elena', 'A-904', ['resident-005'], -60, 305, 'ACTIVE'],
  ['michael', 'B-205', ['resident-002'], -400, 330, 'ACTIVE'],
  ['ravi', 'A-101', ['usr-105'], 20, 385, 'DRAFT'],
  ['david', 'A-610', ['resident-004'], 10, 375, 'PENDING'],
  ['priya-old', 'B-310', ['resident-003'], -560, -160, 'EXPIRED'],
];

const leaseIdFor = (key: string) => stableUuid(`lease:${key}`);

const leases = createCollection<Lease>('leases', () =>
  LEASE_SEED.map(([key, label, occupants, start, end, status]) => ({
    id: leaseIdFor(key),
    unitId: unitIdFor(label),
    startDate: dayOffset(start),
    endDate: dayOffset(end),
    status,
    notes: status === 'DRAFT' ? 'Awaiting signed agreement.' : null,
    occupants: occupants.map(profileIdFor),
    createdAt: `${dayOffset(start - 14)}T10:00:00Z`,
    updatedAt: `${dayOffset(Math.min(start, 0))}T10:00:00Z`,
  }))
);

interface HistoryRow {
  id: string;
  leaseId: string;
  item: LeaseHistoryItem;
}

const STATUS_PATH: Record<LeaseStatus, LeaseStatus[]> = {
  DRAFT: ['DRAFT'],
  PENDING: ['DRAFT', 'PENDING'],
  ACTIVE: ['DRAFT', 'ACTIVE'],
  EXPIRED: ['DRAFT', 'ACTIVE', 'EXPIRED'],
  TERMINATED: ['DRAFT', 'ACTIVE', 'TERMINATED'],
  CANCELLED: ['DRAFT', 'CANCELLED'],
};

const leaseHistory = createCollection<HistoryRow>('lease_history', () =>
  LEASE_SEED.flatMap(([key, , , start, end, status]) =>
    STATUS_PATH[status].map((s, i) => ({
      id: `${key}-${i}`,
      leaseId: leaseIdFor(key),
      item: {
        status: s,
        changedAt: `${dayOffset(s === 'EXPIRED' ? end : s === 'DRAFT' ? start - 14 : Math.min(start, 0))}T10:${10 + i}:00Z`,
        changedBy: 'Eleanor Sterling',
        reason: s === 'DRAFT' ? 'Lease drafted' : s === 'EXPIRED' ? 'Lease term ended' : null,
      },
    }))
  )
);

const occupancies = createCollection<Occupancy>('occupancies', () =>
  LEASE_SEED.filter(([, , , , , status]) => status === 'ACTIVE' || status === 'EXPIRED').flatMap(
    ([key, label, occupants, start, end, status]) =>
      occupants.map((userId) => ({
        id: stableUuid(`occupancy:${key}:${userId}`),
        unitId: unitIdFor(label),
        residentId: profileIdFor(userId),
        leaseId: leaseIdFor(key),
        status: status === 'ACTIVE' ? ('ACTIVE' as const) : ('ENDED' as const),
        startDate: dayOffset(start),
        endDate: status === 'ACTIVE' ? null : dayOffset(end),
        notes: null,
        createdAt: `${dayOffset(start)}T12:00:00Z`,
        updatedAt: `${dayOffset(status === 'ACTIVE' ? start : end)}T12:00:00Z`,
      }))
  )
);

// ---- Helpers ---------------------------------------------------------------------------

const toPagination = (p: ReturnType<typeof paginate>['pagination']): PaginationMeta => p;

const requireUnit = (unitId: string) => units.require(unitId, 'UNIT_NOT_FOUND', 'This unit could not be found.');

/** "A-402" style reference for a unit (building code + unit number). */
export const unitLabel = (unit: Unit): string => {
  const building = buildings.find(unit.buildingId);
  return `${building?.buildingCode ?? '?'}-${unit.unitNumber}`;
};

/** Finds a unit by its id or by its "A-402" style reference. */
export const findUnitByReference = (reference: string): Unit | undefined => {
  const ref = reference.trim().toUpperCase().replace(/\s+/g, '');
  return units.all().find((u) => u.id === reference.trim() || unitLabel(u).toUpperCase() === ref);
};

/** Profile id of the primary tenant on the unit's ACTIVE lease, if any. */
export const activeTenantProfileId = (unitId: string): string | undefined =>
  leases.all().find((l) => l.unitId === unitId && l.status === 'ACTIVE')?.occupants[0];

const addHistory = (leaseId: string, status: LeaseStatus, reason: string | null) =>
  leaseHistory.insert({
    id: uuid(),
    leaseId,
    item: { status, changedAt: nowIso(), changedBy: mockActor().name, reason },
  });

const overlaps = (aStart: string, aEnd: string, bStart: string, bEnd: string) => aStart <= bEnd && bStart <= aEnd;

const assertDates = (startDate: string, endDate: string) => {
  if (!startDate || !endDate) fail(400, 'VALIDATION_ERROR', 'Start and end dates are required.');
  if (endDate <= startDate) {
    fail(400, 'VALIDATION_ERROR', 'The end date must be after the start date.', { endDate: 'Must be after the start date.' });
  }
};

const setUnitStatus = (unitId: string, status: Unit['status']) => {
  const unit = units.find(unitId);
  if (unit && unit.status !== 'UNDER_MAINTENANCE' && unit.status !== 'INACTIVE') {
    units.update(unitId, { status, availability: status === 'AVAILABLE', updatedAt: nowIso() });
  }
};

const visibleLeases = (): Lease[] => {
  const all = leases.all();
  if (isManager()) return all;
  const me = profileIdFor(mockActor().id);
  const myUnits = new Set(ownerships.all().filter((o) => o.ownerId === me).map((o) => o.unitId));
  return all.filter((l) => l.occupants.includes(me) || myUnits.has(l.unitId));
};

const byNewest = <T extends { createdAt: string }>(a: T, b: T) => b.createdAt.localeCompare(a.createdAt);

// ---- property-unit-service ---------------------------------------------------------------

export const mockPropertyApi = {
  createBuilding: (payload: CreateBuildingRequest): Promise<Building> =>
    respond(() => {
      const code = payload.buildingCode.trim().toUpperCase();
      if (buildings.all().some((b) => b.buildingCode.toUpperCase() === code)) {
        fail(409, 'BUILDING_ALREADY_EXISTS', `A building with code ${code} already exists.`, { buildingCode: 'Already in use.' });
      }
      const id = uuid();
      const floors: Floor[] = payload.floors.map((f) => ({
        id: uuid(),
        buildingId: id,
        floorNumber: f.floorNumber,
        name: f.name ?? `Level ${f.floorNumber}`,
        description: f.description ?? null,
        status: 'ACTIVE',
      }));
      return buildings.insert({
        id,
        buildingCode: code,
        name: payload.name.trim(),
        address: payload.address.trim(),
        description: payload.description ?? null,
        status: 'ACTIVE',
        floors,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      });
    }),

  createUnitType: (payload: CreateUnitTypeRequest): Promise<UnitType> =>
    respond(() => {
      const code = payload.code.trim().toUpperCase();
      if (unitTypes.all().some((t) => t.code.toUpperCase() === code)) {
        fail(409, 'UNIT_TYPE_ALREADY_EXISTS', `A unit type with code ${code} already exists.`, { code: 'Already in use.' });
      }
      return unitTypes.insert({
        id: uuid(),
        code,
        name: payload.name.trim(),
        description: payload.description ?? null,
        capacity: payload.capacity,
        status: 'ACTIVE',
        createdAt: nowIso(),
        updatedAt: nowIso(),
      });
    }),

  getOwnerships: (lookup: OwnershipLookup): Promise<Ownership[]> =>
    respond(() => {
      const all = ownerships.all();
      if (lookup.by === 'unit') return all.filter((o) => o.unitId === lookup.unitId);
      const ownerId = toProfileId(lookup.ownerId);
      return all.filter((o) => o.ownerId === ownerId);
    }),

  createOwnership: (payload: CreateOwnershipRequest): Promise<Ownership> =>
    respond(() => {
      requireUnit(payload.unitId);
      const owner = findOwnerByProfileId(payload.ownerId.trim());
      if (!owner) {
        fail(404, 'OWNER_NOT_FOUND', 'No owner profile has this ID.', { ownerId: 'No owner profile has this ID.' });
      }
      const ownerId = profileIdFor(owner!.id);
      const share = Number(payload.ownershipPercentage);
      if (!(share > 0 && share <= 100)) {
        fail(400, 'VALIDATION_ERROR', 'The share must be between 0 and 100%.', { ownershipPercentage: 'Must be between 0 and 100.' });
      }
      const active = ownerships.all().filter((o) => o.unitId === payload.unitId && o.status === 'ACTIVE');
      if (active.some((o) => o.ownerId === ownerId)) {
        fail(409, 'BUSINESS_RULE_VIOLATION', 'This owner already holds a share of this unit.');
      }
      const total = active.reduce((sum, o) => sum + o.ownershipPercentage, 0);
      if (total + share > 100) {
        fail(409, 'BUSINESS_RULE_VIOLATION', `Shares would total ${total + share}%. Only ${100 - total}% of this unit is unassigned.`, {
          ownershipPercentage: `At most ${100 - total}% is available.`,
        });
      }
      return ownerships.insert({
        id: uuid(),
        unitId: payload.unitId,
        ownerId,
        ownershipPercentage: share,
        startDate: payload.startDate,
        endDate: payload.endDate ?? null,
        status: 'ACTIVE',
        createdAt: nowIso(),
        updatedAt: nowIso(),
      });
    }),
};

export const mockUnitApi = {
  getBuildings: (): Promise<Building[]> => respond(() => buildings.all().sort((a, b) => a.buildingCode.localeCompare(b.buildingCode))),

  getUnitTypes: (): Promise<UnitType[]> => respond(() => unitTypes.all().sort((a, b) => a.capacity - b.capacity)),

  getUnits: (): Promise<Unit[]> => respond(() => units.all().sort((a, b) => unitLabel(a).localeCompare(unitLabel(b)))),

  createUnit: (payload: CreateUnitRequest): Promise<Unit> =>
    respond(() => {
      const building = buildings.require(payload.buildingId, 'BUILDING_NOT_FOUND', 'This building could not be found.');
      if (!building.floors.some((f) => f.id === payload.floorId)) {
        fail(400, 'VALIDATION_ERROR', 'The floor does not belong to this building.', { floorId: 'Choose a floor of this building.' });
      }
      unitTypes.require(payload.unitTypeId, 'UNIT_TYPE_NOT_FOUND', 'This unit type could not be found.');
      const number = payload.unitNumber.trim();
      if (units.all().some((u) => u.buildingId === building.id && u.unitNumber.toUpperCase() === number.toUpperCase())) {
        fail(409, 'UNIT_ALREADY_EXISTS', `Unit ${number} already exists in ${building.name}.`, { unitNumber: 'Already in use in this building.' });
      }
      return units.insert({
        id: uuid(),
        unitNumber: number,
        buildingId: building.id,
        floorId: payload.floorId,
        unitTypeId: payload.unitTypeId,
        status: 'AVAILABLE',
        availability: true,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      });
    }),

  getOwnerships: (unitId: string): Promise<Ownership[]> => mockPropertyApi.getOwnerships({ by: 'unit', unitId }),

  getLeaseHistory: (unitId: string): Promise<Lease[]> => mockLeaseApi.forUnit(unitId),

  getCurrentOccupancies: (unitId: string): Promise<Occupancy[]> =>
    mockOccupancyApi.forUnit(unitId, { status: 'ACTIVE', size: 100 }),
};

// ---- lease-occupancy-service ---------------------------------------------------------------

export const mockLeaseApi = {
  list: (filters: LeaseListFilters = {}): Promise<{ leases: Lease[]; pagination: PaginationMeta | null }> =>
    respond(() => {
      const residentId = filters.residentId ? toProfileId(filters.residentId) : undefined;
      const rows = visibleLeases()
        .filter(
          (l) =>
            (!filters.unitId || l.unitId === filters.unitId) &&
            (!residentId || l.occupants.includes(residentId)) &&
            (!filters.status || l.status === filters.status) &&
            (!filters.startDate || l.endDate >= filters.startDate) &&
            (!filters.endDate || l.startDate <= filters.endDate)
        )
        .sort(byNewest);
      const { items, pagination } = paginate(rows, filters.page ?? 0, filters.size ?? 20);
      return { leases: items, pagination: toPagination(pagination) };
    }),

  listAll: async (filters: Omit<LeaseListFilters, 'page' | 'size'> = {}): Promise<Lease[]> =>
    (await mockLeaseApi.list({ ...filters, page: 0, size: 10_000 })).leases,

  get: (leaseId: string): Promise<Lease> =>
    respond(() => leases.require(leaseId, 'LEASE_NOT_FOUND', 'This lease could not be found.')),

  history: (leaseId: string): Promise<LeaseHistory> =>
    respond(() => {
      leases.require(leaseId, 'LEASE_NOT_FOUND', 'This lease could not be found.');
      const history = leaseHistory
        .all()
        .filter((h) => h.leaseId === leaseId)
        .map((h) => h.item)
        .sort((a, b) => a.changedAt.localeCompare(b.changedAt));
      return { leaseId, history };
    }),

  forUnit: (unitId: string): Promise<Lease[]> =>
    respond(() => leases.all().filter((l) => l.unitId === unitId).sort(byNewest)),

  create: (payload: CreateLeaseRequest): Promise<Lease> =>
    respond(() => {
      const unit = requireUnit(payload.unitId);
      if (unit.status === 'UNDER_MAINTENANCE') {
        fail(409, 'UNDER_MAINTENANCE', 'This unit is under maintenance and cannot be leased right now.');
      }
      assertDates(payload.startDate, payload.endDate);
      if (payload.occupants.length === 0) fail(400, 'VALIDATION_ERROR', 'Add at least one resident.');
      payload.occupants.forEach((o, i) => {
        if (!findResidentByProfileId(o.residentId)) {
          fail(404, 'RESIDENT_NOT_FOUND', `No resident profile has the ID ${o.residentId}.`, {
            [`occupants[${i}].residentId`]: 'No resident profile has this ID.',
          });
        }
      });
      const capacity = unitTypes.find(unit.unitTypeId)?.capacity ?? 1;
      if (payload.occupants.length > capacity) {
        fail(409, 'BUSINESS_RULE_VIOLATION', `This unit type allows at most ${capacity} resident(s).`);
      }
      const lease = leases.insert({
        id: uuid(),
        unitId: payload.unitId,
        startDate: payload.startDate,
        endDate: payload.endDate,
        status: 'DRAFT',
        notes: payload.notes?.trim() || null,
        occupants: payload.occupants.map((o) => profileIdFor(findResidentByProfileId(o.residentId)!.id)),
        createdAt: nowIso(),
        updatedAt: nowIso(),
      });
      addHistory(lease.id, 'DRAFT', 'Lease drafted');
      return lease;
    }),

  updateStatus: (leaseId: string, payload: UpdateLeaseStatusRequest): Promise<Lease> =>
    respond(() => {
      const lease = leases.require(leaseId, 'LEASE_NOT_FOUND', 'This lease could not be found.');
      if (!LEASE_TRANSITIONS[lease.status].includes(payload.status)) {
        fail(409, 'LEASE_STATUS_TRANSITION_NOT_ALLOWED', `A ${lease.status.toLowerCase()} lease cannot become ${payload.status.toLowerCase()}.`);
      }
      if (payload.status === 'ACTIVE') {
        const now = today();
        if (now < lease.startDate || now > lease.endDate) {
          fail(409, 'BUSINESS_RULE_VIOLATION', 'A lease can only be activated during its lease period.');
        }
        const conflict = leases
          .all()
          .find((l) => l.id !== lease.id && l.unitId === lease.unitId && l.status === 'ACTIVE' && overlaps(l.startDate, l.endDate, lease.startDate, lease.endDate));
        if (conflict) fail(409, 'LEASE_DATE_CONFLICT', 'These dates overlap an active lease on this unit.');
      }
      const updated = leases.update(leaseId, { status: payload.status, updatedAt: nowIso() });
      addHistory(leaseId, payload.status, payload.reason?.trim() || null);

      if (payload.status === 'ACTIVE') setUnitStatus(lease.unitId, 'OCCUPIED');
      if (payload.status === 'TERMINATED' || payload.status === 'EXPIRED') {
        // Ending the lease moves everyone out.
        occupancies
          .all()
          .filter((o) => o.leaseId === leaseId && o.status === 'ACTIVE')
          .forEach((o) => occupancies.update(o.id, { status: 'ENDED', endDate: today(), updatedAt: nowIso() }));
        setUnitStatus(lease.unitId, 'AVAILABLE');
      }
      return updated;
    }),
};

export const mockOccupancyApi = {
  register: (payload: CreateOccupancyRequest): Promise<Occupancy> =>
    respond(() => {
      const lease = leases.require(payload.leaseId, 'LEASE_NOT_FOUND', 'This lease could not be found.');
      if (lease.status !== 'ACTIVE') fail(409, 'LEASE_NOT_ACTIVE', 'Residents can only move in under an active lease.');
      if (lease.unitId !== payload.unitId) fail(400, 'VALIDATION_ERROR', 'The lease is for a different unit.');
      const residentId = toProfileId(payload.residentId);
      if (!lease.occupants.includes(residentId)) {
        fail(409, 'BUSINESS_RULE_VIOLATION', 'This resident is not listed on the lease.');
      }
      if (occupancies.all().some((o) => o.residentId === residentId && o.status === 'ACTIVE')) {
        fail(409, 'OCCUPANCY_CONFLICT', 'This resident already has an active move-in.');
      }
      if (payload.startDate < lease.startDate || payload.startDate > lease.endDate) {
        fail(400, 'VALIDATION_ERROR', 'The move-in date must be within the lease period.', { startDate: 'Must be within the lease period.' });
      }
      setUnitStatus(lease.unitId, 'OCCUPIED');
      return occupancies.insert({
        id: uuid(),
        unitId: payload.unitId,
        residentId,
        leaseId: payload.leaseId,
        status: 'ACTIVE',
        startDate: payload.startDate,
        endDate: null,
        notes: payload.notes?.trim() || null,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      });
    }),

  forUnit: (unitId: string, filters: UnitOccupancyFilters = {}): Promise<Occupancy[]> =>
    respond(() =>
      occupancies
        .all()
        .filter(
          (o) =>
            o.unitId === unitId &&
            (filters.status ? o.status === filters.status : filters.includeHistory || o.status === 'ACTIVE')
        )
        .sort((a, b) => a.startDate.localeCompare(b.startDate))
    ),

  forResident: (residentId: string): Promise<Occupancy[]> =>
    respond(() => {
      const id = toProfileId(residentId);
      return occupancies.all().filter((o) => o.residentId === id);
    }),

  updateStatus: (occupancyId: string, payload: UpdateOccupancyStatusRequest): Promise<Occupancy> =>
    respond(() => {
      const occupancy = occupancies.require(occupancyId, 'OCCUPANCY_NOT_FOUND', 'This occupancy could not be found.');
      if (!OCCUPANCY_TRANSITIONS[occupancy.status].includes(payload.status)) {
        fail(409, 'OCCUPANCY_STATUS_TRANSITION_NOT_ALLOWED', `An ${occupancy.status.toLowerCase()} occupancy cannot become ${payload.status.toLowerCase()}.`);
      }
      if (payload.status === 'ENDED' && payload.effectiveDate < occupancy.startDate) {
        fail(400, 'VALIDATION_ERROR', 'The move-out date cannot be before the move-in date.', { effectiveDate: 'Must be on or after the move-in date.' });
      }
      const updated = occupancies.update(occupancyId, {
        status: payload.status,
        endDate: payload.status === 'ENDED' ? payload.effectiveDate : occupancy.endDate,
        notes: payload.reason?.trim() || occupancy.notes,
        updatedAt: nowIso(),
      });
      const stillLiving = occupancies.all().some((o) => o.unitId === occupancy.unitId && o.status === 'ACTIVE');
      if (!stillLiving && payload.status === 'ENDED') setUnitStatus(occupancy.unitId, 'AVAILABLE');
      return updated;
    }),
};
