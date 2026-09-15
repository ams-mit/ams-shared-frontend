import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';
import { Shield, ArrowLeft } from 'lucide-react';
import { userApi, type RoleReference } from '../api/userApi';

const fallbackRoles: RoleReference[] = [
  {
    id: 'role-001',
    name: 'ADMIN',
    description: 'Full administrative access across all system modules, user access control, and platform operations.',
    permissions: ['USERS_MANAGE', 'ROLES_ASSIGN', 'RESIDENTS_MANAGE', 'OWNERS_MANAGE', 'STAFF_MANAGE'],
  },
  {
    id: 'role-002',
    name: 'MANAGER',
    description: 'Operational manager access for building governance, resident management, and staff directory oversight.',
    permissions: ['USERS_VIEW', 'RESIDENTS_MANAGE', 'OWNERS_MANAGE', 'STAFF_MANAGE'],
  },
  {
    id: 'role-003',
    name: 'STAFF',
    description: 'Field staff and maintenance duty operations with access to resident and property holdings.',
    permissions: ['RESIDENTS_VIEW', 'OWNERS_VIEW', 'STAFF_VIEW'],
  },
  {
    id: 'role-004',
    name: 'OWNER',
    description: 'Property owner access for viewing unit holdings, resident directories, and owner profiles.',
    permissions: ['OWNED_UNITS_VIEW', 'RESIDENTS_VIEW', 'PROFILE_MANAGE'],
  },
  {
    id: 'role-005',
    name: 'TENANT',
    description: 'Resident occupant access for community directories and personal profile credentials.',
    permissions: ['RESIDENTS_VIEW', 'PROFILE_MANAGE'],
  },
];

export const RolesPage: React.FC = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<RoleReference[]>(fallbackRoles);

  useEffect(() => {
    let isMounted = true;

    userApi
      .getRoles()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setRoles(data);
        }
      })
      .catch(() => {
        // Fallback to project defined roles reference table
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <PageContainer
      title="System Role Reference"
      description="Reference directory of active system roles, descriptions, and functional scope."
      actions={
        <Button variant="secondary" leftIcon={<ArrowLeft size={16} />} onClick={() => navigate(ROUTES.USERS)}>
          Back to User Access
        </Button>
      }
    >
      <Card title="Defined Application Roles">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {roles.map((role) => (
            <div
              key={role.id || role.name}
              style={{
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Shield size={18} color="var(--color-accent)" />
                  <strong style={{ fontSize: '1rem', color: 'var(--color-primary)' }}>{role.name}</strong>
                </div>
                <Badge variant="accent">{role.name}</Badge>
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--color-secondary)', margin: 0 }}>
                {role.description}
              </p>

              {role.permissions && role.permissions.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {role.permissions.map((p) => (
                    <Badge key={p} variant="default">
                      {p}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </PageContainer>
  );
};

export default RolesPage;
