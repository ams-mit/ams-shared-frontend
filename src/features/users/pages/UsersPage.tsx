import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ROUTES } from '@/constants/routes';
import { Shield, UserPlus, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { userApi } from '../api/userApi';
import type { User } from '@/features/auth/store/authSlice';

const mockAdminUsers: User[] = [
  { id: 'usr-001', name: 'Sarah Connor', email: 'admin@ams.internal', role: 'ADMIN', grantedRoles: ['ADMIN'], accountStatus: 'ACTIVE' },
  { id: 'usr-002', name: 'Michael Scott', email: 'manager@ams.internal', role: 'MANAGER', grantedRoles: ['MANAGER'], accountStatus: 'ACTIVE' },
  { id: 'usr-003', name: 'Alexander Wright', email: 'owner@ams.internal', role: 'OWNER', relationshipStatus: 'OWNER', grantedRoles: ['OWNER'], accountStatus: 'ACTIVE' },
  { id: 'usr-004', name: 'Sophia Sterling', email: 'tenant@ams.internal', role: 'TENANT', relationshipStatus: 'TENANT', grantedRoles: ['TENANT'], accountStatus: 'ACTIVE' },
  { id: 'usr-005', name: 'Jim Halpert', email: 'staff@ams.internal', role: 'STAFF', relationshipStatus: 'STAFF', grantedRoles: ['STAFF'], accountStatus: 'ACTIVE' },
  { id: 'usr-006', name: 'Dwight Schrute', email: 'd.schrute@ams.internal', role: 'STAFF', grantedRoles: ['STAFF'], accountStatus: 'SUSPENDED' },
  { id: 'usr-007', name: 'Pam Beesly', email: 'p.beesly@ams.internal', role: 'TENANT', grantedRoles: ['TENANT'], accountStatus: 'LOCKED' },
];

export const UsersPage: React.FC = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>(mockAdminUsers);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    let isMounted = true;

    userApi
      .getUsers({ search, status: statusFilter, role: roleFilter, page, limit: 10 })
      .then((res) => {
        if (isMounted && res.data) {
          setUsers(res.data);
        }
      })
      .catch(() => {
        // Fallback to local filtering
      });

    return () => {
      isMounted = false;
    };
  }, [search, statusFilter, roleFilter, page]);

  // Frontend fallback filtering
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || u.accountStatus === statusFilter;
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  return (
    <PageContainer
      title="User Access Management"
      description="Administrative user directory, role permissions assignment, and account status enforcement."
      actions={
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
            variant="secondary"
            leftIcon={<Shield size={16} />}
            onClick={() => navigate(ROUTES.ROLES)}
          >
            Role Reference
          </Button>
          <Button
            variant="primary"
            leftIcon={<UserPlus size={16} />}
            onClick={() => navigate(ROUTES.USER_CREATE)}
          >
            Create User
          </Button>
        </div>
      }
    >
      <Card style={{ marginBottom: '24px' }}>
        {/* Search & Filters Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-secondary)', marginBottom: '4px' }}>
              Search Users
            </label>
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-secondary)', marginBottom: '4px' }}>
              Account Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                fontSize: '0.875rem',
                color: 'var(--color-primary)',
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="LOCKED">LOCKED</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-secondary)', marginBottom: '4px' }}>
              Requested Role Filter
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                fontSize: '0.875rem',
                color: 'var(--color-primary)',
              }}
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="MANAGER">MANAGER</option>
              <option value="OWNER">OWNER</option>
              <option value="TENANT">TENANT</option>
              <option value="STAFF">STAFF</option>
            </select>
          </div>
        </div>

        {/* User Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', backgroundColor: 'var(--color-surface-hover)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--color-primary)', fontSize: '0.8125rem' }}>User Name</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-primary)', fontSize: '0.8125rem' }}>Email</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-primary)', fontSize: '0.8125rem' }}>Requested Role</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-primary)', fontSize: '0.8125rem' }}>Status</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-primary)', fontSize: '0.8125rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No users matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)', fontSize: '0.875rem' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge variant="accent">{u.role}</Badge>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge
                        variant={
                          u.accountStatus === 'ACTIVE'
                            ? 'success'
                            : u.accountStatus === 'LOCKED' || u.accountStatus === 'SUSPENDED'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {u.accountStatus || 'ACTIVE'}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<Eye size={14} />}
                        onClick={() => navigate(`/admin/users/${u.id}`)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--color-border)',
            fontSize: '0.8125rem',
            color: 'var(--color-secondary)',
          }}
        >
          <div>Showing page {page}</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button size="sm" variant="secondary" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              <ChevronLeft size={16} />
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setPage((p) => p + 1)}>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
};

export default UsersPage;
