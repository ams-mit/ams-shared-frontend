import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Table, type Column } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchInventory } from '@/features/units/store/unitSlice';
import type { Floor } from '../types/property.types';

export const FloorsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { buildings, loading, error } = useAppSelector((state) => state.units);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    dispatch(fetchInventory());
  }, [dispatch]);

  const selectedId = searchParams.get('building') ?? (buildings[0] ? String(buildings[0].id) : '');
  const building = buildings.find((b) => String(b.id) === selectedId);
  const floors = [...(building?.floors ?? [])].sort((a, b) => a.floorNumber - b.floorNumber);

  const columns: Column<Floor>[] = [
    { key: 'floorNumber', header: 'Floor #', width: '120px', render: (f) => <strong>{f.floorNumber}</strong> },
    { key: 'floorName', header: 'Name', render: (f) => f.floorName || '—' },
  ];

  const renderContent = () => {
    if (loading && buildings.length === 0) return <LoadingState message="Loading floors…" />;
    if (error) {
      return (
        <ErrorMessage
          title="Could not load floors"
          message={error.message}
          onRetry={() => dispatch(fetchInventory())}
        />
      );
    }
    if (buildings.length === 0) {
      return (
        <EmptyState
          icon={<Layers size={32} />}
          title="No buildings configured"
          description="Floors are generated when a building is created on the Buildings page."
        />
      );
    }
    return (
      <Card
        title={building ? `${building.name} · ${building.buildingCode}` : 'Select a building'}
        subtitle={building ? `${floors.length} floor${floors.length === 1 ? '' : 's'}` : undefined}
        padding="none"
      >
        <Table columns={columns} data={floors} keyExtractor={(f) => f.floorNumber} emptyText="This building has no floors." striped />
      </Card>
    );
  };

  return (
    <PageContainer title="Floors" subtitle="Floor layout for each building.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {buildings.length > 0 && (
          <div style={{ maxWidth: '320px' }}>
            <Select
              label="Building"
              value={selectedId}
              options={buildings.map((b) => ({ value: String(b.id), label: `${b.name} (${b.buildingCode})` }))}
              onChange={(event) => setSearchParams({ building: event.target.value })}
            />
          </div>
        )}
        {renderContent()}
      </div>
    </PageContainer>
  );
};
