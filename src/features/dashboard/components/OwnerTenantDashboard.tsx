import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';
import { UserCheck, Users, Building, ShieldCheck } from 'lucide-react';
import type { User as UserType } from '@/features/auth/store/authSlice';

interface OwnerTenantDashboardProps {
  user: UserType | null;
}

export const OwnerTenantDashboard: React.FC<OwnerTenantDashboardProps> = ({ user }) => {
  const navigate = useNavigate();

  return (
    <PageContainer
      title="Owner & Tenant Management Portal"
      description={`Welcome back, ${user?.name || 'Property Owner/Tenant'}. Overview of property ownership records and resident directory.`}
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
                Account Standing
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '4px' }}>
                {user?.role === 'OWNER' ? 'Property Owner' : 'Lease Tenant'}
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
              <UserCheck size={22} />
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            <Badge variant="accent">Status: Active</Badge>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-secondary)', fontWeight: 500 }}>
                Property Directory
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '4px' }}>
                Registered
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
              <Building size={22} />
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>100%</span> Ownership verified
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-secondary)', fontWeight: 500 }}>
                Access Level
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '4px' }}>
                Owner / Tenant
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
              <ShieldCheck size={22} />
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            <Badge variant="success">Verified Access</Badge>
          </div>
        </Card>
      </div>

      {/* Implemented Modules Overview */}
      <Card
        title="Owner-Tenant Feature Modules"
        subtitle="Active modules relevant to owner and tenant management"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              backgroundColor: 'var(--color-background)',
              borderRadius: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(30, 58, 95, 0.08)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <UserCheck size={20} />
              </div>
              <div>
                <strong style={{ color: 'var(--color-primary)', display: 'block' }}>
                  Property Owners Directory
                </strong>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  View owner profiles, registered property holdings, and unit ownership status
                </div>
              </div>
            </div>
            <Button size="sm" variant="secondary" onClick={() => navigate(ROUTES.OWNERS)}>
              View Owners
            </Button>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              backgroundColor: 'var(--color-background)',
              borderRadius: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(47, 139, 139, 0.12)',
                  color: 'var(--color-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Users size={20} />
              </div>
              <div>
                <strong style={{ color: 'var(--color-primary)', display: 'block' }}>
                  Residents & Occupants Directory
                </strong>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  Inspect building resident listings, unit assignments, and active leases
                </div>
              </div>
            </div>
            <Button size="sm" variant="secondary" onClick={() => navigate(ROUTES.RESIDENTS)}>
              View Residents
            </Button>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              backgroundColor: 'var(--color-background)',
              borderRadius: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: 'var(--color-success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Building size={20} />
              </div>
              <div>
                <strong style={{ color: 'var(--color-primary)', display: 'block' }}>
                  My Profile & Security Settings
                </strong>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  View corporate email, user ID, and active security clearance
                </div>
              </div>
            </div>
            <Button size="sm" variant="secondary" onClick={() => navigate(ROUTES.PROFILE)}>
              Manage Profile
            </Button>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
};

export default OwnerTenantDashboard;
