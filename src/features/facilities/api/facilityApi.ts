import { apiClient } from '@/services/api/client';
import {
  Facility,
  FacilityRequest,
  FacilityAvailability,
  Booking,
  BookingRequest,
  BookingStatusUpdateRequest,
  BookingStatus,
  BookingFilters,
} from '../types/facility.types';
import { appStorage } from '@/services/storage/appStorage';

export const facilityApi = {
  // Fetch all facilities
  getAllFacilities: async (): Promise<Facility[]> => {
    try {
      const response = await apiClient.get<Facility[]>('/facilities');
      if (response.data && Array.isArray(response.data)) {
        appStorage.saveFacilities(response.data);
        return response.data;
      }
      return appStorage.loadFacilities();
    } catch {
      return appStorage.loadFacilities();
    }
  },

  // Get single facility
  getFacilityById: async (id: number): Promise<Facility> => {
    try {
      const response = await apiClient.get<Facility>(`/facilities/${id}`);
      return response.data;
    } catch {
      const facilities = appStorage.loadFacilities();
      const found = facilities.find((f) => f.id === id);
      if (!found) throw new Error(`Facility #${id} not found`);
      return found;
    }
  },

  // Create new facility (Admin/Staff)
  createFacility: async (data: FacilityRequest): Promise<Facility> => {
    try {
      const response = await apiClient.post<Facility>('/facilities', data);
      const created = response.data;
      const current = appStorage.loadFacilities();
      appStorage.saveFacilities([created, ...current.filter((f) => f.id !== created.id)]);
      return created;
    } catch {
      const newFacility: Facility = {
        id: Date.now(),
        name: data.name,
        type: data.type,
        capacity: data.capacity,
        location: data.location,
        operatingHoursStart: data.operatingHoursStart,
        operatingHoursEnd: data.operatingHoursEnd,
        status: data.status || 'ACTIVE',
        imageUrl: data.imageUrl,
        rulesAndGuidelines: data.rulesAndGuidelines,
        bookingFee: data.bookingFee,
        maxHoursPerBooking: data.maxHoursPerBooking,
      };
      const current = appStorage.loadFacilities();
      appStorage.saveFacilities([newFacility, ...current]);
      return newFacility;
    }
  },

  // Update existing facility
  updateFacility: async (id: number, data: Partial<FacilityRequest>): Promise<Facility> => {
    try {
      const response = await apiClient.put<Facility>(`/facilities/${id}`, data);
      const updated = response.data;
      const current = appStorage.loadFacilities();
      appStorage.saveFacilities(current.map((f) => (f.id === id ? updated : f)));
      return updated;
    } catch {
      const current = appStorage.loadFacilities();
      const existing = current.find((f) => f.id === id);
      if (!existing) throw new Error('Facility not found');
      const updated: Facility = { ...existing, ...data } as Facility;
      appStorage.saveFacilities(current.map((f) => (f.id === id ? updated : f)));
      return updated;
    }
  },

  // Toggle facility active/inactive status
  toggleFacilityStatus: async (id: number, status?: 'ACTIVE' | 'INACTIVE'): Promise<Facility> => {
    try {
      const response = await apiClient.patch<Facility>(
        `/facilities/${id}/status`,
        status ? { status } : {}
      );
      const updated = response.data;
      const current = appStorage.loadFacilities();
      appStorage.saveFacilities(current.map((f) => (f.id === id ? updated : f)));
      return updated;
    } catch {
      const current = appStorage.loadFacilities();
      const existing = current.find((f) => f.id === id);
      if (!existing) throw new Error('Facility not found');
      const nextStatus = status || (existing.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE');
      const updated: Facility = { ...existing, status: nextStatus };
      appStorage.saveFacilities(current.map((f) => (f.id === id ? updated : f)));
      return updated;
    }
  },

  // Delete facility (deactivate)
  deleteFacility: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/facilities/${id}`);
      const current = appStorage.loadFacilities();
      appStorage.saveFacilities(current.filter((f) => f.id !== id));
    } catch {
      const current = appStorage.loadFacilities();
      appStorage.saveFacilities(current.filter((f) => f.id !== id));
    }
  },

  // Check facility availability for a specific date
  getFacilityAvailability: async (id: number, date?: string): Promise<FacilityAvailability> => {
    const params = date ? { date } : {};
    const response = await apiClient.get<FacilityAvailability>(`/facilities/${id}/availability`, { params });
    return response.data;
  },

  // Create a facility reservation
  createBooking: async (request: BookingRequest): Promise<Booking> => {
    const reqStart = new Date(request.startTime);
    const reqEnd = new Date(request.endTime);
    if (reqStart.getTime() < Date.now()) {
      throw new Error('Reservation date and time cannot be in the past. Please choose a future slot.');
    }
    if (reqEnd.getTime() <= reqStart.getTime()) {
      throw new Error('End time must be later than start time.');
    }

    try {
      const response = await apiClient.post<Booking>('/facilities/reservations', request);
      const created = { ...response.data };
      const currentBookings = appStorage.loadBookings();
      const updated = [created, ...currentBookings.filter((b) => b.id !== created.id)];
      appStorage.saveBookings(updated);
      return created;
    } catch (err: unknown) {
      if (err instanceof Error && (err.message.includes('cannot be in the past') || err.message.includes('exceeds'))) {
        throw err;
      }
      // Offline fallback
      const currentFacilities = appStorage.loadFacilities();
      const facility = currentFacilities.find((f) => f.id === request.facilityId);
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
      return newBooking;
    }
  },

  // Update booking status (APPROVE / REJECT / CANCEL)
  updateBookingStatus: async (bookingId: number, status: BookingStatus, rejectionReason?: string): Promise<Booking> => {
    const payload: BookingStatusUpdateRequest = { status, rejectionReason };
    try {
      const response = await apiClient.patch<Booking>(`/facilities/reservations/${bookingId}/status`, payload);
      const updated = { ...response.data };
      const currentBookings = appStorage.loadBookings();
      const nextList = currentBookings.map((b) => (b.id === bookingId ? updated : b));
      appStorage.saveBookings(nextList);
      return updated;
    } catch {
      const currentBookings = appStorage.loadBookings();
      const existing = currentBookings.find((b) => b.id === bookingId);
      if (!existing) {
        throw new Error('Booking not found');
      }
      const updated: Booking = { ...existing, status, rejectionReason };
      const nextList = currentBookings.map((b) => (b.id === bookingId ? updated : b));
      appStorage.saveBookings(nextList);
      return updated;
    }
  },

  // Cancel booking (resident cancellation)
  cancelBooking: async (bookingId: number): Promise<Booking> => {
    try {
      const response = await apiClient.patch<Booking>(`/facilities/reservations/${bookingId}/cancel`);
      const updated = response.data;
      const currentBookings = appStorage.loadBookings();
      const nextList = currentBookings.map((b) => (b.id === bookingId ? updated : b));
      appStorage.saveBookings(nextList);
      return updated;
    } catch {
      return facilityApi.updateBookingStatus(bookingId, 'CANCELLED');
    }
  },

  // Get current bookings list with optional filters
  getAllBookings: async (filters?: BookingFilters): Promise<Booking[]> => {
    try {
      const params: Record<string, unknown> = {};
      if (filters?.status && filters.status !== 'ALL') params.status = filters.status;
      if (filters?.facilityId && filters.facilityId !== 'ALL') params.facilityId = filters.facilityId;
      if (filters?.requesterId) params.requesterId = filters.requesterId;

      const response = await apiClient.get<Booking[]>('/facilities/reservations', { params });
      if (response.data && Array.isArray(response.data)) {
        appStorage.saveBookings(response.data);
        return response.data;
      }
      return appStorage.loadBookings();
    } catch {
      return appStorage.loadBookings();
    }
  },
};
