import React, { useState } from 'react';
import { User, Bell, ChevronDown, Check, Building, ShieldCheck, Menu } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { switchUserById } from '@/features/auth/store/authSlice';
import { toggleMenu } from '@/app/store/uiSlice';
import { Badge } from '@/components/ui/Badge';

export const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentUser, availableUsers, activeRole } = useAppSelector((state) => state.auth);
  const { isMenuOpen } = useAppSelector((state) => state.ui);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'success';
      case 'STAFF':
        return 'warning';
      case 'OWNER':
        return 'brand';
      case 'RESIDENT':
      default:
        return 'info';
    }
  };

  return (
    <header
      style={{
        height: '66px',
        backgroundColor: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Left section: Hamburger Menu Button + Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        <button
          type="button"
          onClick={() => dispatch(toggleMenu())}
          title={isMenuOpen ? 'Close Menu' : 'Open Navigation Menu'}
          aria-label="Toggle Navigation Menu"
          aria-expanded={isMenuOpen}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            backgroundColor: '#FFFFFF',
            color: 'var(--color-primary)',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
            e.currentTarget.style.borderColor = 'var(--color-accent)';
            e.currentTarget.style.color = 'var(--color-accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FFFFFF';
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.color = 'var(--color-primary)';
          }}
        >
          <Menu size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building size={18} color="var(--color-primary)" />
          <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.01em' }}>
            AMS Community
          </span>
        </div>
        {currentUser.unitId && (
          <>
            <span style={{ color: 'var(--color-text-light)' }}>/</span>
            <Badge variant="accent" size="sm">
              {currentUser.unitId}
            </Badge>
          </>
        )}
      </div>

      {/* Right section: System Mode & Role Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            style={{
              position: 'relative',
              cursor: 'pointer',
              padding: '0.45rem',
              color: 'var(--color-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              transition: 'background var(--transition-fast)',
            }}
            title="Announcements & Alerts"
          >
            <Bell size={18} />
            <span
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-accent)',
              }}
            />
          </button>

          {isNotificationOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                onClick={() => setIsNotificationOpen(false)}
              />
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  marginTop: '0.5rem',
                  width: '320px',
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid var(--color-border)',
                  zIndex: 100,
                  padding: '1rem',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                  Community Alerts & Bulletins
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                  • Quarterly fire alarm verification scheduled for Saturday 10:00 AM.
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.4, marginTop: '0.5rem' }}>
                  • Olympic pool scheduled chemical maintenance Monday morning.
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Persona Switcher */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8125rem',
              }}
            >
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1.25 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text)' }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                Role: <span style={{ fontWeight: 700, color: 'var(--color-accent)' }}>{activeRole}</span>
              </div>
            </div>
            <ChevronDown size={15} color="var(--color-text-muted)" />
          </button>

          {isDropdownOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                onClick={() => setIsDropdownOpen(false)}
              />
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  marginTop: '0.5rem',
                  width: '300px',
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid var(--color-border)',
                  zIndex: 100,
                  overflow: 'hidden',
                  animation: 'fadeInScale 150ms ease-out',
                }}
              >
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--color-surface-hover)',
                    borderBottom: '1px solid var(--color-border-subtle)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--color-secondary)',
                    letterSpacing: '0.06em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>Select Active Persona</span>
                  <ShieldCheck size={14} color="var(--color-accent)" />
                </div>
                {availableUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      dispatch(switchUserById(user.id));
                      setIsDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      cursor: 'pointer',
                      backgroundColor: user.id === currentUser.id ? 'var(--color-surface-sunken)' : 'transparent',
                      borderBottom: '1px solid var(--color-border-subtle)',
                      transition: 'background var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)')}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        user.id === currentUser.id ? 'var(--color-surface-sunken)' : 'transparent')
                    }
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor:
                            user.role === 'ADMIN'
                              ? 'var(--color-primary)'
                              : user.role === 'STAFF'
                              ? 'var(--color-secondary)'
                              : 'var(--color-accent)',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}
                      >
                        {user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text)' }}>
                          {user.name}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '1px' }}>
                          <Badge variant={getRoleBadgeVariant(user.role)} size="sm">
                            {user.role}
                          </Badge>
                          {user.unitId && <span>{user.unitId}</span>}
                        </div>
                      </div>
                    </div>
                    {user.id === currentUser.id && <Check size={16} color="var(--color-accent)" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
