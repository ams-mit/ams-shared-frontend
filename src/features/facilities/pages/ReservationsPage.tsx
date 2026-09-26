import React, { useEffect, useState } from 'react';
import { PlusCircle, CalendarCheck, ShieldCheck, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/feedback/Alert';
import { LoadingState } from '@/components/feedback/LoadingState';
import { BookingTable } from '../components/BookingTable';
import { BookingModal } from '../components/BookingModal';
import { BookingStatus } from '../types/facility.types';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { useIsMobile, MobileFilterTabs, MobileTabItem } from '@/components/mobile';
import {
  fetchBookings,
  fetchFacilities,
  updateBookingStatus,
  clearFeedback,
} from '../store/facilitySlice';

export const ReservationsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { bookings, facilities, loading, actionLoading, error, successMessage } = useAppSelector(
    (state) => state.facilities
  );
  const { activeRole, currentUser } = useAppSelector((state) => state.auth);
  const { isMobile } = useIsMobile();

  const isStaffOrAdmin = activeRole === 'ADMIN' || activeRole === 'STAFF';

  // For staff: default to PENDING to quickly act on reviews; for resident: default to ALL
  const [activeTab, setActiveTab] = useState<string>(isStaffOrAdmin ? 'PENDING' : 'ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchBookings());
    dispatch(fetchFacilities());
  }, [dispatch]);

  // Adjust default tab when switching roles
  useEffect(() => {
    setActiveTab(isStaffOrAdmin ? 'PENDING' : 'ALL');
  }, [isStaffOrAdmin]);

  const handleUpdateStatus = (bookingId: number, status: BookingStatus) => {
    dispatch(clearFeedback());
    dispatch(updateBookingStatus({ bookingId, status }));
  };

  // 1. ISOLATE BY USER: If resident/owner, only show their own bookings!
  const scopedBookings = isStaffOrAdmin
    ? bookings
    : bookings.filter((b) => b.requesterId === currentUser.id);

  // 2. Filter by tab
  const filteredBookings = scopedBookings.filter((b) => {
    if (activeTab === 'ALL') return true;
    return b.status === activeTab;
  });

  // Calculate metrics for tabs
  const pendingCount = scopedBookings.filter((b) => b.status === 'PENDING').length;
  const approvedCount = scopedBookings.filter((b) => b.status === 'APPROVED').length;
  const rejectedCount = scopedBookings.filter(
    (b) => b.status === 'REJECTED' || b.status === 'CANCELLED'
  ).length;

  return (
    <PageContainer
      title={isStaffOrAdmin ? 'Facility Reservations & Staff Approvals' : 'My Amenity Reservations'}
      subtitle={
        isStaffOrAdmin
          ? 'Review, verify, and approve resident reservation requests with automatic double-booking prevention'
          : `Personal booking schedule and approval status for ${currentUser.name} (${currentUser.unitId})`
      }
      actions={
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<PlusCircle size={16} />}
        >
          Book Facility
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Context Alert */}
        {isStaffOrAdmin ? (
          <Alert
            type="warning"
            message={`Staff Authority Active (${activeRole}): You have approval authority. Pending bookings require administrative sign-off before slots are reserved.`}
          />
        ) : (
          <Alert
            type="info"
            message={`Resident Access (${currentUser.unitId}): Your reservation requests are placed in PENDING review. Once approved by management, your slot is guaranteed.`}
          />
        )}

        {/* Feedback Messages */}
        {error && <Alert type="error" message={error} onDismiss={() => dispatch(clearFeedback())} />}
        {successMessage && (
          <Alert type="success" message={successMessage} onDismiss={() => dispatch(clearFeedback())} />
        )}

        {/* Filter Navigation Tabs */}
        {isMobile ? (
          <MobileFilterTabs
            tabs={
              isStaffOrAdmin
                ? [
                    { id: 'PENDING', label: 'Pending', count: pendingCount, icon: <Clock size={14} /> },
                    { id: 'ALL', label: 'All Requests', count: scopedBookings.length, icon: <CalendarCheck size={14} /> },
                    { id: 'APPROVED', label: 'Approved', count: approvedCount, icon: <CheckCircle2 size={14} /> },
                    { id: 'REJECTED', label: 'Rejected', count: rejectedCount, icon: <AlertTriangle size={14} /> },
                  ]
                : [
                    { id: 'ALL', label: 'All Bookings', count: scopedBookings.length, icon: <CalendarCheck size={14} /> },
                    { id: 'APPROVED', label: 'Guaranteed', count: approvedCount, icon: <CheckCircle2 size={14} /> },
                    { id: 'PENDING', label: 'Pending', count: pendingCount, icon: <Clock size={14} /> },
                    { id: 'REJECTED', label: 'Cancelled', count: rejectedCount, icon: <AlertTriangle size={14} /> },
                  ]
            }
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              backgroundColor: 'var(--color-surface)',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveTab(isStaffOrAdmin ? 'PENDING' : 'ALL')}
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
                    activeTab === (isStaffOrAdmin ? 'PENDING' : 'ALL')
                      ? 'var(--color-primary)'
                      : 'transparent',
                  color:
                    activeTab === (isStaffOrAdmin ? 'PENDING' : 'ALL')
                      ? '#FFFFFF'
                      : 'var(--color-text-secondary)',
                  border: 'none',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {isStaffOrAdmin ? (
                  <>
                    <Clock size={15} />
                    <span>Pending Review</span>
                    <span
                      style={{
                        backgroundColor:
                          activeTab === 'PENDING' ? 'var(--color-warning)' : 'var(--color-warning-bg)',
                        color: activeTab === 'PENDING' ? '#FFFFFF' : 'var(--color-warning-text)',
                        padding: '0.125rem 0.4rem',
                        borderRadius: '9999px',
                        fontSize: '0.6875rem',
                      }}
                    >
                      {pendingCount}
                    </span>
                  </>
                ) : (
                  <>
                    <CalendarCheck size={15} />
                    <span>All My Reservations ({scopedBookings.length})</span>
                  </>
                )}
              </button>

              {isStaffOrAdmin && (
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
                  <span>All Complex Bookings ({scopedBookings.length})</span>
                </button>
              )}

              {!isStaffOrAdmin && (
                <button
                  onClick={() => setActiveTab('PENDING')}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    backgroundColor: activeTab === 'PENDING' ? 'var(--color-primary)' : 'transparent',
                    color: activeTab === 'PENDING' ? '#FFFFFF' : 'var(--color-text-secondary)',
                    border: 'none',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <Clock size={15} />
                  <span>Pending Review ({pendingCount})</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('APPROVED')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'APPROVED' ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === 'APPROVED' ? '#FFFFFF' : 'var(--color-text-secondary)',
                  border: 'none',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <CheckCircle2 size={15} />
                <span>Confirmed ({approvedCount})</span>
              </button>

              <button
                onClick={() => setActiveTab('REJECTED')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'REJECTED' ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === 'REJECTED' ? '#FFFFFF' : 'var(--color-text-secondary)',
                  border: 'none',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <AlertTriangle size={15} />
                <span>Rejected / Cancelled ({rejectedCount})</span>
              </button>
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', paddingRight: '0.5rem' }}>
              Showing <strong>{filteredBookings.length}</strong> records
            </div>
          </div>
        )}

        {/* Bookings Ledger */}
        {loading && bookings.length === 0 ? (
          <LoadingState message="Fetching reservations ledger..." />
        ) : (
          <BookingTable
            bookings={filteredBookings}
            isLoading={loading}
            onUpdateStatus={handleUpdateStatus}
            actionLoading={actionLoading}
          />
        )}

        {/* Modal */}
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          facilities={facilities}
        />
      </div>
    </PageContainer>
  );
};
