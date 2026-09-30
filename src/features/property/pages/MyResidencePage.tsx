import { useEffect, useState, type FormEvent } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/feedback/Alert';
import { useAppSelector } from '@/app/store/hooks';
import {
  selectAuthenticatedId,
  selectGrantedRoles,
} from '@/features/auth/store/permissions';
import { leaseApi } from '@/features/leases/api/leaseApi';
import { occupancyApi } from '@/features/occupancies/api/occupancyApi';
import type { Occupancy } from '@/features/occupancies/types/occupancy.types';
import type { Lease } from '@/features/leases/types/lease.types';
import { LeaseStatusBadge } from '@/features/leases/components/LeaseStatusBadge';
import { isUuid } from '@/features/leases/validation/leaseValidation';
import { toApiError } from '@/services/api/apiError';
import { propertyApi } from '../api/propertyApi';
import type { Ownership } from '../types/property.types';
export const MyResidencePage = () => {
  const residentId = useAppSelector(selectAuthenticatedId);
  const roles = useAppSelector(selectGrantedRoles);
  const owner = roles.includes('OWNER');
  const [occupancies, setOccupancies] = useState<Occupancy[]>([]);
  const [ownerships, setOwnerships] = useState<Ownership[]>([]);
  const [occupancyError, setOccupancyError] = useState('');
  const [ownershipError, setOwnershipError] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [lookup, setLookup] = useState('');
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setOccupancies([]);
    setOwnerships([]);
    setLeases([]);
    setOccupancyError('');
    setOwnershipError('');
    if (!isUuid(residentId)) {
      setOccupancyError('Your account does not have a valid resident ID.');
      setLoading(false);
      return;
    }
    Promise.allSettled([
      occupancyApi.forResident(residentId),
      owner
        ? propertyApi.getOwnerships({ by: 'owner', ownerId: residentId })
        : Promise.resolve([] as Ownership[]),
    ]).then(([o, w]) => {
      if (cancelled) return;
      if (o.status === 'fulfilled') setOccupancies(o.value);
      else
        setOccupancyError(
          toApiError(o.reason, 'Could not load your occupancy history.').message
        );
      if (w.status === 'fulfilled') setOwnerships(w.value);
      else
        setOwnershipError(
          toApiError(w.reason, 'Could not load ownerships.').message
        );
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [residentId, owner]);
  const search = async (e: FormEvent) => {
    e.preventDefault();
    setLookupError('');
    setLeases([]);
    if (!isUuid(lookup)) {
      setLookupError(owner ? 'Enter a unit UUID.' : 'Enter a lease UUID.');
      return;
    }
    setSearching(true);
    try {
      setLeases(
        owner
          ? await leaseApi.forUnit(lookup.trim())
          : [await leaseApi.get(lookup.trim())]
      );
    } catch (err) {
      setLookupError(toApiError(err, 'Could not load lease.').message);
    } finally {
      setSearching(false);
    }
  };
  return (
    <PageContainer
      title="My Residence"
      subtitle="Your physical occupancy history and lease agreements."
    >
      <div style={{ display: 'grid', gap: '1rem' }}>
        <Card title="My Occupancy History">
          {loading ? (
            <p>Loading…</p>
          ) : occupancyError ? (
            <Alert type="error" message={occupancyError} autoDismiss={false} />
          ) : occupancies.length ? (
            occupancies.map((o) => (
              <div key={o.id}>
                <p>
                  Unit {o.unitId} · {o.status}
                  <br />
                  Move-in {o.moveInDate} · Move-out{' '}
                  {o.moveOutDate ?? 'Not recorded'}
                </p>
                <Button
                  variant="outline"
                  disabled={searching}
                  onClick={async () => {
                    setLookupError('');
                    setLeases([]);
                    setSearching(true);
                    try {
                      setLeases([await leaseApi.get(o.leaseId)]);
                    } catch (err) {
                      setLookupError(
                        toApiError(err, 'Could not load lease.').message
                      );
                    } finally {
                      setSearching(false);
                    }
                  }}
                >
                  View Lease
                </Button>
              </div>
            ))
          ) : (
            <p>No occupancy records registered to your account.</p>
          )}
        </Card>
        <Card title={owner ? 'Owned Unit Lease History' : 'Find My Lease'}>
          <form onSubmit={search} style={{ display: 'grid', gap: '1rem' }}>
            <Input
              label={owner ? 'Unit UUID' : 'Lease UUID'}
              required
              value={lookup}
              onChange={(e) => setLookup(e.target.value)}
            />
            <Button type="submit" isLoading={searching}>
              View Lease
            </Button>
          </form>
          {lookupError && (
            <Alert type="error" message={lookupError} autoDismiss={false} />
          )}
          {leases.map((l) => (
            <div key={l.id}>
              <p>
                Lease {l.id}
                <br />
                Unit {l.unitId}
                <br />
                Tenant {l.tenantId}
                <br />
                {l.startDate} → {l.endDate}
              </p>
              <LeaseStatusBadge status={l.status} />
            </div>
          ))}
        </Card>
        {owner && (
          <Card title="My Owned Units">
            {loading ? (
              <p>Loading…</p>
            ) : ownershipError ? (
              <Alert
                type="error"
                message={ownershipError}
                autoDismiss={false}
              />
            ) : ownerships.length ? (
              ownerships.map((o) => (
                <p key={o.id}>
                  Ownership unit reference #{o.unitId} · {o.sharePercentage}% ·{' '}
                  {o.startDate} to {o.endDate ?? 'Present'}
                </p>
              ))
            ) : (
              <p>No ownership records.</p>
            )}
          </Card>
        )}
      </div>
    </PageContainer>
  );
};
