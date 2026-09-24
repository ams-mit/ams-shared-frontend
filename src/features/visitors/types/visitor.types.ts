export type VisitorStatus = 'EXPECTED' | 'CHECKED_IN';

export interface VisitorRequest {
  visitorName: string;
  residentId: string;
  unitId: string;
  purpose: string;
  visitDate: string; // YYYY-MM-DD
}

export interface Visitor {
  id: number;
  visitorName: string;
  residentId: string;
  unitId: string;
  purpose: string;
  visitDate: string; // YYYY-MM-DD
  status: VisitorStatus;
  checkedInAt?: string | null;
  createdAt?: string;
}

export interface VisitorFilters {
  searchTerm?: string;
  status?: VisitorStatus | 'ALL';
  visitDate?: string;
  residentId?: string;
}
