import { apiClient } from '@/services/api/client';
import { Facility, Booking, BookingRequest, BookingStatusUpdateRequest, BookingStatus } from '../types/facility.types';
import { appStorage } from '@/services/storage/appStorage';

export const facilityApi = {
  // Fetch all facilities
  getAllFacilities: async (): Promise<Facility[]> => {
    try {
      const response = await apiClient.get<Facility[]>('/facilities');
      if (response.data && response.data.length > 0) {
        appStorage.saveFacilities(response.data);
        return response.data.map((f) => ({ ...f }));
      }
      return appStorage.loadFacilities();
    } catch {
      // Load persistent cached facilities
      return appStorage.loadFacilities();
    }
  },

  // Create a facility reservation
  createBooking: async (request: BookingRequest): Promise<Booking> => {
    // Validate date & time constraints
    const reqStart = new Date(request.startTime);
    const reqEnd = new Date(request.endTime);
    if (reqStart.getTime() < Date.now()) {
      throw new Error('Reservation date and time cannot be in the past. Please choose a future slot.');
    }
    if (reqEnd.getTime() <= reqStart.getTime()) {
      throw new Error('End time must be later than start time.');
    }

    // Validate attendee count against facility capacity
    const currentFacilities = appStorage.loadFacilities();
    const facility = currentFacilities.find((f) => f.id === request.facilityId);
    if (facility && request.attendeeCount && request.attendeeCount > facility.capacity) {
      throw new Error(
        `Attendee count (${request.attendeeCount}) exceeds ${facility.name} maximum capacity of ${facility.capacity} persons.`
      );
    }

    try {
      const response = await apiClient.post<Booking>('/facilities/reservations', request);
      const created = { ...response.data };
      const currentBookings = appStorage.loadBookings();
      const updated = [created, ...currentBookings.filter((b) => b.id !== created.id)];
      appStorage.saveBookings(updated);
      return { ...created };
    } catch (err: unknown) {
      // If error is already our validation error, rethrow
      if (err instanceof Error && (err.message.includes('cannot be in the past') || err.message.includes('exceeds'))) {
        throw err;
      }
      // Persistent simulation: store in localStorage so it survives page reloads
      const newBooking: Booking = {
        id: Date.now(),
        facilityId: request.facilityId,
        facilityName: facility ? facility.name : `Facility #${request.facilityId}`,
        requesterId: request.requesterId,
        requesterName: request.requesterName,
        requesterRole: request.requesterRole,
        unitId: request.unitId,
        bookedByStaffId: request.bookedByStaffId,
        bookedByStaffName: request.bookedByStaffName,
        bookedByStaffRole: request.bookedByStaffRole,
        startTime: request.startTime,
        endTime: request.endTime,
        attendeeCount: request.attendeeCount || 1,
        purpose: request.purpose,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };
      const currentBookings = appStorage.loadBookings();
      const updated = [newBooking, ...currentBookings.filter((b) => b.id !== newBooking.id)];
      appStorage.saveBookings(updated);
      return { ...newBooking };
    }
  },

  // Update booking status (APPROVE / REJECT / CANCEL)
  updateBookingStatus: async (bookingId: number, status: BookingStatus): Promise<Booking> => {
    const payload: BookingStatusUpdateRequest = { status };
    try {
      const response = await apiClient.patch<Booking>(`/facilities/reservations/${bookingId}/status`, payload);
      const updated = { ...response.data };
      const currentBookings = appStorage.loadBookings();
      const nextList = currentBookings.map((b) => (b.id === bookingId ? updated : b));
      appStorage.saveBookings(nextList);
      return { ...updated };
    } catch {
      // Simulate and persist status update locally
      const currentBookings = appStorage.loadBookings();
      const existing = currentBookings.find((b) => b.id === bookingId);
      if (!existing) {
        throw new Error('Booking not found');
      }
      const updated: Booking = { ...existing, status };
      const nextList = currentBookings.map((b) => (b.id === bookingId ? updated : b));
      appStorage.saveBookings(nextList);
      return { ...updated };
    }
  },

  // Get current bookings list
  getAllBookings: async (): Promise<Booking[]> => {
    try {
      const response = await apiClient.get<Booking[]>('/facilities/reservations');
      if (response.data && Array.isArray(response.data)) {
        appStorage.saveBookings(response.data);
        return response.data.map((b) => ({ ...b }));
      }
      return appStorage.loadBookings();
    } catch {
      return appStorage.loadBookings();
    }
  },
};
