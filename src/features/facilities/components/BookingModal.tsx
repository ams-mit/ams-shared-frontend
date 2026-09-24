import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/feedback/Alert';
import { Facility, BookingRequest } from '../types/facility.types';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { createBooking, clearFeedback } from '../store/facilitySlice';
import {
  Clock,
  Users,
  MapPin,
  Info,
  ShieldCheck,
  User,
  Building2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { getRegisteredResidents, findResidentById } from '@/constants/roles';

export interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFacility?: Facility | null;
  facilities: Facility[];
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  selectedFacility,
  facilities,
}) => {
  const dispatch = useAppDispatch();
  const { currentUser, activeRole } = useAppSelector((state) => state.auth);
  const { bookings, actionLoading, error, successMessage } = useAppSelector((state) => state.facilities);

  const isStaffOrAdmin = activeRole === 'STAFF' || activeRole === 'ADMIN';

  const [facilityId, setFacilityId] = useState<string>('');
  const [bookingDate, setBookingDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('14:00');
  const [endTime, setEndTime] = useState<string>('16:00');
  const [attendeeCount, setAttendeeCount] = useState<number | string>(1);
  const [purpose, setPurpose] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);

  // Staff booking mode: 'RESIDENT' (on behalf of resident) or 'STAFF_INTERNAL' (management)
  const [bookingMode, setBookingMode] = useState<'RESIDENT' | 'STAFF_INTERNAL'>('RESIDENT');

  // Registered residents directory
  const registeredResidents = getRegisteredResidents();
  const [selectedResidentId, setSelectedResidentId] = useState<string>(
    registeredResidents[0]?.id || 'resident-001'
  );
  const [isManualResidentId, setIsManualResidentId] = useState<boolean>(false);
  const [manualResidentIdInput, setManualResidentIdInput] = useState<string>('');

  // Today in YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (isOpen) {
      setLocalError(null);
      dispatch(clearFeedback());
      if (selectedFacility) {
        setFacilityId(String(selectedFacility.id));
      } else if (facilities.length > 0) {
        setFacilityId(String(facilities[0].id));
      }
      // Default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setBookingDate(tomorrow.toISOString().split('T')[0]);
      setAttendeeCount(1);
      setPurpose('');
      setBookingMode('RESIDENT');
      setIsManualResidentId(false);
      setManualResidentIdInput('');
      setSelectedResidentId(registeredResidents[0]?.id || 'resident-001');
    }
  }, [selectedFacility, facilities, isOpen, dispatch]);

  const activeFacility = facilities.find((f) => f.id === Number(facilityId));

  // Resolved resident info for Staff booking mode
  const resolvedManualResident = manualResidentIdInput.trim()
    ? findResidentById(manualResidentIdInput)
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    dispatch(clearFeedback());

    if (!facilityId) {
      setLocalError('Please select a facility.');
      return;
    }
    if (!bookingDate) {
      setLocalError('Please pick a reservation date.');
      return;
    }

    // 1. Validate that the date is NOT in the past
    if (bookingDate < todayStr) {
      setLocalError('Reservation date cannot be in the past. Please select today or an upcoming date.');
      return;
    }

    if (!startTime || !endTime) {
      setLocalError('Please provide both start and end times.');
      return;
    }

    const startDateTime = `${bookingDate}T${startTime}:00`;
    const endDateTime = `${bookingDate}T${endTime}:00`;

    const now = new Date();
    const chosenStart = new Date(startDateTime);
    const chosenEnd = new Date(endDateTime);

    // 2. Validate that the time slot is not in the past
    if (chosenStart.getTime() < now.getTime()) {
      setLocalError('Reservation start time cannot be in the past. Please choose an upcoming time window.');
      return;
    }

    // 3. Validate that end time is after start time
    if (chosenEnd.getTime() <= chosenStart.getTime()) {
      setLocalError('End time must be later than start time.');
      return;
    }

    // 4. Validate duration (min 30 mins, max 12 hours)
    const durationMinutes = (chosenEnd.getTime() - chosenStart.getTime()) / (1000 * 60);
    if (durationMinutes < 30) {
      setLocalError('Reservation duration must be at least 30 minutes.');
      return;
    }
    if (durationMinutes > 720) {
      setLocalError('Reservation duration cannot exceed 12 hours.');
      return;
    }

    // 5. Validate attendee count and facility capacity
    const count = Number(attendeeCount);
    if (!attendeeCount || isNaN(count) || count < 1) {
      setLocalError('Please enter a valid number of expected attendees (minimum 1 person).');
      return;
    }

    if (activeFacility && count > activeFacility.capacity) {
      setLocalError(
        `The expected attendee count (${count} persons) exceeds the maximum capacity of ${activeFacility.name} (${activeFacility.capacity} persons). Please reduce the attendee count.`
      );
      return;
    }

    // 6. Validate facility operating hours
    if (activeFacility) {
      const requestedStartT = `${startTime}:00`;
      const requestedEndT = `${endTime}:00`;
      if (
        requestedStartT < activeFacility.operatingHoursStart ||
        requestedEndT > activeFacility.operatingHoursEnd
      ) {
        setLocalError(
          `Operating hours for ${activeFacility.name} are ${activeFacility.operatingHoursStart.slice(0, 5)} to ${activeFacility.operatingHoursEnd.slice(0, 5)}. Please adjust your time slot.`
        );
        return;
      }
    }

    // 7. Validate conflicting / overlapping reservations for the same facility
    const conflictingBooking = bookings.find((b) => {
      if (b.facilityId !== Number(facilityId)) return false;
      if (b.status === 'REJECTED' || b.status === 'CANCELLED') return false;
      const existingStart = new Date(b.startTime).getTime();
      const existingEnd = new Date(b.endTime).getTime();
      const reqStart = chosenStart.getTime();
      const reqEnd = chosenEnd.getTime();
      return reqStart < existingEnd && reqEnd > existingStart;
    });

    if (conflictingBooking) {
      const conflictStartStr = new Date(conflictingBooking.startTime).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const conflictEndStr = new Date(conflictingBooking.endTime).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      setLocalError(
        `This facility already has a booking from ${conflictStartStr} to ${conflictEndStr}. Please choose a non-overlapping time slot.`
      );
      return;
    }

    // 8. Resolve and Validate Requester Identity
    let finalRequesterId = '';
    let finalRequesterName = '';
    let finalRequesterRole = 'RESIDENT';
    let finalUnitId: string | undefined = undefined;

    if (isStaffOrAdmin) {
      if (bookingMode === 'RESIDENT') {
        if (isManualResidentId) {
          const typedId = manualResidentIdInput.trim();
          if (!typedId) {
            setLocalError('Please enter the Resident ID (e.g. resident-001).');
            return;
          }
          const found = findResidentById(typedId);
          if (!found) {
            // Explicit error feedback when ID is wrong
            setLocalError(
              `The Resident ID was wrong: No resident found with ID "${typedId}". Please verify the ID (e.g. resident-001, resident-002) or select from the resident directory.`
            );
            return;
          }
          finalRequesterId = found.id;
          finalRequesterName = found.name;
          finalRequesterRole = 'RESIDENT';
          finalUnitId = found.unitId;
        } else {
          const found = registeredResidents.find((r) => r.id === selectedResidentId);
          if (!found) {
            setLocalError('Please select a resident from the directory.');
            return;
          }
          finalRequesterId = found.id;
          finalRequesterName = found.name;
          finalRequesterRole = 'RESIDENT';
          finalUnitId = found.unitId;
        }
      } else {
        // Staff / Operations internal booking
        finalRequesterId = currentUser.id;
        finalRequesterName = currentUser.name;
        finalRequesterRole = activeRole;
        finalUnitId = currentUser.unitId || 'Management Office';
      }
    } else {
      // Normal Resident booking for themselves
      finalRequesterId = currentUser.id;
      finalRequesterName = currentUser.name;
      finalRequesterRole = activeRole;
      finalUnitId = currentUser.unitId;
    }

    const request: BookingRequest = {
      facilityId: Number(facilityId),
      startTime: startDateTime,
      endTime: endDateTime,
      requesterId: finalRequesterId,
      requesterName: finalRequesterName,
      requesterRole: finalRequesterRole,
      unitId: finalUnitId,
      bookedByStaffId: isStaffOrAdmin ? currentUser.id : undefined,
      bookedByStaffName: isStaffOrAdmin ? currentUser.name : undefined,
      bookedByStaffRole: isStaffOrAdmin ? activeRole : undefined,
      attendeeCount: count,
      purpose: purpose.trim() || undefined,
    };

    const res = await dispatch(createBooking(request));
    if (createBooking.fulfilled.match(res)) {
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  const facilityOptions = facilities
    .filter((f) => f.status === 'ACTIVE')
    .map((f) => ({
      value: f.id,
      label: f.name,
      subLabel: f.location,
      badge: f.type,
    }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reserve Community Facility"
      subtitle="Submit an amenity reservation request to apartment operations"
      maxWidth="600px"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={actionLoading}
          >
            Confirm Reservation
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {localError && <Alert type="error" message={localError} onDismiss={() => setLocalError(null)} />}
        {error && <Alert type="error" message={error} />}
        {successMessage && <Alert type="success" message={successMessage} />}

        {/* Staff Authority Section: Requester Assignment */}
        {isStaffOrAdmin && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'rgba(30, 58, 95, 0.05)',
              borderRadius: '10px',
              border: '1.5px solid rgba(30, 58, 95, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.875rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <ShieldCheck size={16} color="var(--color-accent)" />
                <span>Officer Booking Authority: Requester Assignment</span>
              </div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                By: {currentUser.name} ({activeRole})
              </span>
            </div>

            {/* Mode Toggle: On Behalf of Resident vs Staff Internal */}
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                backgroundColor: '#FFFFFF',
                padding: '0.25rem',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setBookingMode('RESIDENT');
                  setLocalError(null);
                }}
                style={{
                  flex: 1,
                  padding: '0.45rem 0.75rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.375rem',
                  backgroundColor: bookingMode === 'RESIDENT' ? 'var(--color-accent)' : 'transparent',
                  color: bookingMode === 'RESIDENT' ? '#FFFFFF' : 'var(--color-text-secondary)',
                  boxShadow: bookingMode === 'RESIDENT' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <User size={14} />
                <span>Book for a Resident</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBookingMode('STAFF_INTERNAL');
                  setLocalError(null);
                }}
                style={{
                  flex: 1,
                  padding: '0.45rem 0.75rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.375rem',
                  backgroundColor: bookingMode === 'STAFF_INTERNAL' ? 'var(--color-primary)' : 'transparent',
                  color: bookingMode === 'STAFF_INTERNAL' ? '#FFFFFF' : 'var(--color-text-secondary)',
                  boxShadow: bookingMode === 'STAFF_INTERNAL' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <Building2 size={14} />
                <span>Internal Staff / Management</span>
              </button>
            </div>

            {bookingMode === 'RESIDENT' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)' }}>
                    Target Resident:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsManualResidentId(!isManualResidentId);
                      setLocalError(null);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-accent)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    {isManualResidentId ? '← Choose from Resident Directory' : 'Enter Resident ID Manually →'}
                  </button>
                </div>

                {!isManualResidentId ? (
                  <Select
                    options={registeredResidents.map((r) => ({
                      value: r.id,
                      label: `${r.name} (${r.id})`,
                      subLabel: `${r.unitId} • ${r.email}`,
                      badge: r.unitId,
                    }))}
                    value={selectedResidentId}
                    onChange={(e) => {
                      setSelectedResidentId(e.target.value);
                      setLocalError(null);
                    }}
                  />
                ) : (
                  <div>
                    <Input
                      placeholder="e.g. resident-001, resident-002..."
                      value={manualResidentIdInput}
                      onChange={(e) => {
                        setManualResidentIdInput(e.target.value);
                        setLocalError(null);
                      }}
                      leftIcon={<User size={15} />}
                      helperText="Type the resident registration ID to look up and assign this reservation"
                    />

                    {/* Real-time verification badge or error message */}
                    {manualResidentIdInput.trim() && (
                      <div style={{ marginTop: '0.375rem' }}>
                        {resolvedManualResident ? (
                          <div
                            style={{
                              padding: '0.375rem 0.625rem',
                              backgroundColor: 'rgba(34, 197, 94, 0.1)',
                              border: '1px solid rgba(34, 197, 94, 0.3)',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              color: '#15803D',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.375rem',
                            }}
                          >
                            <CheckCircle2 size={13} />
                            <span>
                              Verified Resident: {resolvedManualResident.name} ({resolvedManualResident.unitId})
                            </span>
                          </div>
                        ) : (
                          <div
                            style={{
                              padding: '0.375rem 0.625rem',
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              color: '#B91C1C',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.375rem',
                            }}
                          >
                            <AlertCircle size={13} />
                            <span>
                              The Resident ID was wrong: No resident found with ID "{manualResidentIdInput}".
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Directory selection resident preview */}
                {!isManualResidentId && selectedResidentId && (
                  <div
                    style={{
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '6px',
                      border: '1px solid rgba(47, 139, 139, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                        {registeredResidents.find((r) => r.id === selectedResidentId)?.name}
                      </span>
                      <span style={{ color: 'var(--color-text-muted)', marginLeft: '0.35rem' }}>
                        ({selectedResidentId})
                      </span>
                    </div>
                    <span
                      style={{
                        backgroundColor: 'rgba(47, 139, 139, 0.1)',
                        color: 'var(--color-accent)',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '4px',
                        fontWeight: 700,
                      }}
                    >
                      {registeredResidents.find((r) => r.id === selectedResidentId)?.unitId}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  padding: '0.625rem 0.75rem',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.75rem',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <span>
                  This booking will be officially assigned to <strong>{currentUser.name}</strong> ({activeRole}).
                </span>
              </div>
            )}
          </div>
        )}

        <div>
          <Select
            label="Select Amenity / Facility"
            required
            value={facilityId}
            onChange={(e) => setFacilityId(e.target.value)}
            options={facilityOptions}
          />

          {/* Facility Operating Specs Card */}
          {activeFacility && (
            <div
              style={{
                marginTop: '0.625rem',
                padding: '0.625rem 0.875rem',
                backgroundColor: 'rgba(47, 139, 139, 0.06)',
                borderRadius: '8px',
                border: '1px solid rgba(47, 139, 139, 0.18)',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                fontSize: '0.75rem',
                color: 'var(--color-text-secondary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={13} color="var(--color-accent)" />
                <span>
                  Hours: <strong>{activeFacility.operatingHoursStart.slice(0, 5)} - {activeFacility.operatingHoursEnd.slice(0, 5)}</strong>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Users size={13} color="var(--color-accent)" />
                <span>
                  Max Capacity: <strong>{activeFacility.capacity} Persons</strong>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={13} color="var(--color-accent)" />
                <span>{activeFacility.location}</span>
              </div>
            </div>
          )}
        </div>

        <Input
          label="Reservation Date"
          type="date"
          required
          min={todayStr}
          value={bookingDate}
          onChange={(e) => setBookingDate(e.target.value)}
          helperText="Select today or any upcoming reservation date"
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Start Time"
            type="time"
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <Input
            label="End Time"
            type="time"
            required
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        {/* Attendees Count & Occasion Purpose */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Expected Attendees / Guests"
            type="number"
            required
            min={1}
            max={activeFacility?.capacity}
            value={attendeeCount}
            onChange={(e) => setAttendeeCount(e.target.value)}
            leftIcon={<Users size={16} />}
            helperText={
              activeFacility
                ? `Max capacity: ${activeFacility.capacity} persons`
                : 'Enter expected headcount'
            }
          />
          <Input
            label="Occasion / Event Purpose"
            placeholder="e.g. Birthday Party, Dinner, Study"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            helperText="Optional occasion details"
          />
        </div>

        {/* Resident logged-in confirmation box */}
        {!isStaffOrAdmin && (
          <div
            style={{
              padding: '0.875rem',
              backgroundColor: 'var(--color-surface-hover)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
              fontSize: '0.8125rem',
              color: 'var(--color-text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Info size={14} color="var(--color-secondary)" />
              <span>
                <strong>Resident Requester:</strong> {currentUser.name} ({currentUser.id}) • Unit: {currentUser.unitId}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
              Note: Reservations require approval from facility management before entry clearance is activated.
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};
