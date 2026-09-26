import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';
import { Users, User, Building, CheckCircle2 } from 'lucide-react';
import type { User as UserType } from '@/features/auth/store/authSlice';

interface BasicDashboardProps {
  user: UserType | null;
}

export const BasicDashboard: React.FC<BasicDashboardProps> = ({ user }) => {
  const navigate = useNavigate();

  return (
    <PageContainer
      title="Resident Community Portal"
      description={`Welcome back, ${user?.name || 'Resident'}. Access active community directories and account preferences.`}
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
                My Relationship
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '4px' }}>
                {user?.relationshipStatus || 'RESIDENT'}
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
              <User size={22} />
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            <Badge variant="success">Active Account</Badge>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-secondary)', fontWeight: 500 }}>
                Community Directory
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '4px' }}>
                Available
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
              <Users size={22} />
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Directory</span> Ready
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-secondary)', fontWeight: 500 }}>
                System Access
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '4px' }}>
                Verified
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
            <Badge variant="success">Basic Level</Badge>
          </div>
        </Card>
      </div>

      {/* Implemented Modules Overview */}
      <Card
        title="Active Resident Modules"
        subtitle="Modules currently implemented and active for resident access"
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
                  Residents Directory
                </strong>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  View building occupants, lease status, and resident contact information
                </div>
              </div>
            </div>
            <Button size="sm" variant="secondary" onClick={() => navigate(ROUTES.RESIDENTS)}>
              View Directory
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
                  backgroundColor: 'rgba(30, 58, 95, 0.08)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Building size={20} />
              </div>
              <div>
                <strong style={{ color: 'var(--color-primary)', display: 'block' }}>
                  My Profile & Credentials
                </strong>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  Manage corporate identity, system role, and security preferences
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

export default BasicDashboard;
