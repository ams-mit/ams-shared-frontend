export type MaintenanceRequestStatus =
  | 'SUBMITTED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED';

export type UserRole = 'ADMIN' | 'MANAGER' | 'TECHNICIAN' | 'RESIDENT';

export type MaintenancePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type MaintenanceCategory =
  | 'PLUMBING'
  | 'ELECTRICAL'
  | 'HVAC'
  | 'APPLIANCE'
  | 'STRUCTURAL'
  | 'CARPENTRY'
  | 'CLEANING'
  | 'SECURITY'
  | 'OTHER';

export interface MaintenanceRequest {
  id: number;
  unitId?: number;
  unitNumber?: string;
  requestedByUserId?: number;
  requestedByName?: string;
  category: string;
  priority: MaintenancePriority;
  description: string;
  attachmentUrl?: string;
  createdAt: string;
  updatedAt?: string;
  status: MaintenanceRequestStatus;
  assignedStaffId?: number;
  assignedStaffName?: string;
  resolutionNotes?: string;
}

export interface MaintenanceRequestResponseDTO {
  id: number;
  unitId?: number;
  requestedByUserId?: number;
  attachmentUrl?: string;
  status: MaintenanceRequestStatus;
  category: string;
  priority: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateMaintenanceRequestDto {
  unitId: number;
  requestedByUserId?: number;
  category: string;
  priority: MaintenancePriority;
  description: string;
  attachmentUrl?: string;
}

// Work Order Domain Models (matching backend com.apartmentsystem.operations)
export type WorkOrderStatus = 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface WorkOrderResponseDTO {
  id: number;
  maintenanceRequestId: number;
  assignedTechnicianUserId: number;
  scheduledDate: string; // YYYY-MM-DD
  status: WorkOrderStatus;
  resolutionNotes?: string;
}

export interface CreateWorkOrderDTO {
  maintenanceRequestId: number;
  assignedTechnicianUserId: number;
  scheduledDate: string; // YYYY-MM-DD
}

export interface UpdateWorkOrderStatusDTO {
  status: WorkOrderStatus;
  resolutionNotes?: string;
}

export interface UpdateMaintenanceStatusDto {
  id: number;
  status: MaintenanceRequestStatus;
  assignedStaffId?: number;
  assignedStaffName?: string;
  resolutionNotes?: string;
}

export interface MaintenanceFilterParams {
  status?: MaintenanceRequestStatus | 'ALL';
  priority?: MaintenancePriority | 'ALL';
  category?: string | 'ALL';
  searchQuery?: string;
  unitId?: number;
}

export type FacilityOperationalStatus =
  | 'OPERATIONAL'
  | 'UNDER_MAINTENANCE'
  | 'OUT_OF_SERVICE'
  | 'INSPECTION_PENDING';

export interface FacilityAsset {
  id: string;
  name: string;
  category: 'ELEVATOR' | 'HVAC_CENTRAL' | 'POWER_GENERATOR' | 'WATER_PUMP' | 'AMENITY' | 'SECURITY';
  location: string;
  status: FacilityOperationalStatus;
  lastInspectedDate: string;
  nextInspectionDue: string;
  technicianInCharge: string;
  healthScore: number; // 0-100
}

export interface VisitorRecord {
  id: string;
  visitorName: string;
  contactNumber: string;
  unitNumber: string;
  hostResident: string;
  purpose: 'VISIT' | 'DELIVERY' | 'CONTRACTOR' | 'INSPECTION' | 'OTHER';
  checkInTime: string;
  checkOutTime?: string;
  status: 'CHECKED_IN' | 'CHECKED_OUT' | 'EXPECTED';
  passNumber: string;
}

export interface SystemHealthInfo {
  status: 'UP' | 'DOWN' | 'DEGRADED';
  service: string;
  port: number;
  database: 'CONNECTED' | 'DISCONNECTED';
  checkedAt: string;
  responseTimeMs: number;
  actuatorEndpoint?: string;
  components?: Record<string, { status?: string; details?: Record<string, unknown> }>;
  info?: Record<string, unknown>;
  jwtSecurityActive?: boolean;
}
