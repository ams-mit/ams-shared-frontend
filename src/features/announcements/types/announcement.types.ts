export type AnnouncementStatus = 'ACTIVE' | 'INACTIVE';

export interface AnnouncementRequest {
  title: string;
  content: string;
  targetRole: string; // 'ALL' | 'RESIDENT' | 'OWNER' | 'STAFF' | 'ADMIN'
  publishedBy: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  targetRole: string;
  publishedBy: string;
  status: AnnouncementStatus;
  createdAt: string;
}

export interface AnnouncementFilters {
  searchTerm?: string;
  targetRole?: string;
}
