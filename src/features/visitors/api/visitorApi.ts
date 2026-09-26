import { apiClient } from '@/services/api/client';
import { Visitor, VisitorRequest, VisitorFilters } from '../types/visitor.types';
import { appStorage } from '@/services/storage/appStorage';

export const visitorApi = {
  // Pre-register a visitor
  registerVisitor: async (request: VisitorRequest): Promise<Visitor> => {
    try {
      const response = await apiClient.post<Visitor>('/visitors', request);
      const created = { ...response.data };
      const currentVisitors = appStorage.loadVisitors();
      const updated = [created, ...currentVisitors.filter((v) => v.id !== created.id)];
      appStorage.saveVisitors(updated);
      return created;
    } catch {
      // Simulate persistent visitor registration offline
      const newVisitor: Visitor = {
        id: Date.now(),
        visitorName: request.visitorName,
        residentId: request.residentId,
        unitId: request.unitId,
        purpose: request.purpose,
        visitDate: request.visitDate,
        visitorPhone: request.visitorPhone,
        vehicleNumber: request.vehicleNumber,
        passCode: 'PASS-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        status: 'EXPECTED',
        checkedInAt: null,
        checkedOutAt: null,
        createdAt: new Date().toISOString(),
      };
      const currentVisitors = appStorage.loadVisitors();
      const updated = [newVisitor, ...currentVisitors.filter((v) => v.id !== newVisitor.id)];
      appStorage.saveVisitors(updated);
      return newVisitor;
    }
  },

  // Security gate check-in
  checkInVisitor: async (visitorId: number): Promise<Visitor> => {
    try {
      const response = await apiClient.patch<Visitor>(`/visitors/${visitorId}/check-in`);
      const updated = { ...response.data };
      const currentVisitors = appStorage.loadVisitors();
      const nextList = currentVisitors.map((v) => (v.id === visitorId ? updated : v));
      appStorage.saveVisitors(nextList);
      return updated;
    } catch {
      const currentVisitors = appStorage.loadVisitors();
      const existing = currentVisitors.find((v) => v.id === visitorId);
      if (!existing) {
        throw new Error('Visitor not found');
      }
      const updated: Visitor = {
        ...existing,
        status: 'CHECKED_IN',
        checkedInAt: new Date().toISOString(),
      };
      const nextList = currentVisitors.map((v) => (v.id === visitorId ? updated : v));
      appStorage.saveVisitors(nextList);
      return updated;
    }
  },

  // Security gate check-out
  checkOutVisitor: async (visitorId: number): Promise<Visitor> => {
    try {
      const response = await apiClient.patch<Visitor>(`/visitors/${visitorId}/check-out`);
      const updated = { ...response.data };
      const currentVisitors = appStorage.loadVisitors();
      const nextList = currentVisitors.map((v) => (v.id === visitorId ? updated : v));
      appStorage.saveVisitors(nextList);
      return updated;
    } catch {
      const currentVisitors = appStorage.loadVisitors();
      const existing = currentVisitors.find((v) => v.id === visitorId);
      if (!existing) {
        throw new Error('Visitor not found');
      }
      const updated: Visitor = {
        ...existing,
        status: 'CHECKED_OUT',
        checkedOutAt: new Date().toISOString(),
      };
      const nextList = currentVisitors.map((v) => (v.id === visitorId ? updated : v));
      appStorage.saveVisitors(nextList);
      return updated;
    }
  },

  // Cancel pass
  cancelVisitorPass: async (visitorId: number): Promise<Visitor> => {
    try {
      const response = await apiClient.patch<Visitor>(`/visitors/${visitorId}/cancel`);
      const updated = { ...response.data };
      const currentVisitors = appStorage.loadVisitors();
      const nextList = currentVisitors.map((v) => (v.id === visitorId ? updated : v));
      appStorage.saveVisitors(nextList);
      return updated;
    } catch {
      const currentVisitors = appStorage.loadVisitors();
      const existing = currentVisitors.find((v) => v.id === visitorId);
      if (!existing) {
        throw new Error('Visitor not found');
      }
      const updated: Visitor = {
        ...existing,
        status: 'CANCELLED',
      };
      const nextList = currentVisitors.map((v) => (v.id === visitorId ? updated : v));
      appStorage.saveVisitors(nextList);
      return updated;
    }
  },

  // Verify passCode for QR gate scanner
  verifyPassCode: async (passCode: string): Promise<Visitor> => {
    const cleanCode = encodeURIComponent(passCode.trim());
    try {
      const response = await apiClient.get<Visitor>(`/visitors/verify/${cleanCode}`);
      return response.data;
    } catch (err: unknown) {
      // Offline fallback lookup
      const currentVisitors = appStorage.loadVisitors();
      const found = currentVisitors.find(
        (v) => (v.passCode && v.passCode.toUpperCase() === passCode.trim().toUpperCase()) ||
               `#VIS-${v.id}`.toUpperCase() === passCode.trim().toUpperCase()
      );
      if (found) {
        return found;
      }
      throw err;
    }
  },

  // Get all visitors with optional filters
  getAllVisitors: async (filters?: VisitorFilters): Promise<Visitor[]> => {
    try {
      const params: Record<string, unknown> = {};
      if (filters?.residentId) params.residentId = filters.residentId;
      if (filters?.status && filters.status !== 'ALL') params.status = filters.status;
      if (filters?.visitDate) params.visitDate = filters.visitDate;

      const response = await apiClient.get<Visitor[]>('/visitors', { params });
      if (response.data && Array.isArray(response.data)) {
        appStorage.saveVisitors(response.data);
        return response.data;
      }
      return appStorage.loadVisitors();
    } catch {
      return appStorage.loadVisitors();
    }
  },
};
