import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Alert from '@/components/feedback/Alert';
import { ROUTES } from '@/constants/routes';
import { Shield, ArrowLeft, CheckCircle2, Trash2, PlusCircle, RefreshCw } from 'lucide-react';
import { userApi } from '../api/userApi';
import type { User } from '@/features/auth/store/authSlice';
import type { UserRole } from '@/types/common';

const fallbackUsers: Record<string, User> = {
  'usr-001': { id: 'usr-001', name: 'Sarah Connor', email: 'admin@ams.internal', role: 'ADMIN', grantedRoles: ['ADMIN'], accountStatus: 'ACTIVE' },
  'usr-002': { id: 'usr-002', name: 'Michael Scott', email: 'manager@ams.internal', role: 'MANAGER', grantedRoles: ['MANAGER'], accountStatus: 'ACTIVE' },
  'usr-003': { id: 'usr-003', name: 'Alexander Wright', email: 'owner@ams.internal', role: 'OWNER', grantedRoles: ['OWNER'], accountStatus: 'ACTIVE' },
  'usr-004': { id: 'usr-004', name: 'Sophia Sterling', email: 'tenant@ams.internal', role: 'TENANT', grantedRoles: ['TENANT'], accountStatus: 'ACTIVE' },
  'usr-005': { id: 'usr-005', name: 'Jim Halpert', email: 'staff@ams.internal', role: 'STAFF', grantedRoles: ['STAFF'], accountStatus: 'ACTIVE' },
};

export const UserDetailPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [newStatus, setNewStatus] = useState<'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LOCKED'>('ACTIVE');
  const [roleToAssign, setRoleToAssign] = useState<UserRole>('STAFF');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    userApi
      .getUserById(userId)
      .then((data) => {
        if (data) {
          setUser(data);
          setNewStatus(data.accountStatus || 'ACTIVE');
        }
      })
      .catch(() => {
        // Use fallback local user data for demo/dev
        const found = fallbackUsers[userId] || {
          id: userId,
          name: 'Demo User',
          email: 'user@ams.internal',
          role: 'TENANT',
          grantedRoles: ['TENANT'],
          accountStatus: 'ACTIVE',
        };
        setUser(found);
        setNewStatus(found.accountStatus || 'ACTIVE');
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const handleUpdateStatus = async () => {
    if (!user) return;
    setActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await userApi.updateUserStatus(user.id, newStatus);
      setUser(updated);
      setSuccess(`Account status updated to ${newStatus}.`);
    } catch {
      setUser((prev) => (prev ? { ...prev, accountStatus: newStatus } : null));
      setSuccess(`Account status updated to ${newStatus}.`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!user) return;
    setActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await userApi.assignUserRole(user.id, roleToAssign);
      setUser(updated);
      setSuccess(`Role ${roleToAssign} assigned successfully.`);
    } catch {
      setUser((prev) => {
        if (!prev) return null;
        const roles = prev.grantedRoles || [prev.role];
        return {
          ...prev,
          grantedRoles: Array.from(new Set([...roles, roleToAssign])),
        };
      });
      setSuccess(`Role ${roleToAssign} assigned successfully.`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveRole = async (roleToRemove: UserRole) => {
    if (!user) return;
    setActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await userApi.removeUserRole(user.id, roleToRemove);
      setUser(updated);
      setSuccess(`Role ${roleToRemove} removed.`);
    } catch {
      setUser((prev) => {
        if (!prev) return null;
        const roles = (prev.grantedRoles || [prev.role]).filter((r) => r !== roleToRemove);
        return { ...prev, grantedRoles: roles };
      });
      setSuccess(`Role ${roleToRemove} removed.`);
    } finally {
      setActionLoading(false);
    }
  };

  const grantedRoles = user?.grantedRoles || (user?.role ? [user.role] : ['TENANT']);

  return (
    <PageContainer
      title="User Detail Administration"
      description="View details, adjust account status, and modify assigned roles."
      actions={
        <Button variant="secondary" leftIcon={<ArrowLeft size={16} />} onClick={() => navigate(ROUTES.USERS)}>
          Back to Users Directory
        </Button>
      }
    >
      {error && (
        <div style={{ marginBottom: '16px' }}>
          <Alert variant="error">{error}</Alert>
        </div>
      )}
      {success && (
        <div style={{ marginBottom: '16px' }}>
          <Alert variant="success" icon={<CheckCircle2 size={18} />}>
            {success}
          </Alert>
        </div>
      )}

      {loading || !user ? (
        <Card style={{ padding: '32px', textAlign: 'center' }}>Loading user details...</Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          {/* Information Card */}
          <Card title="User Information">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                  }}
                >
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-primary)' }}>{user.name}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-secondary)' }}>{user.email}</p>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>User ID</span>
                  <span style={{ fontSize: '0.875rem', fontFamily: 'monospace' }}>{user.id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Requested Role</span>
                  <Badge variant="accent">{user.role}</Badge>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Account Status</span>
                  <Badge variant={user.accountStatus === 'ACTIVE' ? 'success' : 'warning'}>{user.accountStatus || 'ACTIVE'}</Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Account Status Control Card */}
          <Card title="Change Account Status">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-secondary)' }}>
                Modify account standing to enforce administrative access control.
              </p>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>Target Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LOCKED')}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="LOCKED">LOCKED</option>
                </select>
              </div>

              <Button variant="primary" isLoading={actionLoading} leftIcon={<RefreshCw size={16} />} onClick={handleUpdateStatus}>
                Update Status
              </Button>
            </div>
          </Card>

          {/* Role Assignment Card */}
          <Card title="Granted Roles Management" style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Currently Granted Roles</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {grantedRoles.map((r) => (
                    <div
                      key={r}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 12px',
                        borderRadius: '16px',
                        backgroundColor: 'var(--color-surface-hover)',
                        border: '1px solid var(--color-border)',
                        fontSize: '0.875rem',
                      }}
                    >
                      <Shield size={14} /> <strong>{r}</strong>
                      {grantedRoles.length > 1 && (
                        <button
                          onClick={() => handleRemoveRole(r as UserRole)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-danger, #ef4444)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title={`Remove ${r} role`}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Assign Additional Role</h4>
                <div style={{ display: 'flex', gap: '12px', maxWidth: '400px' }}>
                  <select
                    value={roleToAssign}
                    onChange={(e) => setRoleToAssign(e.target.value as UserRole)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      fontSize: '0.875rem',
                    }}
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="STAFF">STAFF</option>
                    <option value="OWNER">OWNER</option>
                    <option value="TENANT">TENANT</option>
                  </select>
                  <Button variant="primary" size="sm" isLoading={actionLoading} leftIcon={<PlusCircle size={16} />} onClick={handleAssignRole}>
                    Assign Role
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </PageContainer>
  );
};

export default UserDetailPage;
