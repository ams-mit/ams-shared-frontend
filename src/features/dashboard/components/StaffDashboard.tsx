import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';
import { Shield, Briefcase, Users, UserCheck, Building2 } from 'lucide-react';
import type { User as UserType } from '@/features/auth/store/authSlice';

interface StaffDashboardProps {
  user: UserType | null;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ user }) => {
  const navigate = useNavigate();

  return (
    <PageContainer
      title="Staff Operations & Administration"
      description={`Welcome back, ${user?.name || 'Staff Member'}. Managing facility operations, user access, and directory controls.`}
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
                System Role
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '4px' }}>
                {user?.role || 'STAFF'}
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
              <Shield size={22} />
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            <Badge variant="accent">Administrative Privilege</Badge>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-secondary)', fontWeight: 500 }}>
                Operations Control
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '4px' }}>
                Full Operational
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
              <Briefcase size={22} />
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Staff Level</span> Active
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-secondary)', fontWeight: 500 }}>
                Facility Infrastructure
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '4px' }}>
                142 Units
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
              <Building2 size={22} />
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            <Badge variant="success">98% Occupancy</Badge>
          </div>
        </Card>
      </div>

      {/* Implemented Staff Modules */}
      <Card
        title="Staff Operational Modules"
        subtitle="Active administrative and operations management tools"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
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
                  <Shield size={20} />
                </div>
                <div>
                  <strong style={{ color: 'var(--color-primary)', display: 'block' }}>
                    User Access & Permissions
                  </strong>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    Manage user accounts, system roles, and access control policies
                  </div>
                </div>
              </div>
              <Button size="sm" variant="secondary" onClick={() => navigate(ROUTES.USERS)}>
                Manage Access
              </Button>
            </div>
          )}

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
                <Briefcase size={20} />
              </div>
              <div>
                <strong style={{ color: 'var(--color-primary)', display: 'block' }}>
                  Staff Members Directory
                </strong>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  View staff roster, duty assignments, and departmental contacts
                </div>
              </div>
            </div>
            <Button size="sm" variant="secondary" onClick={() => navigate(ROUTES.STAFF)}>
              View Staff
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
                <Users size={20} />
              </div>
              <div>
                <strong style={{ color: 'var(--color-primary)', display: 'block' }}>
                  Residents Directory
                </strong>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  Access occupant directory, lease status, and resident contact data
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
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  color: '#d97706',
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
                  Manage property owner records, unit holdings, and contact info
                </div>
              </div>
            </div>
            <Button size="sm" variant="secondary" onClick={() => navigate(ROUTES.OWNERS)}>
              View Owners
            </Button>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
};

export default StaffDashboard;
