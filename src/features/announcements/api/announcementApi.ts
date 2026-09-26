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
      return created;
    } catch {
      const newAnnouncement: Announcement = {
        id: Date.now(),
        title: request.title,
        content: request.content,
        targetRole: request.targetRole,
        publishedBy: request.publishedBy || 'Management Office',
        category: request.category || 'NOTICE',
        priority: request.priority || 'MEDIUM',
        expiryDate: request.expiryDate,
        attachmentUrl: request.attachmentUrl,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };
      const currentAnnouncements = appStorage.loadAnnouncements();
      const updated = [newAnnouncement, ...currentAnnouncements.filter((a) => a.id !== newAnnouncement.id)];
      appStorage.saveAnnouncements(updated);
      return newAnnouncement;
    }
  },

  // Get announcements filtered by caller role
  getAnnouncementsByRole: async (role?: string): Promise<Announcement[]> => {
    try {
      const params = role ? { role } : {};
      const response = await apiClient.get<Announcement[]>('/announcements', { params });
      if (response.data && Array.isArray(response.data)) {
        appStorage.saveAnnouncements(response.data);
        return response.data;
      }
      const list = appStorage.loadAnnouncements();
      return list.filter((a) => !role || role === 'ALL' || a.targetRole === 'ALL' || a.targetRole.toUpperCase() === role.toUpperCase());
    } catch {
      const list = appStorage.loadAnnouncements();
      return list.filter((a) => !role || role === 'ALL' || a.targetRole === 'ALL' || a.targetRole.toUpperCase() === role.toUpperCase());
    }
  },

  // Get single announcement
  getAnnouncementById: async (id: number): Promise<Announcement> => {
    try {
      const response = await apiClient.get<Announcement>(`/announcements/${id}`);
      return response.data;
    } catch {
      const list = appStorage.loadAnnouncements();
      const found = list.find((a) => a.id === id);
      if (!found) throw new Error('Announcement not found');
      return found;
    }
  },

  // Update announcement
  updateAnnouncement: async (id: number, request: Partial<AnnouncementRequest>): Promise<Announcement> => {
    try {
      const response = await apiClient.put<Announcement>(`/announcements/${id}`, request);
      const updated = response.data;
      const current = appStorage.loadAnnouncements();
      appStorage.saveAnnouncements(current.map((a) => (a.id === id ? updated : a)));
      return updated;
    } catch {
      const current = appStorage.loadAnnouncements();
      const existing = current.find((a) => a.id === id);
      if (!existing) throw new Error('Announcement not found');
      const updated: Announcement = { ...existing, ...request } as Announcement;
      appStorage.saveAnnouncements(current.map((a) => (a.id === id ? updated : a)));
      return updated;
    }
  },

  // Delete announcement
  deleteAnnouncement: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/announcements/${id}`);
      const current = appStorage.loadAnnouncements();
      appStorage.saveAnnouncements(current.filter((a) => a.id !== id));
    } catch {
      const current = appStorage.loadAnnouncements();
      appStorage.saveAnnouncements(current.filter((a) => a.id !== id));
    }
  },

  // Archive announcement
  archiveAnnouncement: async (id: number): Promise<Announcement> => {
    try {
      const response = await apiClient.patch<Announcement>(`/announcements/${id}/archive`);
      const updated = response.data;
      const current = appStorage.loadAnnouncements();
      appStorage.saveAnnouncements(current.map((a) => (a.id === id ? updated : a)));
      return updated;
    } catch {
      const current = appStorage.loadAnnouncements();
      const existing = current.find((a) => a.id === id);
      if (!existing) throw new Error('Announcement not found');
      const updated: Announcement = { ...existing, status: 'ARCHIVED' };
      appStorage.saveAnnouncements(current.map((a) => (a.id === id ? updated : a)));
      return updated;
    }
  },

  // Get all announcements regardless of role (for staff/admin management)
  getAllAnnouncements: async (): Promise<Announcement[]> => {
    return announcementApi.getAnnouncementsByRole('ALL');
  },
};
