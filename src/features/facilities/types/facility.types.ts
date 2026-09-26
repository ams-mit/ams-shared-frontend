export type FacilityStatus = 'ACTIVE' | 'INACTIVE';

export interface Facility {
  id: number;
  name: string;
  type: string;
  capacity: number;
  location: string;
  operatingHoursStart: string; // "06:00:00"
  operatingHoursEnd: string;   // "22:00:00"
  status: FacilityStatus;
  imageUrl?: string;
  rulesAndGuidelines?: string;
  bookingFee?: number;
  maxHoursPerBooking?: number;
}

export interface FacilityRequest {
  name: string;
  type: string;
  capacity: number;
  location: string;
  operatingHoursStart: string;
  operatingHoursEnd: string;
  status?: FacilityStatus;
  imageUrl?: string;
  rulesAndGuidelines?: string;
  bookingFee?: number;
  maxHoursPerBooking?: number;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  bookingId?: number | null;
  purpose?: string | null;
}

export interface FacilityAvailability {
  facilityId: number;
  facilityName: string;
  date: string;
  operatingHoursStart: string;
  operatingHoursEnd: string;
  bookedSlots: TimeSlot[];
  availableSlots: TimeSlot[];
}

export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface BookingRequest {
  facilityId: number;
  startTime: string; // ISO 8601 string, e.g. "2026-09-25T14:00:00"
  endTime: string;   // ISO 8601 string, e.g. "2026-09-25T16:00:00"
  requesterId: string;
  requesterName?: string;
  requesterRole: string;
  unitId?: string;
  bookedByStaffId?: string;
  bookedByStaffName?: string;
  bookedByStaffRole?: string;
  attendeeCount?: number;
  purpose?: string;
}

export interface BookingStatusUpdateRequest {
  status: BookingStatus;
  rejectionReason?: string;
}

export interface Booking {
  id: number;
  facilityId: number;
  facilityName: string;
  requesterId: string;
  requesterName?: string;
  requesterRole: string;
  unitId?: string;
  bookedByStaffId?: string;
  bookedByStaffName?: string;
  bookedByStaffRole?: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  attendeeCount?: number;
  purpose?: string;
  rejectionReason?: string;
  createdAt?: string;
}

export interface FacilityFilters {
  searchTerm?: string;
  status?: string;
  type?: string;
}

export interface BookingFilters {
  facilityId?: number | 'ALL';
  status?: BookingStatus | 'ALL';
  requesterId?: string;
}
