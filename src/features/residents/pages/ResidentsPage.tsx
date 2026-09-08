import React from 'react';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { UserPlus } from 'lucide-react';
import Input from '@/components/ui/Input';

interface ResidentItem {
  id: string;
  name: string;
  unit: string;
  phone: string;
  email: string;
  status: 'ACTIVE' | 'PENDING' | 'VACATED';
}

const mockResidents: ResidentItem[] = [
  { id: '1', name: 'Alexander Wright', unit: 'A-101', phone: '+1 555-0192', email: 'a.wright@ams.internal', status: 'ACTIVE' },
  { id: '2', name: 'Sophia Sterling', unit: 'B-304', phone: '+1 555-0144', email: 's.sterling@ams.internal', status: 'ACTIVE' },
  { id: '3', name: 'Marcus Vance', unit: 'C-202', phone: '+1 555-0178', email: 'm.vance@ams.internal', status: 'PENDING' },
  { id: '4', name: 'Elena Rostova', unit: 'A-405', phone: '+1 555-0129', email: 'e.rostova@ams.internal', status: 'ACTIVE' },
];

export const ResidentsPage: React.FC = () => {
  return (
    <PageContainer
      title="Residents Directory"
      description="Manage building occupants, leases, and contact verification."
      actions={
        <Button variant="primary" leftIcon={<UserPlus size={16} />}>
          Add Resident
        </Button>
      }
    >
      <Card>
        <div style={{ marginBottom: '16px', maxWidth: '320px' }}>
          <Input placeholder="Search residents by name or unit..." />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', backgroundColor: 'var(--color-surface-hover)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--color-primary)', fontSize: '0.8125rem' }}>Name</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-primary)', fontSize: '0.8125rem' }}>Unit</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-primary)', fontSize: '0.8125rem' }}>Contact</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-primary)', fontSize: '0.8125rem' }}>Status</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-primary)', fontSize: '0.8125rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockResidents.map((resident) => (
                <tr
                  key={resident.id}
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    fontSize: '0.875rem',
                  }}
                >
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{resident.name}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge variant="accent">{resident.unit}</Badge>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)' }}>
                    <div>{resident.email}</div>
                    <div style={{ fontSize: '0.75rem' }}>{resident.phone}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge variant={resident.status === 'ACTIVE' ? 'success' : 'warning'}>
                      {resident.status}
                    </Badge>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <Button size="sm" variant="ghost">View Details</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageContainer>
  );
};

export default ResidentsPage;
