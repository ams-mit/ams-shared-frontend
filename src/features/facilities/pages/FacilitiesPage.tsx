import React, { useEffect, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { FacilityCard } from '../components/FacilityCard';
import { FacilityFilter } from '../components/FacilityFilter';
import { BookingModal } from '../components/BookingModal';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';
import { Facility } from '../types/facility.types';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchFacilities } from '../store/facilitySlice';

export const FacilitiesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { facilities, loading, error } = useAppSelector((state) => state.facilities);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

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
        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenGeneralBooking}
          leftIcon={<PlusCircle size={16} />}
        >
          New Reservation
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {filteredFacilities.map((facility) => (
              <FacilityCard key={facility.id} facility={facility} onBook={handleBook} />
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
      </div>
    </PageContainer>
  );
};
