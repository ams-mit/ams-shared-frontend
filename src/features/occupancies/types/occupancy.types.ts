export interface Occupancy {
  id: string;
  unitId: string;
  residentId: string;
  leaseId: string;
  status: 'ACTIVE' | 'INACTIVE';
  moveInDate: string;
  moveOutDate: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface CreateOccupancyRequest {
  unitId: string;
  residentId: string;
  leaseId: string;
  moveInDate: string;
}
