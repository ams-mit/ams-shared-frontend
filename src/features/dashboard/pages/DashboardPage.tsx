import React from 'react';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Building2, Users, FileText, CheckCircle2, Plus } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  return (
    <PageContainer
      title="Apartment Management Overview"
      description="Welcome to the unified AMS portal. Monitoring facility activity and module operations."
      actions={
        <Button
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={() => alert('Action clicked')}
        >
          New Request
        </Button>
      }
    >
      {/* Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '28px',
        }}
      >
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-secondary)', fontWeight: 500 }}>
                Total Units
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '4px' }}>
                142
              </div>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '8px',
                backgroundColor: 'rgba(30, 58, 95, 0.08)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Building2 size={22} />
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>98%</span> Occupancy rate
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-secondary)', fontWeight: 500 }}>
                Registered Residents
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '4px' }}>
                318
              </div>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '8px',
                backgroundColor: 'rgba(47, 139, 139, 0.12)',
                color: 'var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={22} />
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>+12</span> new this month
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-secondary)', fontWeight: 500 }}>
                Active Maintenance
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '4px' }}>
                7
              </div>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '8px',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={22} />
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            <Badge variant="warning">3 in progress</Badge>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-secondary)', fontWeight: 500 }}>
                System Architecture
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '6px' }}>
                React + Redux
              </div>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: 'var(--color-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={22} />
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            <Badge variant="success">Standards Compliant</Badge>
          </div>
        </Card>
      </div>

      {/* Feature Modules Integration Status */}
      <Card
        title="AMS Shared Modules"
        subtitle="Shared frontend platform hosting cross-team domain modules"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: 'var(--color-background)',
              borderRadius: '6px',
            }}
          >
            <div>
              <strong style={{ color: 'var(--color-primary)' }}>Group 1:</strong> Identity, Access, Residents, Users
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                Authentication state, shared token storage, and user profile management
              </div>
            </div>
            <Badge variant="success">Active</Badge>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: 'var(--color-background)',
              borderRadius: '6px',
            }}
          >
            <div>
              <strong style={{ color: 'var(--color-primary)' }}>Group 2:</strong> Property, Units, Leases, Occupancy
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                Building layout, unit directories, and tenant contracts
              </div>
            </div>
            <Badge variant="default">Ready for Integration</Badge>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: 'var(--color-background)',
              borderRadius: '6px',
            }}
          >
            <div>
              <strong style={{ color: 'var(--color-primary)' }}>Group 3:</strong> Billing, Utilities, Payments
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                Invoicing, payment processing, and utility tracking
              </div>
            </div>
            <Badge variant="default">Ready for Integration</Badge>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: 'var(--color-background)',
              borderRadius: '6px',
            }}
          >
            <div>
              <strong style={{ color: 'var(--color-primary)' }}>Group 4:</strong> Operations, Maintenance, Facilities
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                Ticket lifecycle, vendor management, and visitor logs
              </div>
            </div>
            <Badge variant="default">Ready for Integration</Badge>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
};

export default DashboardPage;
