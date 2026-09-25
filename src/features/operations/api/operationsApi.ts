import { apiClient } from '@/services/api/client';
import {
  CreateMaintenanceRequestDto,
  CreateWorkOrderDTO,
  MaintenanceFilterParams,
  MaintenanceRequest,
  MaintenanceRequestResponseDTO,
  SystemHealthInfo,
  UpdateMaintenanceStatusDto,
  UpdateWorkOrderStatusDTO,
  WorkOrderResponseDTO,
} from '@/features/operations/types/operations.types';

export const operationsApi = {
  // Check backend health via Spring Boot Actuator endpoint (/actuator/health)
  async checkHealth(): Promise<SystemHealthInfo> {
    const startTime = performance.now();
    try {
      const response = await apiClient.get<{
        status: string;
        components?: Record<string, { status?: string; details?: Record<string, unknown> }>;
      }>('/actuator/health');
      const duration = Math.round(performance.now() - startTime);

      let infoData: Record<string, unknown> | undefined;
      try {
        const infoRes = await apiClient.get<Record<string, unknown>>('/actuator/info');
        infoData = infoRes.data;
      } catch {
        // /actuator/info optional if not populated
      }

      const isUp = response.data?.status === 'UP';
      const hasDbComponent = response.data?.components?.db?.status;

      return {
        status: isUp ? 'UP' : 'DEGRADED',
        service: 'operations-service',
        port: 8084,
        database: hasDbComponent ? (hasDbComponent === 'UP' ? 'CONNECTED' : 'DISCONNECTED') : 'CONNECTED',
        checkedAt: new Date().toISOString(),
        responseTimeMs: duration,
        actuatorEndpoint: '/actuator/health',
        components: response.data?.components,
        info: infoData,
        jwtSecurityActive: true,
      };
    } catch {
      const duration = Math.round(performance.now() - startTime);
      return {
        status: 'DOWN',
        service: 'operations-service',
        port: 8084,
        database: 'DISCONNECTED',
        checkedAt: new Date().toISOString(),
        responseTimeMs: duration,
        actuatorEndpoint: '/actuator/health',
        jwtSecurityActive: true,
      };
    }
  },

  // --- Maintenance Requests API (/api/v1/maintenance-requests) ---

  // Fetch all or filtered maintenance requests
  async getMaintenanceRequests(params?: MaintenanceFilterParams): Promise<MaintenanceRequest[]> {
    const queryParams: Record<string, string> = {};
    if (params?.status && params.status !== 'ALL') {
      queryParams.status = params.status;
    }
    if (params?.priority && params.priority !== 'ALL') {
      queryParams.priority = params.priority;
    }

    const response = await apiClient.get<MaintenanceRequestResponseDTO[]>(
      '/api/v1/maintenance-requests',
      { params: queryParams }
    );

    // Map backend response DTO to frontend model
    return response.data.map((item) => ({
      id: item.id,
      unitId: item.unitId,
      requestedByUserId: item.requestedByUserId,
      category: item.category,
      priority: item.priority as any,
      description: item.description,
      attachmentUrl: item.attachmentUrl,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  },

  // Get single maintenance request by ID
  async getMaintenanceRequestById(id: number): Promise<MaintenanceRequest> {
    const response = await apiClient.get<MaintenanceRequestResponseDTO>(
      `/api/v1/maintenance-requests/${id}`
    );
    const item = response.data;
    return {
      id: item.id,
      unitId: item.unitId,
      requestedByUserId: item.requestedByUserId,
      category: item.category,
      priority: item.priority as any,
      description: item.description,
      attachmentUrl: item.attachmentUrl,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  },

  // Create a new maintenance request
  async createMaintenanceRequest(dto: CreateMaintenanceRequestDto): Promise<MaintenanceRequest> {
    const response = await apiClient.post<MaintenanceRequestResponseDTO>(
      '/api/v1/maintenance-requests',
      {
        unitId: dto.unitId,
        category: dto.category,
        priority: dto.priority,
        description: dto.description,
        attachmentUrl: dto.attachmentUrl || undefined,
      }
    );
    const item = response.data;
    return {
      id: item.id,
      unitId: item.unitId,
      requestedByUserId: item.requestedByUserId,
      category: item.category,
      priority: item.priority as any,
      description: item.description,
      attachmentUrl: item.attachmentUrl,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  },

  // Update status
  async updateMaintenanceStatus(dto: UpdateMaintenanceStatusDto): Promise<MaintenanceRequest> {
    const response = await apiClient.patch<MaintenanceRequestResponseDTO>(
      `/api/v1/maintenance-requests/${dto.id}/status`,
      { status: dto.status }
    );
    const item = response.data;
    
    return {
      id: item.id,
      category: item.category,
      priority: item.priority as any,
      description: item.description,
      status: item.status,
      createdAt: item.createdAt,
      assignedStaffName: dto.assignedStaffName,
      resolutionNotes: dto.resolutionNotes,
    };
  },

  // --- Work Orders API (/api/v1/work-orders) ---

  // Get all work orders
  async getWorkOrders(): Promise<WorkOrderResponseDTO[]> {
    const response = await apiClient.get<WorkOrderResponseDTO[]>('/api/v1/work-orders');
    return response.data;
  },

  // Create and assign a work order
  async createWorkOrder(dto: CreateWorkOrderDTO): Promise<WorkOrderResponseDTO> {
    const response = await apiClient.post<WorkOrderResponseDTO>('/api/v1/work-orders', dto);
    return response.data;
  },

  // Update work order status and resolution notes
  async updateWorkOrderStatus(
    orderId: number,
    dto: UpdateWorkOrderStatusDTO
  ): Promise<WorkOrderResponseDTO> {
    const response = await apiClient.patch<WorkOrderResponseDTO>(
      `/api/v1/work-orders/${orderId}/status`,
      dto
    );
    return response.data;
  },
};
