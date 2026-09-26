import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  Users,
  Megaphone,
  ShieldCheck,
  UserCheck,
  X,
  LayoutGrid,
  FileText,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { closeMenu } from '@/app/store/uiSlice';

export const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeRole, currentUser } = useAppSelector((state) => state.auth);
  const { bookings } = useAppSelector((state) => state.facilities);
  const { visitors } = useAppSelector((state) => state.visitors);
  const { isMenuOpen } = useAppSelector((state) => state.ui);

  const isStaffOrAdmin = activeRole === 'STAFF' || activeRole === 'ADMIN';

  // Role-based badges
  const pendingApprovalsCount = bookings.filter((b) => b.status === 'PENDING').length;
  const myBookingsCount = bookings.filter((b) => b.requesterId === currentUser.id).length;
  const myVisitorsCount = visitors.filter(
    (v) => v.residentId === currentUser.id && v.status === 'EXPECTED'
  ).length;
  const totalExpectedVisitors = visitors.filter((v) => v.status === 'EXPECTED').length;

  // Dynamic role-specific navigation paths & labels
  const navItems = isStaffOrAdmin
    ? [
        {
          to: ROUTES.DASHBOARD,
          label: 'Operations Command',
          icon: <LayoutDashboard size={20} />,
          end: true,
        },
        {
          to: ROUTES.FACILITIES,
          label: 'Facilities & Amenities',
          icon: <Building2 size={20} />,
        },
        {
          to: ROUTES.RESERVATIONS,
          label: 'Booking Approvals Queue',
          icon: <CalendarCheck size={20} />,
          badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} Pending` : undefined,
          badgeVariant: 'warning',
        },
        {
          to: ROUTES.VISITORS,
          label: 'Gate Checkpoint Roster',
          icon: <ShieldCheck size={20} />,
          badge: totalExpectedVisitors > 0 ? `${totalExpectedVisitors} Expected` : undefined,
          badgeVariant: 'accent',
        },
        {
          to: ROUTES.ANNOUNCEMENTS,
          label: 'Broadcast Circulars',
          icon: <Megaphone size={20} />,
        },
        {
          to: ROUTES.UNITS,
          label: 'Unit Inventory',
          icon: <LayoutGrid size={20} />,
        },
        {
          to: ROUTES.LEASES,
          label: 'Lease Agreements',
          icon: <FileText size={20} />,
        },
      ]
    : [
        {
          to: ROUTES.DASHBOARD,
          label: 'Resident Portal',
          icon: <LayoutDashboard size={20} />,
          end: true,
        },
        {
          to: ROUTES.FACILITIES,
          label: 'Explore & Book Amenities',
          icon: <Building2 size={20} />,
        },
        {
          to: ROUTES.RESERVATIONS,
          label: 'My Reservations',
          icon: <CalendarCheck size={20} />,
          badge: myBookingsCount > 0 ? `${myBookingsCount} Total` : undefined,
          badgeVariant: 'neutral',
        },
        {
          to: ROUTES.VISITORS,
          label: 'My Guest Passes',
          icon: <Users size={20} />,
          badge: myVisitorsCount > 0 ? `${myVisitorsCount} Expected` : undefined,
          badgeVariant: 'accent',
        },
        {
          to: ROUTES.ANNOUNCEMENTS,
          label: 'Community Bulletins',
          icon: <Megaphone size={20} />,
        },
      ];

  const getRoleColor = () => {
    switch (activeRole) {
      case 'ADMIN':
        return '#34D399'; // Emerald
      case 'STAFF':
        return '#FBBF24'; // Amber
      case 'OWNER':
        return '#A78BFA'; // Purple
      case 'RESIDENT':
      default:
        return '#38BDF8'; // Sky blue
    }
  };

  return (
    <aside
      aria-label="Community Service Navigation"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: '330px',
        maxWidth: '90vw',
        background: 'linear-gradient(180deg, #102035 0%, #173252 100%)',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        boxShadow: isMenuOpen ? '12px 0 40px rgba(0, 0, 0, 0.45)' : 'none',
        transform: isMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
        visibility: isMenuOpen ? 'visible' : 'hidden',
        pointerEvents: isMenuOpen ? 'auto' : 'none',
        transition: 'transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.32s ease, box-shadow 0.32s ease',
        willChange: 'transform',
        overflow: 'hidden',
      }}
    >
      {/* Brand Header with Close Button */}
      <div
        style={{
          padding: '1.25rem 1.125rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(0, 0, 0, 0.06) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flex: 1 }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2F8B8B 0%, #1B4D72 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 6px 16px rgba(47, 139, 139, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              flexShrink: 0,
            }}
          >
            <Building2 size={23} />
          </div>
          <div>
            <div
              style={{
                fontSize: '1.1875rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#FFFFFF',
                lineHeight: 1.15,
                whiteSpace: 'nowrap',
              }}
            >
              Community Service
            </div>
            <div
              style={{
                marginTop: '0.2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: '#38BDF8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.075em',
                  backgroundColor: 'rgba(56, 189, 248, 0.12)',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '9999px',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                }}
              >
                <span
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: '#38BDF8',
                    boxShadow: '0 0 6px #38BDF8',
                  }}
                />
                Residential Hub
              </span>
            </div>
          </div>
        </div>

        {/* Elegant Close Button */}
        <button
          type="button"
          onClick={() => dispatch(closeMenu())}
          title="Close Navigation Menu"
          aria-label="Close Navigation Menu"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.16)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
          }}
        >
          <X size={17} />
        </button>
      </div>

      {/* Role Context Tag */}
      <div
        style={{
          margin: '1rem 1.25rem 0.5rem',
          padding: '0.5rem 0.75rem',
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: '0.6875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'rgba(255, 255, 255, 0.6)',
            fontWeight: 600,
          }}
        >
          {isStaffOrAdmin ? 'Staff Operations' : 'Resident View'}
        </span>
        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: getRoleColor(),
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: '0.125rem 0.5rem',
            borderRadius: '4px',
          }}
        >
          {activeRole}
        </span>
      </div>

      {/* Navigation Links */}
      <nav
        style={{
          flex: 1,
          padding: '0.75rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.375rem',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'rgba(255, 255, 255, 0.45)',
            padding: '0.25rem 0.5rem 0.375rem',
          }}
        >
          {isStaffOrAdmin ? 'Administration & Oversight' : 'My Community Access'}
        </div>

        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => dispatch(closeMenu())}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 0.875rem',
              borderRadius: '8px',
              color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.78)',
              backgroundColor: isActive ? 'rgba(47, 139, 139, 0.32)' : 'transparent',
              borderLeft: isActive ? '3.5px solid var(--color-accent)' : '3.5px solid transparent',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.875rem',
              transition: 'all var(--transition-fast)',
              textDecoration: 'none',
              boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.15)' : 'none',
            })}
          >
            <span style={{ display: 'inline-flex', opacity: 0.9 }}>{item.icon}</span>
            <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{item.label}</span>
            {item.badge && (
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  backgroundColor:
                    item.badgeVariant === 'warning'
                      ? 'var(--color-warning)'
                      : item.badgeVariant === 'accent'
                      ? 'var(--color-accent)'
                      : 'rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  padding: '0.125rem 0.45rem',
                  borderRadius: '9999px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Role Profile Card at Bottom */}
      <div
        style={{
          padding: '1rem 1.25rem',
          backgroundColor: 'rgba(10, 20, 35, 0.55)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.875rem',
            color: '#FFFFFF',
            border: `2px solid ${getRoleColor()}`,
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            flexShrink: 0,
          }}
        >
          {currentUser.name
            .split(' ')
            .map((n) => n[0])
            .join('')}
        </div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: '#FFFFFF',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            }}
          >
            {currentUser.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '2px' }}>
            <UserCheck size={12} color={getRoleColor()} />
            <span style={{ fontSize: '0.6875rem', color: '#CBD5E1', fontWeight: 500 }}>
              {currentUser.unitId || `${activeRole} Office`}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
