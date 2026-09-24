import { Booking, Facility } from '@/features/facilities/types/facility.types';
import { Visitor } from '@/features/visitors/types/visitor.types';
import { Announcement } from '@/features/announcements/types/announcement.types';
import {
  INITIAL_FACILITIES,
  INITIAL_BOOKINGS,
  INITIAL_VISITORS,
  INITIAL_ANNOUNCEMENTS,
} from '@/services/api/mockData';

const KEYS = {
  BOOKINGS: 'ams_community_bookings_v1',
  VISITORS: 'ams_community_visitors_v1',
  ANNOUNCEMENTS: 'ams_community_announcements_v1',
  FACILITIES: 'ams_community_facilities_v1',
};

export const appStorage = {
  // Bookings
  loadBookings: (): Booking[] => {
    try {
      const data = localStorage.getItem(KEYS.BOOKINGS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse bookings from localStorage', e);
    }
    // Seed initial
    const initial = INITIAL_BOOKINGS.map((b) => ({ ...b }));
    localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(initial));
    return initial;
  },

  saveBookings: (bookings: Booking[]): void => {
    try {
      localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(bookings));
    } catch (e) {
      console.error('Failed to save bookings to localStorage', e);
    }
  },

  // Visitors
  loadVisitors: (): Visitor[] => {
    try {
      const data = localStorage.getItem(KEYS.VISITORS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse visitors from localStorage', e);
    }
    const initial = INITIAL_VISITORS.map((v) => ({ ...v }));
    localStorage.setItem(KEYS.VISITORS, JSON.stringify(initial));
    return initial;
  },

  saveVisitors: (visitors: Visitor[]): void => {
    try {
      localStorage.setItem(KEYS.VISITORS, JSON.stringify(visitors));
    } catch (e) {
      console.error('Failed to save visitors to localStorage', e);
    }
  },

  // Announcements
  loadAnnouncements: (): Announcement[] => {
    try {
      const data = localStorage.getItem(KEYS.ANNOUNCEMENTS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse announcements from localStorage', e);
    }
    const initial = INITIAL_ANNOUNCEMENTS.map((a) => ({ ...a }));
    localStorage.setItem(KEYS.ANNOUNCEMENTS, JSON.stringify(initial));
    return initial;
  },

  saveAnnouncements: (announcements: Announcement[]): void => {
    try {
      localStorage.setItem(KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
    } catch (e) {
      console.error('Failed to save announcements to localStorage', e);
    }
  },

  // Facilities
  loadFacilities: (): Facility[] => {
    try {
      const data = localStorage.getItem(KEYS.FACILITIES);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse facilities from localStorage', e);
    }
    const initial = INITIAL_FACILITIES.map((f) => ({ ...f }));
    localStorage.setItem(KEYS.FACILITIES, JSON.stringify(initial));
    return initial;
  },

  saveFacilities: (facilities: Facility[]): void => {
    try {
      localStorage.setItem(KEYS.FACILITIES, JSON.stringify(facilities));
    } catch (e) {
      console.error('Failed to save facilities to localStorage', e);
    }
  },
};
