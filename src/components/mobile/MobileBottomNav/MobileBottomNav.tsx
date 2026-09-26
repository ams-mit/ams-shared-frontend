import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  Users,
  ShieldCheck,
  Megaphone,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useAppSelector } from '@/app/store/hooks';
import './MobileBottomNav.css';

export const MobileBottomNav: React.FC = () => {
  const { activeRole, currentUser } = useAppSelector((state) => state.auth);
  const { bookings } = useAppSelector((state) => state.facilities);
  const { visitors } = useAppSelector((state) => state.visitors);
  const isStaffOrAdmin = activeRole === 'STAFF' || activeRole === 'ADMIN';

  // Badge calculations
  const pendingApprovalsCount = bookings.filter((b) => b.status === 'PENDING').length;
  const myPendingCount = bookings.filter(
    (b) => b.requesterId === currentUser.id && b.status === 'PENDING'
  ).length;
  const expectedVisitorsCount = isStaffOrAdmin
    ? visitors.filter((v) => v.status === 'EXPECTED').length
    : visitors.filter((v) => v.residentId === currentUser.id && v.status === 'EXPECTED').length;

  const navItems = [
    {
      to: ROUTES.DASHBOARD,
      label: 'Home',
      icon: <LayoutDashboard size={20} />,
      end: true,
    },
    {
      to: ROUTES.FACILITIES,
      label: 'Amenities',
      icon: <Building2 size={20} />,
    },
    {
      to: ROUTES.RESERVATIONS,
      label: isStaffOrAdmin ? 'Approvals' : 'Bookings',
      icon: <CalendarCheck size={20} />,
      badge: isStaffOrAdmin
        ? pendingApprovalsCount > 0
          ? pendingApprovalsCount
          : undefined
        : myPendingCount > 0
        ? myPendingCount
        : undefined,
      badgeVariant: isStaffOrAdmin ? 'warning' : 'default',
    },
    {
      to: ROUTES.VISITORS,
      label: isStaffOrAdmin ? 'Gate Pass' : 'Guests',
      icon: isStaffOrAdmin ? <ShieldCheck size={20} /> : <Users size={20} />,
      badge: expectedVisitorsCount > 0 ? expectedVisitorsCount : undefined,
    },
    {
      to: ROUTES.ANNOUNCEMENTS,
      label: 'Notices',
      icon: <Megaphone size={20} />,
    },
  ];

  return (
    <nav className="ams-mobile-bottom-nav" aria-label="Mobile Navigation">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `ams-mobile-bottom-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <div className="ams-mobile-nav-icon-container">
            {item.icon}
            {item.badge !== undefined && item.badge > 0 && (
              <span
                className={`ams-mobile-nav-badge ${
                  item.badgeVariant === 'warning' ? 'warning' : ''
                }`}
              >
                {item.badge}
              </span>
            )}
          </div>
          <span className="ams-mobile-nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
