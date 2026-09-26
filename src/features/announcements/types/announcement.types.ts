export type AnnouncementStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface AnnouncementRequest {
  title: string;
  content: string;
  targetRole: string; // 'ALL' | 'RESIDENT' | 'OWNER' | 'STAFF' | 'ADMIN'
  publishedBy?: string;
  category?: string; // 'MAINTENANCE' | 'EMERGENCY' | 'EVENT' | 'NOTICE'
  priority?: string; // 'HIGH' | 'MEDIUM' | 'LOW'
  expiryDate?: string;
  attachmentUrl?: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  targetRole: string;
  publishedBy: string;
  status: AnnouncementStatus;
  category?: string;
  priority?: string;
  expiryDate?: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface AnnouncementFilters {
  searchTerm?: string;
  targetRole?: string;
  category?: string;
  priority?: string;
}
