export type VisitorStatus = 'EXPECTED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'EXPIRED';

export interface VisitorRequest {
  visitorName: string;
  residentId: string;
  unitId: string;
  purpose: string;
  visitDate: string; // YYYY-MM-DD
  visitorPhone?: string;
  vehicleNumber?: string;
}

export interface Visitor {
  id: number;
  visitorName: string;
  residentId: string;
  unitId: string;
  purpose: string;
  visitDate: string; // YYYY-MM-DD
  status: VisitorStatus;
  visitorPhone?: string;
  vehicleNumber?: string;
  passCode?: string;
  checkedInAt?: string | null;
  checkedOutAt?: string | null;
  createdAt?: string;
}

export interface VisitorFilters {
  searchTerm?: string;
  status?: VisitorStatus | 'ALL';
  visitDate?: string;
  residentId?: string;
}
