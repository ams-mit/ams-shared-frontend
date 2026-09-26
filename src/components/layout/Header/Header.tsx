import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Bell,
  ChevronDown,
  Check,
  Building,
  ShieldCheck,
  Menu,
  CheckCheck,
  Megaphone,
  Wrench,
  CalendarCheck,
  Clock,
  ArrowRight,
  MapPin,
  Trash2,
  Info,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { switchUserById } from '@/features/auth/store/authSlice';
import { toggleMenu } from '@/app/store/uiSlice';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';
import { useIsMobile } from '@/components/mobile';
import { notificationApi } from '@/features/notifications/api/notificationApi';
import { BackendNotification } from '@/features/notifications/types/notification.types';

export interface AppNotification {
  id: string | number;
  type: 'maintenance' | 'security' | 'facility' | 'announcement';
  category: 'MAINTENANCE' | 'SECURITY' | 'FACILITY' | 'BULLETIN';
  priority: 'urgent' | 'high' | 'normal';
  title: string;
  summary: string;
  message: string;
  issuedBy: string;
  affectedArea?: string;
  time: string;
  isRead: boolean;
  actionRoute?: string;
  actionLabel?: string;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'maintenance',
    category: 'MAINTENANCE',
    priority: 'high',
    title: 'Quarterly Fire Alarm & Siren Verification',
    summary: 'Testing of sirens, detectors, and emergency elevators this Saturday at 10:00 AM.',
    message: 'The annual quarterly fire safety inspection, smoke detector diagnostic, and emergency siren verification will take place this Saturday from 10:00 AM to 11:30 AM across all residential towers and common corridors. Building elevators will briefly park at ground level for 10 minutes during the cycle. No resident evacuation is required.',
    issuedBy: 'Central Operations & Safety Division',
    affectedArea: 'Tower A, Tower B & Underground Parking',
    time: '15 mins ago',
    isRead: false,
    actionRoute: ROUTES.ANNOUNCEMENTS,
    actionLabel: 'View Bulletin',
  },
  {
    id: 'notif-2',
    type: 'facility',
    category: 'FACILITY',
    priority: 'normal',
    title: 'Olympic Swimming Pool Scheduled Maintenance',
    summary: 'Water purification and filtration system maintenance scheduled Monday morning.',
    message: 'The East Wing Olympic Swimming Pool & Sundeck will undergo routine water chemical balancing, filter backwash, and sanitization on Monday morning between 06:00 AM and 12:00 PM. Reservations will resume at 12:30 PM. All other residential amenities remain open.',
    issuedBy: 'Aquatics & Recreation Management',
    affectedArea: 'East Wing Courtyard Pool & Sundeck',
    time: '1 hour ago',
    isRead: false,
    actionRoute: ROUTES.FACILITIES,
    actionLabel: 'Check Facilities',
  },
  {
    id: 'notif-3',
    type: 'security',
    category: 'SECURITY',
    priority: 'normal',
    title: 'Digital Gate Entry Pass System Active',
    summary: 'Digital QR passes for pre-registered guests are live at Gate 1 and Tower checkpoints.',
    message: 'All security gate checkpoints now feature automated vector QR code scanners. When you pre-register a visitor in the Resident Portal, a scannable digital gate entry pass is automatically generated for instant arrival clearance.',
    issuedBy: 'Resident Security & Access Control',
    affectedArea: 'Main Security Gate 1 & Tower Entrances',
    time: '3 hours ago',
    isRead: false,
    actionRoute: ROUTES.VISITORS,
    actionLabel: 'Manage Guest Passes',
  },
  {
    id: 'notif-4',
    type: 'facility',
    category: 'FACILITY',
    priority: 'normal',
    title: 'Facility Booking Status: Active Review',
    summary: 'Your amenity reservation requests are monitored by management.',
    message: 'You have active reservations in the community facilities ledger. Slots are held according to apartment bylaws. Please check your reservation ledger for verification status and operating hours.',
    issuedBy: 'Facility Administration',
    affectedArea: 'Community Common Amenities',
    time: 'Yesterday',
    isRead: true,
    actionRoute: ROUTES.RESERVATIONS,
    actionLabel: 'My Bookings',
  },
];

const formatRelativeTime = (dateStr?: string): string => {
  if (!dateStr) return 'Recent';
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return 'Recent';
  }
};

const mapBackendToAppNotification = (bn: BackendNotification): AppNotification => {
  const typeLower = (bn.type || 'announcement').toLowerCase() as AppNotification['type'];
  const catUpper = (bn.category || 'BULLETIN').toUpperCase() as AppNotification['category'];
  const priorityLower = (bn.priority || 'normal').toLowerCase() as AppNotification['priority'];

  return {
    id: bn.id,
    type: (['maintenance', 'security', 'facility', 'announcement'].includes(typeLower)
      ? typeLower
      : 'announcement') as AppNotification['type'],
    category: (['MAINTENANCE', 'SECURITY', 'FACILITY', 'BULLETIN'].includes(catUpper)
      ? catUpper
      : 'BULLETIN') as AppNotification['category'],
    priority: (['urgent', 'high', 'normal'].includes(priorityLower)
      ? priorityLower
      : 'normal') as AppNotification['priority'],
    title: bn.title,
    summary: bn.summary || bn.message || '',
    message: bn.message || bn.summary || '',
    issuedBy: bn.issuedBy || 'Community Administration',
    affectedArea: bn.affectedArea,
    time: formatRelativeTime(bn.createdAt),
    isRead: bn.isRead,
    actionRoute: bn.actionRoute,
    actionLabel: bn.actionLabel,
  };
};

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentUser, availableUsers, activeRole } = useAppSelector((state) => state.auth);
  const { isMenuOpen } = useAppSelector((state) => state.ui);
  const { isMobile, isSmallMobile } = useIsMobile();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [selectedNotification, setSelectedNotification] = useState<AppNotification | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchLiveNotifications = async () => {
      try {
        const live = await notificationApi.getNotifications(currentUser.id, activeRole);
        if (isMounted && live && live.length > 0) {
          setNotifications(live.map(mapBackendToAppNotification));
        }
      } catch {
        // Fall back gracefully to existing state / demo notifications
      }
    };
    fetchLiveNotifications();
    return () => {
      isMounted = false;
    };
  }, [currentUser.id, activeRole]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await notificationApi.markAllAsRead(currentUser.id);
    } catch {
      // Handled locally
    }
  };

  const handleNotificationClick = async (notif: AppNotification) => {
    // Mark as read locally
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
    );
    // Close dropdown and open pop-up message modal
    setIsNotificationOpen(false);
    setSelectedNotification(notif);

    if (!notif.isRead) {
      try {
        await notificationApi.markAsRead(notif.id);
      } catch {
        // Handled locally
      }
    }
  };

  const getCategoryColor = (category: AppNotification['category']) => {
    switch (category) {
      case 'MAINTENANCE':
        return { bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' };
      case 'SECURITY':
        return { bg: '#E0F2FE', color: '#0369A1', border: '#BAE6FD' };
      case 'FACILITY':
        return { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' };
      case 'BULLETIN':
      default:
        return { bg: '#F1F5F9', color: '#334155', border: '#E2E8F0' };
    }
  };

  const getNotificationIcon = (type: AppNotification['type'], size = 18) => {
    switch (type) {
      case 'maintenance':
        return <Wrench size={size} color="#D97706" />;
      case 'security':
        return <ShieldCheck size={size} color="#0284C7" />;
      case 'facility':
        return <CalendarCheck size={size} color="#059669" />;
      case 'announcement':
      default:
        return <Megaphone size={size} color="#2F8B8B" />;
    }
  };

  const filteredNotifications =
    activeFilter === 'UNREAD'
      ? notifications.filter((n) => !n.isRead)
      : notifications;

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
      className="ams-header"
      style={{
        height: '66px',
        backgroundColor: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
        padding: isMobile ? '0 0.875rem' : '0 1.5rem',
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
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.5rem' : '0.875rem' }}>
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
            flexShrink: 0,
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Building size={18} color="var(--color-primary)" />
          <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.01em' }}>
            {isSmallMobile ? 'AMS' : 'AMS Community'}
          </span>
        </div>
        {currentUser.unitId && !isSmallMobile && (
          <>
            <span style={{ color: 'var(--color-text-light)' }}>/</span>
            <Badge variant="accent" size="sm">
              {currentUser.unitId}
            </Badge>
          </>
        )}
      </div>

      {/* Right section: System Mode & Role Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.5rem' : '1rem' }}>

        {/* Notification Bell with Badge */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            style={{
              position: 'relative',
              cursor: 'pointer',
              padding: '0.5rem',
              color: isNotificationOpen ? 'var(--color-accent)' : 'var(--color-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${isNotificationOpen ? 'var(--color-accent)' : 'var(--color-border)'}`,
              backgroundColor: isNotificationOpen ? 'var(--color-surface-hover)' : 'var(--color-surface)',
              transition: 'all var(--transition-fast)',
            }}
            title="Community Notifications & Alerts"
            aria-label="Open notifications"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  minWidth: '18px',
                  height: '18px',
                  padding: '0 4px',
                  borderRadius: '9999px',
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 8px rgba(239, 68, 68, 0.5)',
                  border: '2px solid #FFFFFF',
                  animation: 'pulseBadge 2s infinite',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Premium Notification Popover Panel */}
          {isNotificationOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                onClick={() => setIsNotificationOpen(false)}
              />
              <div
                style={{
                  position: 'absolute',
                  right: isMobile ? '-35px' : 0,
                  marginTop: '0.5rem',
                  width: isMobile ? 'calc(100vw - 1.5rem)' : '380px',
                  maxWidth: '380px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 12px 36px rgba(15, 23, 42, 0.16)',
                  border: '1px solid var(--color-border)',
                  zIndex: 100,
                  overflow: 'hidden',
                  animation: 'dropdownFadeIn 180ms ease-out',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Panel Header */}
                <div
                  style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid var(--color-border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'var(--color-surface)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--color-primary)' }}>
                      Notifications & Alerts
                    </span>
                    {unreadCount > 0 && (
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          backgroundColor: 'rgba(56, 189, 248, 0.15)',
                          color: '#0284C7',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '9999px',
                        }}
                      >
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-accent)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.25rem',
                      }}
                      title="Mark all as read"
                    >
                      <CheckCheck size={14} />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                <div
                  style={{
                    display: 'flex',
                    borderBottom: '1px solid var(--color-border-subtle)',
                    backgroundColor: '#F8FAFC',
                    padding: '0.25rem 0.5rem',
                    gap: '0.25rem',
                  }}
                >
                  <button
                    onClick={() => setActiveFilter('ALL')}
                    style={{
                      flex: 1,
                      padding: '0.35rem 0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: activeFilter === 'ALL' ? 700 : 500,
                      color: activeFilter === 'ALL' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      backgroundColor: activeFilter === 'ALL' ? '#FFFFFF' : 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      boxShadow: activeFilter === 'ALL' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    onClick={() => setActiveFilter('UNREAD')}
                    style={{
                      flex: 1,
                      padding: '0.35rem 0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: activeFilter === 'UNREAD' ? 700 : 500,
                      color: activeFilter === 'UNREAD' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      backgroundColor: activeFilter === 'UNREAD' ? '#FFFFFF' : 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      boxShadow: activeFilter === 'UNREAD' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    Unread ({unreadCount})
                  </button>
                </div>

                {/* Notifications Scroll List */}
                <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                  {filteredNotifications.length === 0 ? (
                    <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      <Check size={28} color="var(--color-success)" style={{ margin: '0 auto 0.5rem' }} />
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>
                        All caught up!
                      </div>
                      <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        No {activeFilter === 'UNREAD' ? 'unread ' : ''}notifications at this time.
                      </div>
                    </div>
                  ) : (
                    filteredNotifications.map((notif) => {
                      const catStyle = getCategoryColor(notif.category);
                      return (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          style={{
                            padding: '0.875rem 1.125rem',
                            borderBottom: '1px solid var(--color-border-subtle)',
                            cursor: 'pointer',
                            display: 'flex',
                            gap: '0.875rem',
                            alignItems: 'flex-start',
                            backgroundColor: notif.isRead ? '#FFFFFF' : 'rgba(47, 139, 139, 0.04)',
                            transition: 'background var(--transition-fast)',
                            position: 'relative',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = notif.isRead
                              ? '#FFFFFF'
                              : 'rgba(47, 139, 139, 0.04)';
                          }}
                        >
                          {/* Left Category Icon */}
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '10px',
                              backgroundColor: catStyle.bg,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              border: `1px solid ${catStyle.border}`,
                              marginTop: '2px',
                            }}
                          >
                            {getNotificationIcon(notif.type, 18)}
                          </div>

                          {/* Center Content */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '0.5rem',
                                marginBottom: '0.2rem',
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '0.6875rem',
                                  fontWeight: 700,
                                  color: catStyle.color,
                                  letterSpacing: '0.04em',
                                }}
                              >
                                {notif.category}
                              </span>
                              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                                {notif.time}
                              </span>
                            </div>

                            <div
                              style={{
                                fontSize: '0.84375rem',
                                fontWeight: notif.isRead ? 600 : 700,
                                color: 'var(--color-primary)',
                                lineHeight: 1.25,
                                marginBottom: '0.25rem',
                              }}
                            >
                              {notif.title}
                            </div>

                            <div
                              style={{
                                fontSize: '0.75rem',
                                color: 'var(--color-text-secondary)',
                                lineHeight: 1.35,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {notif.summary}
                            </div>
                          </div>

                          {/* Unread Dot */}
                          {!notif.isRead && (
                            <span
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--color-accent)',
                                flexShrink: 0,
                                marginTop: '6px',
                                boxShadow: '0 0 6px var(--color-accent)',
                              }}
                            />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Popover Footer */}
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--color-surface)',
                    borderTop: '1px solid var(--color-border-subtle)',
                    textAlign: 'center',
                  }}
                >
                  <button
                    onClick={() => {
                      setIsNotificationOpen(false);
                      navigate(ROUTES.ANNOUNCEMENTS);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-accent)',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <span>View All Bulletins & Notices</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Pop-up Message Modal for Selected Notification */}
        {selectedNotification && (
          <Modal
            isOpen={!!selectedNotification}
            onClose={() => setSelectedNotification(null)}
            title={selectedNotification.title}
            subtitle={`${selectedNotification.category} ADVISORY • ${selectedNotification.time}`}
            maxWidth="540px"
            footer={
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const idToDelete = selectedNotification.id;
                    setNotifications((prev) => prev.filter((n) => n.id !== idToDelete));
                    setSelectedNotification(null);
                  }}
                  leftIcon={<Trash2 size={14} />}
                >
                  Dismiss
                </Button>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedNotification(null)}>
                    Close
                  </Button>
                  {selectedNotification.actionRoute && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        const route = selectedNotification.actionRoute;
                        setSelectedNotification(null);
                        if (route) navigate(route);
                      }}
                      rightIcon={<ArrowRight size={14} />}
                    >
                      {selectedNotification.actionLabel || 'View Feature'}
                    </Button>
                  )}
                </div>
              </div>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Category & Priority Badge Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--color-surface-hover)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: getCategoryColor(selectedNotification.category).bg,
                      color: getCategoryColor(selectedNotification.category).color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {getNotificationIcon(selectedNotification.type, 20)}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        letterSpacing: '0.05em',
                        color: getCategoryColor(selectedNotification.category).color,
                      }}
                    >
                      {selectedNotification.category}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {selectedNotification.time}
                    </div>
                  </div>
                </div>

                <Badge
                  variant={
                    selectedNotification.priority === 'urgent'
                      ? 'danger'
                      : selectedNotification.priority === 'high'
                      ? 'warning'
                      : 'brand'
                  }
                  size="sm"
                >
                  {selectedNotification.priority.toUpperCase()} PRIORITY
                </Badge>
              </div>

              {/* Full Message Body */}
              <div
                style={{
                  fontSize: '0.9375rem',
                  color: 'var(--color-text)',
                  lineHeight: 1.6,
                  backgroundColor: '#FFFFFF',
                  padding: '1.125rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {selectedNotification.message}
              </div>

              {/* Metadata Ledger */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.75rem',
                  fontSize: '0.8125rem',
                }}
              >
                {selectedNotification.affectedArea && (
                  <div
                    style={{
                      padding: '0.625rem 0.875rem',
                      backgroundColor: 'var(--color-surface-hover)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <MapPin size={16} color="var(--color-accent)" />
                    <div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                        AFFECTED ZONE
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                        {selectedNotification.affectedArea}
                      </div>
                    </div>
                  </div>
                )}

                <div
                  style={{
                    padding: '0.625rem 0.875rem',
                    backgroundColor: 'var(--color-surface-hover)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Building size={16} color="var(--color-secondary)" />
                  <div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                      ISSUING AUTHORITY
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                      {selectedNotification.issuedBy}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        )}

        {/* User Persona Switcher */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            title={`Active User: ${currentUser.name} (${activeRole})`}
            aria-label="User Persona Switcher"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '0.35rem' : '0.75rem',
              padding: isMobile ? '0.35rem 0.5rem' : '0.4rem 0.75rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              boxShadow: 'var(--shadow-xs)',
              flexShrink: 0,
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
                flexShrink: 0,
              }}
            >
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            {!isMobile && (
              <div style={{ textAlign: 'left', lineHeight: 1.25 }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text)' }}>
                  {currentUser.name}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                  Role: <span style={{ fontWeight: 700, color: 'var(--color-accent)' }}>{activeRole}</span>
                </div>
              </div>
            )}
            <ChevronDown size={14} color="var(--color-text-muted)" />
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
                  width: isMobile ? '280px' : '300px',
                  maxWidth: 'calc(100vw - 1.5rem)',
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
