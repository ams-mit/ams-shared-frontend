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

const rentFormatter = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const UnitTypesPanel: React.FC<{ canManage: boolean }> = ({ canManage }) => {
  const dispatch = useAppDispatch();
  const { unitTypes, loading, error } = useAppSelector((state) => state.units);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const columns: Column<UnitType>[] = [
    { key: 'typeName', header: 'Type', render: (t) => <strong>{t.typeName}</strong> },
    { key: 'baseRent', header: 'Base Rent / month', align: 'right', render: (t) => rentFormatter.format(t.baseRent) },
    {
      key: 'capacityLimit',
      header: 'Capacity',
      align: 'center',
      render: (t) =>
        t.capacityLimit > 1 ? (
          <Badge variant="accent" size="sm">
            Multi · {t.capacityLimit}
          </Badge>
        ) : (
          <Badge variant="neutral" size="sm">
            Single
          </Badge>
        ),
    },
    { key: 'amenitiesSummary', header: 'Amenities', render: (t) => t.amenitiesSummary || '—' },
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
          description="Unit types set the rent baseline and occupancy capacity that every unit inherits."
          actionText={canManage ? 'New Unit Type' : undefined}
          onAction={canManage ? () => setIsFormOpen(true) : undefined}
        />
      ) : (
        <Card
          title="Unit Types"
          subtitle="Layouts, baseline rent and occupancy capacity."
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
