import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/store/hooks';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';
import {
  Building2,
  CalendarCheck,
  Users,
  Megaphone,
  Home,
  ChevronRight,
  ArrowRight,
  QrCode,
  Clock,
  User,
} from 'lucide-react';
import type { User as UserType } from '@/features/auth/store/authSlice';

interface ResidentDashboardProps {
  user: UserType | null;
}

export const ResidentDashboard: React.FC<ResidentDashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const { currentUser } = useAppSelector((state) => state.auth);
  const { bookings } = useAppSelector((state) => state.facilities);
  const { visitors } = useAppSelector((state) => state.visitors);
  const { announcements } = useAppSelector((state) => state.announcements);

  const effectiveUser = user || currentUser;
  const userName = effectiveUser?.name || 'Resident';
  const unitDisplay = effectiveUser?.unitId || 'Tower A - 402';

  // Live filtered metrics
  const myBookings = bookings.filter(
    (b) => b.requesterId === effectiveUser.id || b.requesterName?.toLowerCase() === userName.toLowerCase()
  );
  const myUpcomingBookings = myBookings.filter((b) => b.status === 'APPROVED' || b.status === 'PENDING');

  const myVisitors = visitors.filter(
    (v) => v.residentId === effectiveUser.id
  );
  const myExpectedVisitors = myVisitors.filter((v) => v.status === 'EXPECTED');

  const recentBulletins = announcements.slice(0, 3);

  return (
    <PageContainer
      title="Resident Community Portal"
      subtitle={`Welcome back, ${userName}. Overview of apartment amenities, guest passes, and community circulars.`}
      actions={
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            leftIcon={<Building2 size={16} />}
            onClick={() => navigate(ROUTES.FACILITIES)}
          >
            Explore Amenities
          </Button>
          <Button
            variant="outline"
            leftIcon={<QrCode size={16} />}
            onClick={() => navigate(ROUTES.VISITORS)}
          >
            New Guest Pass
          </Button>
        </div>
      }
    >
      {/* Key Metric Overview Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.75rem',
        }}
      >
        {/* Card 1: My Unit */}
        <Card hoverable onClick={() => navigate(ROUTES.RESIDENTS)}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Assigned Residence
              </div>
              <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '4px' }}>
                {unitDisplay}
              </div>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'rgba(30, 58, 95, 0.08)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Home size={20} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Badge variant="success">Active Resident</Badge>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Verified Tenancy</span>
          </div>
        </Card>

        {/* Card 2: Amenity Reservations */}
        <Card hoverable onClick={() => navigate(ROUTES.RESERVATIONS)}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                My Amenity Bookings
              </div>
              <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--color-accent)', marginTop: '4px' }}>
                {myUpcomingBookings.length} Active
              </div>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'rgba(13, 148, 136, 0.1)',
                color: 'var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CalendarCheck size={20} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>Pool, Gym & Clubhouse</span>
            <span>slots</span>
          </div>
        </Card>

        {/* Card 3: Guest & Visitor Passes */}
        <Card hoverable onClick={() => navigate(ROUTES.VISITORS)}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Expected Visitor Passes
              </div>
              <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#0284C7', marginTop: '4px' }}>
                {myExpectedVisitors.length} Registered
              </div>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'rgba(2, 132, 199, 0.1)',
                color: '#0284C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={20} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            <Badge variant="accent">Digital Gate QR</Badge>
          </div>
        </Card>

        {/* Card 4: Community Announcements */}
        <Card hoverable onClick={() => navigate(ROUTES.ANNOUNCEMENTS)}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Community Bulletins
              </div>
              <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#D97706', marginTop: '4px' }}>
                {announcements.length} Published
              </div>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'rgba(217, 119, 6, 0.1)',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Megaphone size={20} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            <span style={{ color: '#D97706', fontWeight: 600 }}>Official circulars</span> active
          </div>
        </Card>
      </div>

      {/* Main Grid: Resident Service Modules & Recent Circulars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column: Quick Resident Services */}
        <Card
          title="Resident Self-Service Hub"
          subtitle="Explore community amenities, visitor passes, and residency details"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {/* Feature 1: Explore & Book Amenities */}
            <div
              onClick={() => navigate(ROUTES.FACILITIES)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-accent)';
                e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.backgroundColor = 'var(--color-surface)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(13, 148, 136, 0.1)',
                    color: 'var(--color-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Building2 size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text)' }}>
                    Amenities & Facilities
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    Reserve swimming pool, tennis court, gym, and rooftop lounge
                  </div>
                </div>
              </div>
              <ChevronRight size={18} color="var(--color-text-muted)" />
            </div>

            {/* Feature 2: Visitor Gate Passes */}
            <div
              onClick={() => navigate(ROUTES.VISITORS)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-accent)';
                e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.backgroundColor = 'var(--color-surface)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(2, 132, 199, 0.1)',
                    color: '#0284C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <QrCode size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text)' }}>
                    My Guest Passes (QR Entry)
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    Pre-register incoming visitors for instant security checkpoint clearance
                  </div>
                </div>
              </div>
              <ChevronRight size={18} color="var(--color-text-muted)" />
            </div>

            {/* Feature 3: Announcements */}
            <div
              onClick={() => navigate(ROUTES.ANNOUNCEMENTS)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-accent)';
                e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.backgroundColor = 'var(--color-surface)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(217, 119, 6, 0.1)',
                    color: '#D97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Megaphone size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text)' }}>
                    Community Circulars
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    Stay informed with official apartment bulletins and safety advisories
                  </div>
                </div>
              </div>
              <ChevronRight size={18} color="var(--color-text-muted)" />
            </div>

            {/* Feature 4: Residents Directory */}
            <div
              onClick={() => navigate(ROUTES.RESIDENTS)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-accent)';
                e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.backgroundColor = 'var(--color-surface)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: '#10B981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Users size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text)' }}>
                    Residents Directory
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    Connect with neighbors and view building occupancy directory
                  </div>
                </div>
              </div>
              <ChevronRight size={18} color="var(--color-text-muted)" />
            </div>

            {/* Feature 5: My Profile & Account */}
            <div
              onClick={() => navigate(ROUTES.PROFILE)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-accent)';
                e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.backgroundColor = 'var(--color-surface)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(30, 58, 95, 0.08)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <User size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text)' }}>
                    My Profile & Password
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    Manage account email, contact phone, and security credentials
                  </div>
                </div>
              </div>
              <ChevronRight size={18} color="var(--color-text-muted)" />
            </div>
          </div>
        </Card>

        {/* Right Column: Latest Circulars & Announcements Preview */}
        <Card
          title="Community Broadcasts & Circulars"
          subtitle="Official building announcements and scheduled maintenance"
          action={
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ArrowRight size={14} />}
              onClick={() => navigate(ROUTES.ANNOUNCEMENTS)}
            >
              View All
            </Button>
          }
        >
          {recentBulletins.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              No circulars posted at this time.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {recentBulletins.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(ROUTES.ANNOUNCEMENTS)}
                  style={{
                    padding: '0.875rem 1rem',
                    borderRadius: '8px',
                    backgroundColor: 'var(--color-surface-hover, #F8FAFC)',
                    border: '1px solid var(--color-border-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border-subtle)')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                      {item.category || 'BULLETIN'}
                    </span>
                    <Badge variant={item.priority === 'HIGH' ? 'danger' : 'neutral'} size="sm">
                      {item.priority}
                    </Badge>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.3 }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={12} />
                    <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </PageContainer>
  );
};

export default ResidentDashboard;
