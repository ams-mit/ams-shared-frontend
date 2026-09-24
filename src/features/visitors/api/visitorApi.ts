import { apiClient } from '@/services/api/client';
import { Visitor, VisitorRequest } from '../types/visitor.types';
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
      return { ...created };
    } catch {
      // Simulate persistent visitor registration
      const newVisitor: Visitor = {
        id: Date.now(),
        visitorName: request.visitorName,
        residentId: request.residentId,
        unitId: request.unitId,
        purpose: request.purpose,
        visitDate: request.visitDate,
        status: 'EXPECTED',
        checkedInAt: null,
        createdAt: new Date().toISOString(),
      };
      const currentVisitors = appStorage.loadVisitors();
      const updated = [newVisitor, ...currentVisitors.filter((v) => v.id !== newVisitor.id)];
      appStorage.saveVisitors(updated);
      return { ...newVisitor };
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
      return { ...updated };
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
      return { ...updated };
    }
  },

  // Get all visitors
  getAllVisitors: async (): Promise<Visitor[]> => {
    try {
      const response = await apiClient.get<Visitor[]>('/visitors');
      if (response.data && Array.isArray(response.data)) {
        appStorage.saveVisitors(response.data);
        return response.data.map((v) => ({ ...v }));
      }
      return appStorage.loadVisitors();
    } catch {
      return appStorage.loadVisitors();
    }
  },
};
