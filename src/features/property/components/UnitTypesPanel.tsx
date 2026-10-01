import React, { useState } from 'react';
import { Plus, Shapes } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, type Column } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchInventory } from '@/features/units/store/unitSlice';
import { UnitTypeFormModal } from './UnitTypeFormModal';
import type { UnitType } from '../types/property.types';

export const UnitTypesPanel: React.FC<{ canManage: boolean }> = ({ canManage }) => {
  const dispatch = useAppDispatch();
  const { unitTypes, loading, error } = useAppSelector((state) => state.units);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const columns: Column<UnitType>[] = [
    { key: 'code', header: 'Code', render: (t) => <strong>{t.code}</strong> },
    { key: 'name', header: 'Type' },
    {
      key: 'capacity',
      header: 'Capacity',
      align: 'center',
      render: (t) =>
        t.capacity > 1 ? (
          <Badge variant="accent" size="sm">
            Multi · {t.capacity}
          </Badge>
        ) : (
          <Badge variant="neutral" size="sm">
            Single
          </Badge>
        ),
    },
    { key: 'description', header: 'Description', render: (t) => t.description || '—' },
    {
      key: 'status',
      header: 'Status',
      render: (t) => (
        <Badge variant={t.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm">
          {t.status === 'ACTIVE' ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  if (error) {
    return (
      <ErrorMessage
        title="Could not load unit types"
        message={error.message}
        onRetry={() => dispatch(fetchInventory())}
      />
    );
  }

  return (
    <>
      {!loading && unitTypes.length === 0 ? (
        <EmptyState
          icon={<Shapes size={32} />}
          title="No unit types defined"
          description="Unit types set the occupancy capacity that every unit inherits."
          actionText={canManage ? 'New Unit Type' : undefined}
          onAction={canManage ? () => setIsFormOpen(true) : undefined}
        />
      ) : (
        <Card
          title="Unit Types"
          subtitle="Layouts and occupancy capacity."
          padding="none"
          action={
            canManage && (
              <Button size="sm" variant="outline" leftIcon={<Plus size={14} />} onClick={() => setIsFormOpen(true)}>
                New Unit Type
              </Button>
            )
          }
        >
          <Table columns={columns} data={unitTypes} keyExtractor={(t) => t.id} isLoading={loading} striped />
        </Card>
      )}
      {canManage && <UnitTypeFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />}
    </>
  );
};
