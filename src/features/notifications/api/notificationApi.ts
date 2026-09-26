import { apiClient } from '@/services/api/client';
import { BackendNotification, CreateNotificationPayload } from '../types/notification.types';

export const notificationApi = {
  /**
   * COMM-009: List current user's notifications
   */
  async getNotifications(recipientId?: string, role?: string, unreadOnly?: boolean): Promise<BackendNotification[]> {
    const params: Record<string, string | boolean> = {};
    if (recipientId) params.recipientId = recipientId;
    if (role) params.role = role;
    if (unreadOnly !== undefined) params.unreadOnly = unreadOnly;

    const response = await apiClient.get<BackendNotification[]>('/notifications', { params });
    return response.data;
  },

  /**
   * COMM-008: Create workflow notification
   */
  async createNotification(payload: CreateNotificationPayload): Promise<BackendNotification> {
    const response = await apiClient.post<BackendNotification>('/notifications', payload);
    return response.data;
  },

  /**
   * COMM-010: Mark notification as read
   */
  async markAsRead(notificationId: string | number): Promise<BackendNotification> {
    const response = await apiClient.patch<BackendNotification>(`/notifications/${notificationId}/read`);
    return response.data;
  },

  /**
   * Bulk mark notifications as read
   */
  async markAllAsRead(recipientId?: string): Promise<{ updatedCount: number }> {
    const params = recipientId ? { recipientId } : {};
    const response = await apiClient.patch<{ updatedCount: number }>('/notifications/read-all', null, { params });
    return response.data;
  },
};
