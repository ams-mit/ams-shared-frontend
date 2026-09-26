import React, { useEffect, useState } from 'react';
import { PlusCircle, Building2 } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { FacilityCard } from '../components/FacilityCard';
import { FacilityFilter } from '../components/FacilityFilter';
import { BookingModal } from '../components/BookingModal';
import { FacilityFormModal } from '../components/FacilityFormModal';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';
import { Alert } from '@/components/feedback/Alert';
import { Facility } from '../types/facility.types';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchFacilities, toggleFacilityStatus, clearFeedback } from '../store/facilitySlice';

export const FacilitiesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { facilities, loading, error, successMessage } = useAppSelector((state) => state.facilities);
  const { activeRole } = useAppSelector((state) => state.auth);

  const isStaffOrAdmin = activeRole === 'ADMIN' || activeRole === 'STAFF';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  // Facility Create / Edit modal state
  const [isFacilityFormModalOpen, setIsFacilityFormModalOpen] = useState(false);
  const [facilityToEdit, setFacilityToEdit] = useState<Facility | null>(null);

  useEffect(() => {
    dispatch(fetchFacilities());
  }, [dispatch]);

  const handleBook = (facility: Facility) => {
    setSelectedFacility(facility);
    setIsModalOpen(true);
  };

  const handleOpenGeneralBooking = () => {
    setSelectedFacility(null);
    setIsModalOpen(true);
  };

  const handleCreateFacility = () => {
    setFacilityToEdit(null);
    setIsFacilityFormModalOpen(true);
  };

  const handleEditFacility = (facility: Facility) => {
    setFacilityToEdit(facility);
    setIsFacilityFormModalOpen(true);
  };

  const handleToggleStatus = (facility: Facility) => {
    dispatch(toggleFacilityStatus({ id: facility.id }));
  };

  // Filter facilities
  const filteredFacilities = facilities.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <PageContainer
      title="Community Facilities & Amenities"
      subtitle="Discover, inspect, and reserve shared apartment amenities and recreation venues"
      actions={
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {isStaffOrAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateFacility}
              leftIcon={<Building2 size={16} />}
            >
              Add Facility
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenGeneralBooking}
            leftIcon={<PlusCircle size={16} />}
          >
            New Reservation
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Feedback messages */}
        {error && <Alert type="error" message={error} onDismiss={() => dispatch(clearFeedback())} />}
        {successMessage && <Alert type="success" message={successMessage} onDismiss={() => dispatch(clearFeedback())} />}

        {/* Search & Filter Bar */}
        <FacilityFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        {/* Content State Handling */}
        {loading && facilities.length === 0 ? (
          <LoadingState message="Fetching community facilities..." />
        ) : error && facilities.length === 0 ? (
          <ErrorMessage
            title="Failed to load facilities"
            message={error}
            onRetry={() => dispatch(fetchFacilities())}
          />
        ) : filteredFacilities.length === 0 ? (
          <EmptyState
            title="No facilities found"
            description="No amenities match your current search criteria. Try modifying your search or filter."
            actionText="Clear Filters"
            onAction={() => {
              setSearchTerm('');
              setStatusFilter('ALL');
            }}
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
              gap: '1.25rem',
            }}
          >
            {filteredFacilities.map((facility) => (
              <FacilityCard
                key={facility.id}
                facility={facility}
                onBook={handleBook}
                onEdit={handleEditFacility}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}

        {/* Booking Form Modal */}
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedFacility={selectedFacility}
          facilities={facilities}
        />

        {/* Facility Create / Edit Modal */}
        <FacilityFormModal
          isOpen={isFacilityFormModalOpen}
          onClose={() => setIsFacilityFormModalOpen(false)}
          facilityToEdit={facilityToEdit}
        />
      </div>
    </PageContainer>
  );
};
