import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  CalendarCheck,
  Users,
  Megaphone,
  PlusCircle,
  ShieldCheck,
  Clock,
  ArrowRight,
  BadgeCheck,
  KeyRound,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { StatCard } from '../components/StatCard';
import { QuickActionCard } from '../components/QuickActionCard';
import { ActivityTimeline, ActivityItem } from '../components/ActivityTimeline';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ROUTES } from '@/constants/routes';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchFacilities, fetchBookings } from '@/features/facilities/store/facilitySlice';
import { fetchVisitors } from '@/features/visitors/store/visitorSlice';
import { fetchAnnouncements } from '@/features/announcements/store/announcementSlice';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { facilities, bookings } = useAppSelector((state) => state.facilities);
  const { visitors } = useAppSelector((state) => state.visitors);
  const { announcements } = useAppSelector((state) => state.announcements);
  const { activeRole, currentUser } = useAppSelector((state) => state.auth);

  const isStaffOrAdmin = activeRole === 'STAFF' || activeRole === 'ADMIN';

  useEffect(() => {
    dispatch(fetchFacilities());
    dispatch(fetchBookings());
    dispatch(fetchVisitors());
    dispatch(fetchAnnouncements(activeRole));
  }, [dispatch, activeRole]);

  // Derived statistics - SCOPED ACCORDING TO ROLE!
  const activeFacilitiesCount = facilities.filter((f) => f.status === 'ACTIVE').length;

  // Staff sees complex-wide statistics; Resident sees their own personal statistics
  const pendingApprovalsCount = bookings.filter((b) => b.status === 'PENDING').length;
  const myBookings = bookings.filter((b) => b.requesterId === currentUser.id);
  const myPendingBookings = myBookings.filter((b) => b.status === 'PENDING').length;
  const myApprovedBookings = myBookings.filter((b) => b.status === 'APPROVED').length;

  const totalExpectedVisitors = visitors.filter((v) => v.status === 'EXPECTED').length;
  const totalCheckedInVisitors = visitors.filter((v) => v.status === 'CHECKED_IN').length;
  const myVisitors = visitors.filter((v) => v.residentId === currentUser.id);
  const myExpectedVisitors = myVisitors.filter((v) => v.status === 'EXPECTED').length;

  const relevantAnnouncements = announcements.filter(
    (a) => a.targetRole === 'ALL' || a.targetRole.toUpperCase() === activeRole.toUpperCase()
  );

  const activities: ActivityItem[] = isStaffOrAdmin
    ? [
        {
          id: 'act-1',
          type: 'visitor',
          title: 'Arthur Dent Gate Check-in',
          description: 'Cleared through Security Gate A for Unit Tower A - 402',
          time: '10 mins ago',
        },
        {
          id: 'act-2',
          type: 'booking',
          title: 'Grand Banquet Hall Booking Request',
          description: 'Submitted by resident-001 (Awaiting staff review)',
          time: '45 mins ago',
        },
        {
          id: 'act-3',
          type: 'announcement',
          title: 'Quarterly Fire Alarm & Safety Notice',
          description: 'Broadcast active to ALL building occupants',
          time: '2 hours ago',
        },
        {
          id: 'act-4',
          type: 'booking',
          title: 'Olympic Swimming Pool Reservation',
          description: 'Status: PENDING approval by operations team',
          time: 'Yesterday',
        },
      ]
    : [
        {
          id: 'act-res-1',
          type: 'visitor',
          title: 'Guest Pre-Registration Active',
          description: `QR Pass issued for your guest Arthur Dent (${currentUser.unitId})`,
          time: 'Today',
        },
        {
          id: 'act-res-2',
          type: 'booking',
          title: 'Amenity Reservation Status',
          description: 'Banquet Hall reservation is currently under review by management',
          time: 'Yesterday',
        },
        {
          id: 'act-res-3',
          type: 'announcement',
          title: 'Swimming Pool Maintenance Notice',
          description: 'Notice for residents regarding scheduled cleaning',
          time: '2 days ago',
        },
      ];

  const recentBookingsToDisplay = isStaffOrAdmin
    ? bookings.slice(0, 4)
    : myBookings.slice(0, 4);

  return (
    <PageContainer
      title={isStaffOrAdmin ? 'Operations & Security Command Hub' : 'My Community Resident Portal'}
      subtitle={
        isStaffOrAdmin
          ? `Welcome, ${currentUser.name} (${activeRole}) • Overseeing facilities, gate clearance, and approvals`
          : `Welcome home, ${currentUser.name} • Residence: ${currentUser.unitId || 'Tower A - 402'}`
      }
      actions={
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(ROUTES.VISITORS)}
            leftIcon={<Users size={16} />}
          >
            {isStaffOrAdmin ? 'Gate Roster' : 'Pre-Register Guest'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(ROUTES.FACILITIES)}
            leftIcon={<PlusCircle size={16} />}
          >
            Book Amenity
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Premium Persona Welcome Hero Banner */}
        <div
          style={{
            background: isStaffOrAdmin
              ? 'linear-gradient(135deg, #1E3A5F 0%, #2A4D7A 100%)'
              : 'linear-gradient(135deg, #1E3A5F 0%, #2F8B8B 100%)',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '1.75rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-md)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ zIndex: 1, maxWidth: '650px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: isStaffOrAdmin ? '#FDE68A' : '#A7F3D0',
                marginBottom: '0.5rem',
              }}
            >
              <BadgeCheck size={14} />
              <span>{isStaffOrAdmin ? 'AMS Staff Administration Mode' : 'Verified Resident Portal'}</span>
            </div>
            <h2 style={{ color: '#FFFFFF', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {isStaffOrAdmin
                ? `${currentUser.name} — Shift Duty Active`
                : `Good day, ${currentUser.name}`}
            </h2>
            <p style={{ color: '#E2E8F0', fontSize: '0.875rem', marginTop: '0.375rem', lineHeight: 1.5 }}>
              {isStaffOrAdmin
                ? `You have ${pendingApprovalsCount} facility reservation requests requiring approval and ${totalExpectedVisitors} visitors scheduled for entrance today.`
                : `You currently have ${myApprovedBookings} confirmed amenity bookings and ${myExpectedVisitors} pre-registered guests awaiting gate clearance.`}
            </p>
          </div>

          <div
            style={{
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '0.5rem',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)',
                padding: '0.375rem 0.875rem',
                borderRadius: '9999px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              {currentUser.unitId || `Role: ${activeRole}`}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(isStaffOrAdmin ? ROUTES.RESERVATIONS : ROUTES.FACILITIES)}
              style={{
                backgroundColor: '#FFFFFF',
                color: 'var(--color-primary)',
                fontWeight: 700,
                border: 'none',
              }}
            >
              {isStaffOrAdmin ? 'Process Approvals' : 'Browse Amenities'}
            </Button>
          </div>
        </div>

        {/* Dynamic Role-Based KPI Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {isStaffOrAdmin ? (
            <>
              <StatCard
                title="Pending Approvals"
                value={pendingApprovalsCount}
                subtitle="Resident reservation requests"
                icon={<Clock size={24} />}
                trend={pendingApprovalsCount > 0 ? 'Requires Staff Sign-off' : 'Queue Clear'}
                trendPositive={pendingApprovalsCount === 0}
                onClick={() => navigate(ROUTES.RESERVATIONS)}
                actionText="Review Queue →"
              />
              <StatCard
                title="Active Amenities"
                value={`${activeFacilitiesCount} / ${facilities.length}`}
                subtitle="Bookable community facilities"
                icon={<Building2 size={24} />}
                trend="All systems operational"
                trendPositive
                onClick={() => navigate(ROUTES.FACILITIES)}
                actionText="Inspect Facilities →"
              />
              <StatCard
                title="Expected Visitors"
                value={totalExpectedVisitors}
                subtitle={`${totalCheckedInVisitors} already checked in today`}
                icon={<ShieldCheck size={24} />}
                trend="Security Gate Checkpoint"
                trendPositive
                onClick={() => navigate(ROUTES.VISITORS)}
                actionText="Gate Roster →"
              />
              <StatCard
                title="Active Circulars"
                value={announcements.length}
                subtitle="Complex-wide bulletins"
                icon={<Megaphone size={24} />}
                trend="Real-time Broadcast"
                trendPositive
                onClick={() => navigate(ROUTES.ANNOUNCEMENTS)}
                actionText="Broadcasts →"
              />
            </>
          ) : (
            <>
              <StatCard
                title="My Reservations"
                value={myBookings.length}
                subtitle={`${myApprovedBookings} confirmed • ${myPendingBookings} in review`}
                icon={<CalendarCheck size={24} />}
                trend={myApprovedBookings > 0 ? 'Guaranteed Slots' : 'No active bookings'}
                trendPositive={myApprovedBookings > 0}
                onClick={() => navigate(ROUTES.RESERVATIONS)}
                actionText="View Bookings →"
              />
              <StatCard
                title="Available Amenities"
                value={activeFacilitiesCount}
                subtitle="Clubhouse, pool, tennis courts"
                icon={<Building2 size={24} />}
                trend="Ready for Booking"
                trendPositive
                onClick={() => navigate(ROUTES.FACILITIES)}
                actionText="Book Amenity →"
              />
              <StatCard
                title="My Registered Guests"
                value={myVisitors.length}
                subtitle={`${myExpectedVisitors} expected with QR passes`}
                icon={<Users size={24} />}
                trend="Digital Gate Passes Active"
                trendPositive
                onClick={() => navigate(ROUTES.VISITORS)}
                actionText="Guest Passes →"
              />
              <StatCard
                title="Community Bulletins"
                value={relevantAnnouncements.length}
                subtitle="Notices for residents"
                icon={<Megaphone size={24} />}
                trend="Latest Notices"
                trendPositive
                onClick={() => navigate(ROUTES.ANNOUNCEMENTS)}
                actionText="Read Notices →"
              />
            </>
          )}
        </div>

        {/* Action Highlights & Fast Links */}
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '1rem' }}>
            {isStaffOrAdmin ? 'Operations Management Shortcuts' : 'Resident Quick Services'}
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
              gap: '1.25rem',
            }}
          >
            <QuickActionCard
              title="Reserve Community Amenities"
              description="Clubhouse, tennis courts, pool slots, meeting halls"
              icon={<Building2 size={22} />}
              onClick={() => navigate(ROUTES.FACILITIES)}
            />

            {isStaffOrAdmin ? (
              <QuickActionCard
                title="Review Booking Approvals"
                description={`${pendingApprovalsCount} pending bookings requiring decision`}
                icon={<Clock size={22} />}
                onClick={() => navigate(ROUTES.RESERVATIONS)}
              />
            ) : (
              <QuickActionCard
                title="View My Reservations"
                description={`Check schedule & review status for ${myBookings.length} bookings`}
                icon={<CalendarCheck size={22} />}
                onClick={() => navigate(ROUTES.RESERVATIONS)}
              />
            )}

            {isStaffOrAdmin ? (
              <QuickActionCard
                title="Security Gate Checkpoint"
                description="Live barrier roster and visitor check-in controls"
                icon={<ShieldCheck size={22} />}
                onClick={() => navigate(ROUTES.VISITORS)}
              />
            ) : (
              <QuickActionCard
                title="Pre-Register Guests & Passes"
                description="Issue instant digital QR gate passes for your visitors"
                icon={<KeyRound size={22} />}
                onClick={() => navigate(ROUTES.VISITORS)}
              />
            )}

            <QuickActionCard
              title={isStaffOrAdmin ? 'Broadcast Notice' : 'Notice Board'}
              description={
                isStaffOrAdmin
                  ? 'Publish role-targeted circulars and maintenance alerts'
                  : 'Read official apartment notices and safety circulars'
              }
              icon={<Megaphone size={22} />}
              onClick={() => navigate(ROUTES.ANNOUNCEMENTS)}
            />
          </div>
        </div>

        {/* Split Grid: Recent Ledger vs Activity Stream */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {/* Recent Reservations Spotlight */}
          <Card
            title={isStaffOrAdmin ? 'Pending Approval Requests' : 'My Recent Reservations'}
            subtitle={
              isStaffOrAdmin
                ? 'Review queue for resident facility bookings'
                : `Personal booking schedule for ${currentUser.name}`
            }
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(ROUTES.RESERVATIONS)}
                rightIcon={<ArrowRight size={14} />}
              >
                View Full Ledger
              </Button>
            }
          >
            {recentBookingsToDisplay.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                {isStaffOrAdmin
                  ? 'No pending reservation requests in queue.'
                  : 'You have not made any bookings yet.'}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recentBookingsToDisplay.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => navigate(ROUTES.RESERVATIONS)}
                    title="Click to view reservation in reservations queue"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.875rem 1rem',
                      backgroundColor: 'var(--color-surface-hover)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border-subtle)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-surface-sunken)';
                      e.currentTarget.style.borderColor = 'var(--color-accent)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
                      e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                        {b.facilityName}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.75rem',
                          color: 'var(--color-text-muted)',
                          marginTop: '0.25rem',
                        }}
                      >
                        <Clock size={13} />
                        <span>
                          {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                          {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {b.attendeeCount && (
                          <>
                            <span>•</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: 'var(--color-secondary)' }}>
                              <Users size={12} color="var(--color-accent)" />
                              <span>{b.attendeeCount} Guests</span>
                            </span>
                          </>
                        )}
                        {isStaffOrAdmin && (
                          <>
                            <span>•</span>
                            <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                              Requester: {b.requesterId}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <Badge
                        variant={
                          b.status === 'APPROVED'
                            ? 'success'
                            : b.status === 'PENDING'
                            ? 'warning'
                            : 'danger'
                        }
                        size="sm"
                        dot
                      >
                        {b.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Activity Stream */}
          <ActivityTimeline activities={activities} />
        </div>
      </div>
    </PageContainer>
  );
};
