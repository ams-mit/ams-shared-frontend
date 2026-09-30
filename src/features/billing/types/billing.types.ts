// src/features/billing/types/billing.types.ts

/**
 * Standard Envelope matching API Reference v2.1 Section 3.1
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  requestId: string;
}

export interface PaginationMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

export interface ApiListResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: PaginationMeta;
  timestamp: string;
  requestId: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error: {
    code: string;
    details: string | null | Record<string, string>;
  };
  timestamp: string;
  requestId: string;
}

// ---------------------------------------------------------------------------
// Charge Rules
// ---------------------------------------------------------------------------
export type ChargeType = 'MANAGEMENT' | 'PARKING' | 'FACILITY' | 'OTHER';
export type ChargeRuleStatus = 'ACTIVE' | 'INACTIVE';
export type BillingPeriodType = 'MONTHLY' | 'QUARTERLY';

export interface ChargeRule {
  id: number;
  name: string;
  chargeType: ChargeType;
  amount: number;
  billingPeriod: BillingPeriodType;
  applicableToAllUnits: boolean;
  status: ChargeRuleStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CreateChargeRuleRequest {
  name: string;
  chargeType: ChargeType;
  amount: number;
  billingPeriod: BillingPeriodType;
  applicableToAllUnits?: boolean;
}

export interface UpdateChargeRuleStatusRequest {
  status: ChargeRuleStatus;
}

// ---------------------------------------------------------------------------
// Invoices & Invoice Lines (Snapshot rule)
// ---------------------------------------------------------------------------
export type InvoiceStatus = 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface InvoiceLine {
  id: number;
  chargeRuleId?: number;
  chargeRuleName: string; // Snapshot
  chargeType: string;     // Snapshot
  amount: number;         // Fixed snapshot at generation time
  createdAt: string;
}

export interface Invoice {
  id: number;
  unitId: string;
  residentId: string;
  billingPeriod: string;
  billingYear: number;
  billingMonth: number;
  totalAmount: number;
  status: InvoiceStatus;
  issuedAt: string;
  issuedBy: string;
  lines?: InvoiceLine[];
}

export interface GenerateInvoiceRequest {
  unitId: string;
  billingYear: number;
  billingMonth: number;
}

export interface UpdateInvoiceStatusRequest {
  status: InvoiceStatus;
  reason?: string;
}

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------
export type PaymentMethod = 'BANK_TRANSFER' | 'CARD' | 'CASH' | 'CHEQUE';
export type PaymentStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED';

export interface Payment {
  id: number;
  invoiceId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  status: PaymentStatus;
  recordedAt: string;
  recordedBy: string;
}

export interface RecordPaymentRequest {
  invoiceId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
}

export interface UpdatePaymentStatusRequest {
  status: 'CONFIRMED' | 'REJECTED';
  reason?: string; // Required when REJECTED
}

// ---------------------------------------------------------------------------
// Receipts (Immutable)
// ---------------------------------------------------------------------------
export interface Receipt {
  id: number;
  paymentId: number;
  unitId: string;
  billingPeriod: string;
  amountPaid: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  issuedAt: string;
}

// ---------------------------------------------------------------------------
// Adjustments
// ---------------------------------------------------------------------------
export type AdjustmentType = 'CREDIT' | 'DEBIT';

export interface Adjustment {
  id: number;
  invoiceId: number;
  adjustmentType: AdjustmentType;
  amount: number;
  reason: string; // Minimum 10 chars enforced
  createdAt: string;
  createdBy: string;
}

export interface CreateAdjustmentRequest {
  invoiceId: number;
  adjustmentType: AdjustmentType;
  amount: number;
  reason: string;
}

// ---------------------------------------------------------------------------
// Balance
// ---------------------------------------------------------------------------
export interface UnitBalance {
  unitId: string;
  outstandingBalance: number;
  overdueCount: number;
  lastInvoiceDate: string | null;
  lastPaymentDate: string | null;
}

// ---------------------------------------------------------------------------
// Reports & Finance Dashboard
// ---------------------------------------------------------------------------
export interface FinanceDashboardSummary {
  totalInvoicedThisMonth: number;
  totalCollectedThisMonth: number;
  totalOutstanding: number;
  overdueAccountsCount: number;
  collectionRatePercent: number;
}

export interface ArrearsItem {
  unitId: string;
  residentName: string;
  outstandingBalance: number;
  overdueMonths: number;
  lastPaymentDate: string | null;
}

export interface CollectionSummaryItem {
  period: string;
  totalInvoiced: number;
  totalCollected: number;
  ratePercent: number;
}