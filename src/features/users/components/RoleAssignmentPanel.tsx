import React, { useState } from 'react';
import { PlusCircle, ShieldCheck, ShieldOff, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/feedback/Alert';
import { userApi } from '../api/userApi';
import { SYSTEM_ROLES, SYSTEM_ROLE_CONFIG, getRoleLabel } from '../constants/systemRoles';
import { getFullName } from '../utils/userFormat';
import type { SystemRole, UserAccount } from '../types/user.types';
import { ConfirmationModal } from './ConfirmationModal';

type PendingRoleChange = { type: 'assign' | 'remove'; role: SystemRole };

export interface RoleAssignmentPanelProps {
  user: UserAccount;
  /** The signed-in administrator. Administrators cannot change their own roles (FR-IAM-027). */
  actorUserId: string;
  onUserUpdated: (user: UserAccount) => void;
}

export const RoleAssignmentPanel: React.FC<RoleAssignmentPanelProps> = ({ user, actorUserId, onUserUpdated }) => {
  const [roleToAssign, setRoleToAssign] = useState<SystemRole | ''>('');
  const [pendingChange, setPendingChange] = useState<PendingRoleChange | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const userName = getFullName(user);
  const isOwnAccount = user.id === actorUserId;
  const controlsDisabled = isSaving || isOwnAccount;
  const availableRoles = SYSTEM_ROLES.filter((role) => !user.roles.includes(role));
  const roleCountLabel = `${user.roles.length} ${user.roles.length === 1 ? 'role' : 'roles'} assigned`;

  const requestAssign = () => {
    setError(null);
    setSuccess(null);
    if (!roleToAssign) {
      setValidationError('Select a role to assign.');
      return;
    }
    setValidationError(null);
    setPendingChange({ type: 'assign', role: roleToAssign });
  };

  const requestRemove = (role: SystemRole) => {
    setError(null);
    setSuccess(null);
    setPendingChange({ type: 'remove', role });
  };

  const confirmChange = async () => {
    if (!pendingChange) return;
    const { type, role } = pendingChange;
    setIsSaving(true);
    try {
      const updated =
        type === 'assign'
          ? await userApi.assignRole(user.id, role, actorUserId)
          : await userApi.removeRole(user.id, role, actorUserId);
      onUserUpdated(updated);
      setSuccess(
        type === 'assign'
          ? `${getRoleLabel(role)} was assigned to ${userName}.`
          : `${getRoleLabel(role)} was removed from ${userName}.`
      );
      if (type === 'assign') setRoleToAssign('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The role change could not be saved.');
    } finally {
      setIsSaving(false);
      setPendingChange(null);
    }
  };

  return (
    <Card title="Role Assignments" subtitle={roleCountLabel}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {success && <Alert key={success} type="success" message={success} />}
        {error && <Alert key={error} type="error" title="Role change failed" message={error} autoDismiss={false} />}
        {isOwnAccount && (
          <Alert
            type="info"
            message="This is your own account. For security, another system administrator must change your roles."
            autoDismiss={false}
            showDismissButton={false}
          />
        )}

        {user.roles.length === 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--color-border-strong)',
              backgroundColor: 'var(--color-surface-hover)',
            }}
          >
            <ShieldOff size={20} color="var(--color-secondary)" aria-hidden="true" />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>No roles assigned</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                This user cannot access role-based features until at least one role is assigned.
              </div>
            </div>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {user.roles.map((role) => (
              <li
                key={role}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                  <ShieldCheck size={18} color="var(--color-accent)" aria-hidden="true" style={{ marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{SYSTEM_ROLE_CONFIG[role].label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {SYSTEM_ROLE_CONFIG[role].description}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={<Trash2 size={14} />}
                  onClick={() => requestRemove(role)}
                  disabled={controlsDisabled}
                  aria-label={`Remove ${getRoleLabel(role)} role`}
                  style={{ color: 'var(--color-danger)' }}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}

        <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '1.25rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '0.75rem' }}>
            <div style={{ flex: '1 1 240px', position: 'relative', zIndex: 20 }}>
              <Select
                label="Assign a role"
                options={availableRoles.map((role) => ({ value: role, label: getRoleLabel(role) }))}
                value={roleToAssign}
                onChange={(e) => {
                  setRoleToAssign(e.target.value as SystemRole);
                  setValidationError(null);
                }}
                placeholder={availableRoles.length ? 'Select a role...' : 'All roles are assigned'}
                disabled={controlsDisabled || availableRoles.length === 0}
                error={validationError ?? undefined}
                searchable={false}
              />
            </div>
            <Button
              variant="primary"
              leftIcon={<PlusCircle size={16} />}
              onClick={requestAssign}
              disabled={controlsDisabled || availableRoles.length === 0}
              style={{ minHeight: '44px', marginBottom: validationError ? '1.4rem' : 0 }}
            >
              Assign Role
            </Button>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={pendingChange !== null}
        title={pendingChange?.type === 'remove' ? 'Remove role?' : 'Assign role?'}
        tone={pendingChange?.type === 'remove' ? 'danger' : 'primary'}
        confirmLabel={pendingChange?.type === 'remove' ? 'Remove Role' : 'Assign Role'}
        isConfirming={isSaving}
        onConfirm={confirmChange}
        onCancel={() => setPendingChange(null)}
        description={
          pendingChange && (
            <>
              {pendingChange.type === 'assign' ? 'Assign ' : 'Remove '}
              <strong>{getRoleLabel(pendingChange.role)}</strong>
              {pendingChange.type === 'assign' ? ' to ' : ' from '}
              <strong>{userName}</strong>?{' '}
              {pendingChange.type === 'remove' && user.roles.length === 1
                ? 'This is their only role, so they will lose access to role-based features.'
                : 'Their access will update the next time they sign in.'}
            </>
          )
        }
      />
    </Card>
  );
};
