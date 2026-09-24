import { apiClient } from '@/services/api/client';
import { Announcement, AnnouncementRequest } from '../types/announcement.types';
import { appStorage } from '@/services/storage/appStorage';

export const announcementApi = {
  // Publish new announcement
  publishAnnouncement: async (request: AnnouncementRequest): Promise<Announcement> => {
    try {
      const response = await apiClient.post<Announcement>('/announcements', request);
      const created = { ...response.data };
      const currentAnnouncements = appStorage.loadAnnouncements();
      const updated = [created, ...currentAnnouncements.filter((a) => a.id !== created.id)];
      appStorage.saveAnnouncements(updated);
      return { ...created };
    } catch {
      const newAnnouncement: Announcement = {
        id: Date.now(),
        title: request.title,
        content: request.content,
        targetRole: request.targetRole,
        publishedBy: request.publishedBy,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };
      const currentAnnouncements = appStorage.loadAnnouncements();
      const updated = [newAnnouncement, ...currentAnnouncements.filter((a) => a.id !== newAnnouncement.id)];
      appStorage.saveAnnouncements(updated);
      return { ...newAnnouncement };
    }
  },

  // Get announcements filtered by caller role
  getAnnouncementsByRole: async (role: string): Promise<Announcement[]> => {
    try {
      const response = await apiClient.get<Announcement[]>(`/announcements`, {
        params: { role },
      });
      if (response.data && Array.isArray(response.data)) {
        appStorage.saveAnnouncements(response.data);
        return response.data.map((a) => ({ ...a }));
      }
      const list = appStorage.loadAnnouncements();
      return list
        .filter((a) => a.targetRole === 'ALL' || a.targetRole.toUpperCase() === role.toUpperCase())
        .map((a) => ({ ...a }));
    } catch {
      const list = appStorage.loadAnnouncements();
      return list
        .filter((a) => a.targetRole === 'ALL' || a.targetRole.toUpperCase() === role.toUpperCase())
        .map((a) => ({ ...a }));
    }
  },

  // Get all announcements regardless of role (for staff/admin management)
  getAllAnnouncements: async (): Promise<Announcement[]> => {
    try {
      const response = await apiClient.get<Announcement[]>('/announcements', {
        params: { role: 'ALL' },
      });
      if (response.data && response.data.length > 0) {
        appStorage.saveAnnouncements(response.data);
        return response.data.map((a) => ({ ...a }));
      }
      return appStorage.loadAnnouncements();
    } catch {
      return appStorage.loadAnnouncements();
    }
  },
};
