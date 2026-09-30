import { useCallback, useEffect, useState } from 'react';

import { useSearchParams } from 'react-router-dom';

import { PageContainer } from '@/components/layout/PageContainer';

import { Button } from '@/components/ui/Button';

import { EmptyState } from '@/components/ui/EmptyState';

import { ErrorMessage } from '@/components/feedback/ErrorMessage';

import { LoadingState } from '@/components/feedback/LoadingState';

import { useAppDispatch, useAppSelector } from '@/app/store/hooks';

import { selectGrantedRoles } from '@/features/auth/store/permissions';

import { fetchBuildings, fetchInventory, setStatusFilter } from '../store/unitSlice';

import { UnitGrid } from '../components/UnitGrid';

import { UnitStatusSummary } from '../components/UnitStatusSummary';

import { UnitDetailDrawer } from '../components/UnitDetailDrawer';

import { AddUnitModal } from '../components/AddUnitModal';

import { UnitTypesPanel } from '@/features/property';

export const UnitsPage = () => {
  const dispatch = useAppDispatch();

  const roles = useAppSelector(selectGrantedRoles);

  const canManage = roles.some((r) =>
    ['ADMIN', 'PROPERTY_MANAGER', 'MANAGER'].includes(r)
  );

  const { buildings, buildingsLoading, buildingsError, unitTypes, units, loading, error, statusFilter } = useAppSelector(
    (s) => s.units
  );

  const [params, setParams] = useSearchParams();

  const typesTab = params.get('tab') === 'types';

  const [adding, setAdding] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(() => {
    dispatch(fetchInventory());
  }, [dispatch]);

  useEffect(load, [load]);

  useEffect(() => {
    if (canManage) dispatch(fetchBuildings());
  }, [canManage, dispatch]);

  const selected = units.find((u) => u.unitId === selectedId) ?? null;

  const visible = units.filter(
    (u) => !statusFilter || u.status === statusFilter
  );

  return (
    <PageContainer
      title={typesTab ? 'Unit Types' : 'Unit Inventory'}
      subtitle="Units grouped by their floor reference."
      actions={
        canManage &&
        !typesTab && (
          <Button onClick={() => setAdding(true)} disabled={!unitTypes.length || buildingsLoading || !!buildingsError || !buildings.some((b) => b.floors.some((f) => f.id != null))}>
            Add Unit
          </Button>
        )
      }
    >
      <div style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <Button
            variant={!typesTab ? 'primary' : 'ghost'}
            onClick={() => setParams({})}
          >
            Unit Inventory
          </Button>
          <Button
            variant={typesTab ? 'primary' : 'ghost'}
            onClick={() => setParams({ tab: 'types' })}
          >
            Unit Types
          </Button>
        </div>

        {typesTab ? (
          <UnitTypesPanel canManage={canManage} />
        ) : (
          <>
            {canManage && buildingsError && (
              <ErrorMessage
                message={`Could not load floor choices: ${buildingsError.message}`}
                onRetry={() => dispatch(fetchBuildings())}
              />
            )}
            <UnitStatusSummary
              units={units}
              activeStatus={statusFilter}
              onSelect={(status) => dispatch(setStatusFilter(status))}
            />

            {loading ? (
              <LoadingState message="Loading units…" />
            ) : error ? (
              <ErrorMessage message={error.message} onRetry={load} />
            ) : visible.length ? (
              <UnitGrid
                units={visible}
                unitTypes={unitTypes}
                onSelectUnit={(u) => setSelectedId(u.unitId)}
              />
            ) : (
              <EmptyState
                title="No units match this view"
                description="Add a unit or choose another status filter."
              />
            )}
          </>
        )}
      </div>

      <UnitDetailDrawer
        key={selected?.unitId ?? 'none'}
        unit={selected}
        unitType={unitTypes.find((t) => t.id === selected?.unitTypeId)}
        canManage={roles.includes('MANAGER')}
        onClose={() => setSelectedId(null)}
      />

      {canManage && (
        <AddUnitModal
          isOpen={adding}
          onClose={() => setAdding(false)}
          unitTypes={unitTypes}
          buildings={buildings}
          existingUnits={units}
        />
      )}
    </PageContainer>
  );
};
