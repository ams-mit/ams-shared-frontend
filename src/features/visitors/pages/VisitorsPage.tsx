import React, { useEffect, useState } from 'react';
import { UserPlus, Search, ShieldCheck, QrCode, CheckCircle2, Clock, Users } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/feedback/Alert';
import { LoadingState } from '@/components/feedback/LoadingState';
import { VisitorTable } from '../components/VisitorTable';
import { VisitorFormModal } from '../components/VisitorFormModal';
import { VisitorPassCard } from '../components/VisitorPassCard';
import { Visitor } from '../types/visitor.types';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchVisitors, checkInVisitor, clearVisitorFeedback } from '../store/visitorSlice';

export const VisitorsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { visitors, loading, actionLoading, error, successMessage } = useAppSelector(
    (state) => state.visitors
  );
  const { activeRole, currentUser } = useAppSelector((state) => state.auth);

  const isSecurityStaff = activeRole === 'STAFF' || activeRole === 'ADMIN';

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<string>(isSecurityStaff ? 'EXPECTED' : 'ALL');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedPassVisitor, setSelectedPassVisitor] = useState<Visitor | null>(null);

  useEffect(() => {
    dispatch(fetchVisitors());
  }, [dispatch]);

  // Adjust default tab when switching roles
  useEffect(() => {
    setActiveTab(isSecurityStaff ? 'EXPECTED' : 'ALL');
  }, [isSecurityStaff]);

  const handleCheckIn = (visitorId: number) => {
    dispatch(clearVisitorFeedback());
    dispatch(checkInVisitor(visitorId));
  };

  const handleViewPass = (visitor: Visitor) => {
    setSelectedPassVisitor(visitor);
  };

  // 1. ISOLATE BY USER: If resident/owner, only show their own visitors!
  const scopedVisitors = isSecurityStaff
    ? visitors
    : visitors.filter((v) => v.residentId === currentUser.id);

  // 2. Filter by search and tab
  const filteredVisitors = scopedVisitors.filter((v) => {
    const matchesSearch =
      v.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.unitId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.purpose.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab = activeTab === 'ALL' || v.status === activeTab;

    return matchesSearch && matchesTab;
  });

  const expectedCount = scopedVisitors.filter((v) => v.status === 'EXPECTED').length;
  const checkedInCount = scopedVisitors.filter((v) => v.status === 'CHECKED_IN').length;

  return (
    <PageContainer
      title={
        isSecurityStaff
          ? 'Security Gate Checkpoint & Visitor Roster'
          : 'My Guest Passes & Pre-Registration'
      }
      subtitle={
        isSecurityStaff
          ? 'Live entrance checkpoint control and timestamp verification across all apartment towers'
          : `Pre-registered visitors and digital QR entry permits for ${currentUser.name} (${currentUser.unitId})`
      }
      actions={
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsRegisterModalOpen(true)}
          leftIcon={<UserPlus size={16} />}
        >
          {isSecurityStaff ? 'Log New Visitor' : 'Pre-Register Guest'}
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Context Alert */}
        {isSecurityStaff ? (
          <Alert
            type="info"
            message={`Security Control Station (${activeRole}): Verify incoming visitor ID against expected arrivals and tap 'Check In' to record official gate entry timestamp.`}
          />
        ) : (
          <Alert
            type="info"
            message={`Resident Pre-Registration (${currentUser.unitId}): Guests you pre-register will receive a digital QR pass for fast clearance at the security entrance.`}
          />
        )}

        {/* Feedback messages */}
        {error && (
          <Alert type="error" message={error} onDismiss={() => dispatch(clearVisitorFeedback())} />
        )}
        {successMessage && (
          <Alert
            type="success"
            message={successMessage}
            onDismiss={() => dispatch(clearVisitorFeedback())}
          />
        )}

        {/* Filter Navigation Bar & Search */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            backgroundColor: 'var(--color-surface)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab(isSecurityStaff ? 'EXPECTED' : 'ALL')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                backgroundColor:
                  activeTab === (isSecurityStaff ? 'EXPECTED' : 'ALL')
                    ? 'var(--color-primary)'
                    : 'transparent',
                color:
                  activeTab === (isSecurityStaff ? 'EXPECTED' : 'ALL')
                    ? '#FFFFFF'
                    : 'var(--color-text-secondary)',
                border: 'none',
                transition: 'all var(--transition-fast)',
              }}
            >
              {isSecurityStaff ? (
                <>
                  <Clock size={15} />
                  <span>Expected Today (Checkpoint)</span>
                  <span
                    style={{
                      backgroundColor:
                        activeTab === 'EXPECTED' ? 'var(--color-accent)' : 'var(--color-accent-light)',
                      color: activeTab === 'EXPECTED' ? '#FFFFFF' : 'var(--color-accent-active)',
                      padding: '0.125rem 0.4rem',
                      borderRadius: '9999px',
                      fontSize: '0.6875rem',
                    }}
                  >
                    {expectedCount}
                  </span>
                </>
              ) : (
                <>
                  <Users size={15} />
                  <span>All My Guests ({scopedVisitors.length})</span>
                </>
              )}
            </button>

            {isSecurityStaff && (
              <button
                onClick={() => setActiveTab('ALL')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'ALL' ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === 'ALL' ? '#FFFFFF' : 'var(--color-text-secondary)',
                  border: 'none',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <span>All Complex Guests ({scopedVisitors.length})</span>
              </button>
            )}

            {!isSecurityStaff && (
              <button
                onClick={() => setActiveTab('EXPECTED')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'EXPECTED' ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === 'EXPECTED' ? '#FFFFFF' : 'var(--color-text-secondary)',
                  border: 'none',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <Clock size={15} />
                <span>Expected Arrivals ({expectedCount})</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('CHECKED_IN')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                backgroundColor: activeTab === 'CHECKED_IN' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'CHECKED_IN' ? '#FFFFFF' : 'var(--color-text-secondary)',
                border: 'none',
                transition: 'all var(--transition-fast)',
              }}
            >
              <CheckCircle2 size={15} />
              <span>Checked In ({checkedInCount})</span>
            </button>
          </div>

          {/* Search */}
          <div style={{ width: '280px' }}>
            <Input
              placeholder={isSecurityStaff ? 'Search guest, unit, or purpose...' : 'Search my visitors...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search size={15} />}
            />
          </div>
        </div>

        {/* Visitor Table */}
        {loading && visitors.length === 0 ? (
          <LoadingState message="Fetching gate checkpoint roster..." />
        ) : (
          <VisitorTable
            visitors={filteredVisitors}
            isLoading={loading}
            onCheckIn={handleCheckIn}
            onViewPass={handleViewPass}
            actionLoading={actionLoading}
          />
        )}

        {/* Pre-Register Modal */}
        <VisitorFormModal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
        />

        {/* QR Pass Card Preview Modal */}
        <VisitorPassCard
          visitor={selectedPassVisitor}
          isOpen={!!selectedPassVisitor}
          onClose={() => setSelectedPassVisitor(null)}
        />
      </div>
    </PageContainer>
  );
};
