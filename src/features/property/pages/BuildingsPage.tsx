import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Plus } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Table, type Column } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Alert } from '@/components/feedback/Alert';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { ROUTES } from '@/constants/routes';
import { fetchInventory } from '@/features/units/store/unitSlice';
import { AddBuildingModal } from '../components/AddBuildingModal';
import type { Building } from '../types/property.types';

export const BuildingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeRole } = useAppSelector((state) => state.auth);
  const { buildings, loading, error } = useAppSelector((state) => state.units);
  const canManage = activeRole === 'ADMIN';

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchInventory());
  }, [dispatch]);

  const columns: Column<Building>[] = [
    { key: 'buildingCode', header: 'Code', render: (b) => <strong>{b.buildingCode}</strong> },
    { key: 'name', header: 'Name' },
    { key: 'address', header: 'Address' },
    { key: 'floors', header: 'Floors', align: 'center', render: (b) => b.floors.length },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (b) => (
        <Link to={`${ROUTES.FLOORS}?building=${b.id}`} style={{ color: 'var(--color-accent)', fontWeight: 600, fontSize: '0.875rem' }}>
          View floors
        </Link>
      ),
    },
  ];

  const renderContent = () => {
    if (loading && buildings.length === 0) return <LoadingState message="Loading buildings…" />;
    if (error) {
      return (
        <ErrorMessage
          title="Could not load buildings"
          message={error.message}
          onRetry={() => dispatch(fetchInventory())}
        />
      );
    }
    if (buildings.length === 0) {
      return (
        <EmptyState
          icon={<Building2 size={32} />}
          title="No buildings yet"
          description="Add your first building to start configuring floors and units."
          actionText={canManage ? 'Add Building' : undefined}
          onAction={canManage ? () => setIsAddOpen(true) : undefined}
        />
      );
    }
    return (
      <Card padding="none">
        <Table columns={columns} data={buildings} keyExtractor={(b) => b.id} striped />
      </Card>
    );
  };

  return (
    <PageContainer
      title="Buildings"
      subtitle="Building portfolio and floor configuration."
      actions={
        canManage && (
          <Button size="sm" leftIcon={<Plus size={16} />} onClick={() => setIsAddOpen(true)}>
            Add Building
          </Button>
        )
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {successMessage && <Alert type="success" message={successMessage} onDismiss={() => setSuccessMessage(null)} />}
        {renderContent()}
      </div>

      {canManage && (
        <AddBuildingModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          existingBuildings={buildings}
          onCreated={(b) => setSuccessMessage(`${b.name} (${b.buildingCode}) created with ${b.floors.length} floors.`)}
        />
      )}
    </PageContainer>
  );
};
