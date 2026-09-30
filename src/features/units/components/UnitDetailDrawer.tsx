import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/feedback/Alert';
import { UnitStatusBadge } from './UnitStatusBadge';
import { LeaseStatusBadge } from '@/features/leases/components/LeaseStatusBadge';
import { LeaseDetailModal } from '@/features/leases/components/LeaseDetailModal';
import type { Lease } from '@/features/leases/types/lease.types';
import { useUnitDetail } from '../hooks/useUnitDetail';
import type { Unit, UnitType } from '../types/unit.types';
export interface UnitDetailDrawerProps {
  unit: Unit | null;
  unitType?: UnitType;
  canManage: boolean;
  onClose: () => void;
}
export const UnitDetailDrawer = ({
  unit,
  unitType,
  canManage,
  onClose,
}: UnitDetailDrawerProps) => {
  const [refresh, setRefresh] = useState(0);
  const [detail, setDetail] = useState<Lease | null>(null);
  const { loading, leases, occupancies, canViewLeases } = useUnitDetail(
    unit?.unitId ?? null,
    refresh
  );
  if (!unit) return null;
  return (
    <>
      <Modal isOpen onClose={onClose} title={`Unit ${unit.unitNumber}`}>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <p>
            Unit ID: {unit.unitId}
            <br />
            Ownership unit reference: {unit.ownershipUnitId}
            <br />
            Floor ID: {unit.floorId}
          </p>
          <UnitStatusBadge status={unit.status} />
          <p>Availability is updated when leases are activated or ended.</p>
          <p>
            {unitType
              ? `${unitType.typeName} · Capacity ${unitType.capacityLimit} · Rent ${unitType.baseRent}`
              : 'Unknown unit type'}
          </p>
          {canManage && (
            <>
              <h3>Physical Occupants</h3>
              {loading ? (
                <p>Loading…</p>
              ) : occupancies.error ? (
                <Alert
                  type="error"
                  message={occupancies.error.message}
                  autoDismiss={false}
                />
              ) : occupancies.data.length ? (
                occupancies.data.map((o) => (
                  <p key={o.id}>
                    {o.residentId} · Moved in {o.moveInDate}
                  </p>
                ))
              ) : (
                <p>No current physical occupants.</p>
              )}
            </>
          )}
          {canViewLeases && (
            <>
              <h3>Lease History</h3>
              {loading ? (
                <p>Loading…</p>
              ) : leases.error ? (
                <Alert
                  type="error"
                  message={leases.error.message}
                  autoDismiss={false}
                />
              ) : leases.data.length ? (
                leases.data.map((l) => (
                  <div key={l.id}>
                    <p>
                      {l.startDate} → {l.endDate}
                    </p>
                    <LeaseStatusBadge status={l.status} />
                    {canManage && (
                      <Button variant="outline" onClick={() => setDetail(l)}>
                        View Details
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <p>No leases recorded.</p>
              )}
            </>
          )}
        </div>
      </Modal>
      {detail && (
        <LeaseDetailModal
          key={detail.id}
          lease={detail}
          onClose={() => setDetail(null)}
          onChanged={() => setRefresh((n) => n + 1)}
        />
      )}
    </>
  );
};
