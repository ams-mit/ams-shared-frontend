export interface BackendNotification {
  id: number;
  recipientId?: string;
  recipientRole?: string;
  title: string;
  summary?: string;
  message?: string;
  type?: 'maintenance' | 'security' | 'facility' | 'announcement' | string;
  category?: 'MAINTENANCE' | 'SECURITY' | 'FACILITY' | 'BULLETIN' | string;
  priority?: 'urgent' | 'high' | 'normal' | 'low' | string;
  issuedBy?: string;
  affectedArea?: string;
  actionRoute?: string;
  actionLabel?: string;
  isRead: boolean;
  createdAt?: string;
  readAt?: string;
}

export interface CreateNotificationPayload {
  recipientId?: string;
  recipientRole?: string;
  title: string;
  summary?: string;
  message?: string;
  type?: string;
  category?: string;
  priority?: string;
  issuedBy?: string;
  affectedArea?: string;
  actionRoute?: string;
  actionLabel?: string;
}
