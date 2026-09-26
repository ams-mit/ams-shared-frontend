import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building2, Plus } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Alert } from '@/components/feedback/Alert';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchInventory, setBuildingFilter, setStatusFilter } from '../store/unitSlice';
import { UnitGrid } from '../components/UnitGrid';
import { UnitStatusSummary } from '../components/UnitStatusSummary';
import { UnitDetailDrawer } from '../components/UnitDetailDrawer';
import { AddUnitModal } from '../components/AddUnitModal';
import { UnitTypesPanel } from '@/features/property';

type Tab = 'inventory' | 'types';

export const UnitsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeRole } = useAppSelector((state) => state.auth);
  const { buildings, unitTypes, units, unitsApiAvailable, loading, error, statusFilter, buildingFilter } =
    useAppSelector((state) => state.units);
  const canManage = activeRole === 'ADMIN';

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: Tab = searchParams.get('tab') === 'types' ? 'types' : 'inventory';
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);

  const load = useCallback(() => {
    dispatch(fetchInventory());
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  const visibleBuildings = buildingFilter === null ? buildings : buildings.filter((b) => b.id === buildingFilter);
  const unitsInScope = units.filter((u) => buildingFilter === null || u.buildingId === buildingFilter);
  const visibleUnits = unitsInScope.filter((u) => statusFilter === null || u.status === statusFilter);
  const selectedUnit = units.find((u) => u.id === selectedUnitId) ?? null;

  const addDisabledReason = !unitsApiAvailable
    ? 'The units API is not available yet'
    : buildings.length === 0
      ? 'Create a building first'
      : unitTypes.length === 0
        ? 'Create a unit type first'
        : undefined;

  const renderContent = () => {
    if (loading && buildings.length === 0) return <LoadingState message="Loading unit inventory…" />;
    if (error) return <ErrorMessage title="Could not load unit inventory" message={error.message} onRetry={load} />;
    if (buildings.length === 0) {
      return (
        <EmptyState
          icon={<Building2 size={32} />}
          title="No buildings yet"
          description="Units are placed on building floors. Add a building before adding units."
        />
      );
    }
    return (
      <>
        {!unitsApiAvailable && (
          <Alert
            type="warning"
            title="Unit records are not available yet"
            message="property-unit-service does not expose GET /units yet, so floors are shown without units. They will appear here once the endpoint is released."
            autoDismiss={false}
            showDismissButton={false}
          />
        )}
        <UnitGrid
          buildings={visibleBuildings}
          units={visibleUnits}
          unitTypes={unitTypes}
          onSelectUnit={(unit) => setSelectedUnitId(unit.id)}
        />
      </>
    );
  };

  return (
    <PageContainer
      title={tab === 'types' ? 'Unit Types' : 'Unit Inventory'}
      subtitle={
        tab === 'types'
          ? 'Layouts, baseline rent and occupancy capacity for every unit.'
          : 'Live status of every unit, grouped by building and floor.'
      }
      actions={
        canManage &&
        tab === 'inventory' && (
          <Button
            size="sm"
            leftIcon={<Plus size={16} />}
            onClick={() => setIsAddOpen(true)}
            disabled={Boolean(addDisabledReason)}
            title={addDisabledReason}
          >
            Add Unit
          </Button>
        )
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div role="tablist" aria-label="Unit views" style={{ display: 'flex', gap: '0.5rem' }}>
          {(['inventory', 'types'] as const).map((id) => (
            <Button
              key={id}
              role="tab"
              aria-selected={tab === id}
              size="sm"
              variant={tab === id ? 'primary' : 'ghost'}
              onClick={() => setSearchParams(id === 'types' ? { tab: 'types' } : {})}
            >
              {id === 'inventory' ? 'Unit Inventory' : 'Unit Types'}
            </Button>
          ))}
        </div>

        {tab === 'types' && <UnitTypesPanel canManage={canManage} />}

        {tab === 'inventory' && buildings.length > 0 && (
          <Card padding="md">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <UnitStatusSummary
                units={unitsInScope}
                activeStatus={statusFilter}
                onSelect={(status) => dispatch(setStatusFilter(status))}
              />
              <div style={{ minWidth: '220px' }}>
                <Select
                  label="Building"
                  value={buildingFilter === null ? '' : String(buildingFilter)}
                  options={[
                    { value: '', label: 'All buildings' },
                    ...buildings.map((b) => ({ value: String(b.id), label: `${b.name} (${b.buildingCode})` })),
                  ]}
                  onChange={(event) =>
                    dispatch(setBuildingFilter(event.target.value === '' ? null : Number(event.target.value)))
                  }
                />
              </div>
            </div>
          </Card>
        )}

        {tab === 'inventory' && renderContent()}
      </div>

      <UnitDetailDrawer
        unit={selectedUnit}
        building={buildings.find((b) => b.id === selectedUnit?.buildingId)}
        unitType={unitTypes.find((t) => t.id === selectedUnit?.unitTypeId)}
        canManage={canManage}
        onClose={() => setSelectedUnitId(null)}
      />

      {canManage && (
        <AddUnitModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          buildings={buildings}
          unitTypes={unitTypes}
          existingUnits={units}
        />
      )}
    </PageContainer>
  );
};
