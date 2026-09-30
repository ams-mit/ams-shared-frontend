// src/features/billing/api/billingApi.ts
import { apiClient } from '@/services/api/client';
import type {
  ApiResponse,
  ApiListResponse,
  ChargeRule,
  CreateChargeRuleRequest,
  UpdateChargeRuleStatusRequest,
  Invoice,
  InvoiceLine,
  GenerateInvoiceRequest,
  UpdateInvoiceStatusRequest,
  Payment,
  RecordPaymentRequest,
  UpdatePaymentStatusRequest,
  Receipt,
  Adjustment,
  CreateAdjustmentRequest,
  UnitBalance,
  FinanceDashboardSummary,
  ArrearsItem,
  CollectionSummaryItem,
  ChargeType,
} from '../types/billing.types';

export const billingApi = {
  // -------------------------------------------------------------------------
  // 5.1 Charge Rules (BILL-001 to BILL-006)
  // -------------------------------------------------------------------------
  createChargeRule: async (data: CreateChargeRuleRequest): Promise<ChargeRule> => {
    const res = await apiClient.post<ApiResponse<ChargeRule>>('/charge-rules', data);
    return res.data.data;
  },

  getChargeRules: async (params?: { page?: number; size?: number; status?: string }): Promise<ApiListResponse<ChargeRule>> => {
    const res = await apiClient.get<ApiListResponse<ChargeRule>>('/charge-rules', { params });
    return res.data;
  },

  getChargeRuleById: async (chargeRuleId: number): Promise<ChargeRule> => {
    const res = await apiClient.get<ApiResponse<ChargeRule>>(`/charge-rules/${chargeRuleId}`);
    return res.data.data;
  },

  updateChargeRule: async (chargeRuleId: number, data: CreateChargeRuleRequest): Promise<ChargeRule> => {
    const res = await apiClient.put<ApiResponse<ChargeRule>>(`/charge-rules/${chargeRuleId}`, data);
    return res.data.data;
  },

  updateChargeRuleStatus: async (chargeRuleId: number, data: UpdateChargeRuleStatusRequest): Promise<ChargeRule> => {
    const res = await apiClient.patch<ApiResponse<ChargeRule>>(`/charge-rules/${chargeRuleId}/status`, data);
    return res.data.data;
  },

  getChargeRulesByType: async (chargeType: ChargeType): Promise<ChargeRule[]> => {
    const res = await apiClient.get<ApiResponse<ChargeRule[]>>(`/charge-rules/type/${chargeType}`);
    return res.data.data;
  },

  // -------------------------------------------------------------------------
  // 5.2 Invoices (BILL-007 to BILL-013)
  // -------------------------------------------------------------------------
  generateInvoice: async (data: GenerateInvoiceRequest): Promise<Invoice> => {
    const res = await apiClient.post<ApiResponse<Invoice>>('/invoices', data);
    return res.data.data;
  },

  getInvoices: async (params?: { page?: number; size?: number; status?: string; unitId?: string }): Promise<ApiListResponse<Invoice>> => {
    const res = await apiClient.get<ApiListResponse<Invoice>>('/invoices', { params });
    return res.data;
  },

  getInvoiceById: async (invoiceId: string): Promise<Invoice> => {
    const res = await apiClient.get<ApiResponse<Invoice>>(`/invoices/${invoiceId}`);
    return res.data.data;
  },

  getInvoicesByUnit: async (unitId: string): Promise<Invoice[]> => {
    const res = await apiClient.get<ApiResponse<Invoice[]>>(`/invoices/units/${unitId}`);
    return res.data.data;
  },

  getInvoiceByUnitAndPeriod: async (unitId: string, year: number, month: number): Promise<Invoice> => {
    const res = await apiClient.get<ApiResponse<Invoice>>(`/invoices/units/${unitId}/period/${year}/${month}`);
    return res.data.data;
  },

  updateInvoiceStatus: async (invoiceId: string, data: UpdateInvoiceStatusRequest): Promise<Invoice> => {
    const res = await apiClient.patch<ApiResponse<Invoice>>(`/invoices/${invoiceId}/status`, data);
    return res.data.data;
  },

  getInvoiceLines: async (invoiceId: string): Promise<InvoiceLine[]> => {
    const res = await apiClient.get<ApiResponse<InvoiceLine[]>>(`/invoices/${invoiceId}/lines`);
    return res.data.data;
  },

  // -------------------------------------------------------------------------
  // 5.3 Payments (BILL-014 to BILL-020)
  // -------------------------------------------------------------------------
  recordPayment: async (data: RecordPaymentRequest): Promise<Payment> => {
    const res = await apiClient.post<ApiResponse<Payment>>('/payments', data);
    return res.data.data;
  },

  getPayments: async (params?: { page?: number; size?: number; status?: string }): Promise<ApiListResponse<Payment>> => {
    const res = await apiClient.get<ApiListResponse<Payment>>('/payments', { params });
    return res.data;
  },

  getPaymentById: async (paymentId: number): Promise<Payment> => {
    const res = await apiClient.get<ApiResponse<Payment>>(`/payments/${paymentId}`);
    return res.data.data;
  },

  getPaymentsByInvoice: async (invoiceId: number): Promise<Payment[]> => {
    const res = await apiClient.get<ApiResponse<Payment[]>>(`/payments/invoices/${invoiceId}`);
    return res.data.data;
  },

  getPaymentsByUnit: async (unitId: string): Promise<Payment[]> => {
    const res = await apiClient.get<ApiResponse<Payment[]>>(`/payments/units/${unitId}`);
    return res.data.data;
  },

  updatePaymentStatus: async (paymentId: number, data: UpdatePaymentStatusRequest): Promise<Payment> => {
    const res = await apiClient.patch<ApiResponse<Payment>>(`/payments/${paymentId}/status`, data);
    return res.data.data;
  },

  // -------------------------------------------------------------------------
  // 5.4 Receipts (BILL-021 to BILL-023)
  // -------------------------------------------------------------------------
  getReceiptById: async (receiptId: number): Promise<Receipt> => {
    const res = await apiClient.get<ApiResponse<Receipt>>(`/receipts/${receiptId}`);
    return res.data.data;
  },

  getReceiptByPaymentId: async (paymentId: number): Promise<Receipt> => {
    const res = await apiClient.get<ApiResponse<Receipt>>(`/receipts/payments/${paymentId}`);
    return res.data.data;
  },

  getReceiptsByUnit: async (unitId: string): Promise<Receipt[]> => {
    const res = await apiClient.get<ApiResponse<Receipt[]>>(`/receipts/units/${unitId}`);
    return res.data.data;
  },

  // -------------------------------------------------------------------------
  // 5.5 Adjustments & 5.6 Balance (BILL-024 to BILL-027)
  // -------------------------------------------------------------------------
  createAdjustment: async (data: CreateAdjustmentRequest): Promise<Adjustment> => {
    const res = await apiClient.post<ApiResponse<Adjustment>>('/adjustments', data);
    return res.data.data;
  },

  getAdjustmentsByInvoice: async (invoiceId: string): Promise<Adjustment[]> => {
    const res = await apiClient.get<ApiResponse<Adjustment[]>>(`/adjustments/invoices/${invoiceId}`);
    return res.data.data;
  },

  getUnitBalance: async (unitId: string): Promise<UnitBalance> => {
    const res = await apiClient.get<ApiResponse<UnitBalance>>(`/balance/units/${unitId}`);
    return res.data.data;
  },

  // -------------------------------------------------------------------------
  // 5.7 Reports & Dashboard (BILL-029 to BILL-032)
  // -------------------------------------------------------------------------
  getFinanceDashboardSummary: async (): Promise<FinanceDashboardSummary> => {
    const res = await apiClient.get<ApiResponse<FinanceDashboardSummary>>('/reports/finance-dashboard');
    return res.data.data;
  },

  getArrearsReport: async (params?: { buildingId?: string; year?: number; month?: number }): Promise<ArrearsItem[]> => {
    const res = await apiClient.get<ApiResponse<ArrearsItem[]>>('/reports/arrears', { params });
    return res.data.data;
  },

  getCollectionSummary: async (): Promise<CollectionSummaryItem[]> => {
    const res = await apiClient.get<ApiResponse<CollectionSummaryItem[]>>('/reports/collection-summary');
    return res.data.data;
  },
};