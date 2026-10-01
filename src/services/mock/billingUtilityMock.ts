import type {
  Adjustment,
  ApiListResponse,
  ArrearsItem,
  ChargeRule,
  ChargeType,
  CollectionSummaryItem,
  CreateAdjustmentRequest,
  CreateChargeRuleRequest,
  FinanceDashboardSummary,
  GenerateInvoiceRequest,
  Invoice,
  InvoiceLine,
  InvoiceStatus,
  Payment,
  Receipt,
  RecordPaymentRequest,
  UnitBalance,
  UpdateChargeRuleStatusRequest,
  UpdateInvoiceStatusRequest,
  UpdatePaymentStatusRequest,
} from '@/features/billing/types/billing.types';
import type {
  CreateUtilityChargeRequest,
  CreateUtilityRateRequest,
  UtilityCharge,
  UtilityRate,
  UtilityType,
} from '@/features/utilities/types/utility.types';
import { createCollection, fail, isManager, mockActor, nowIso, numericId, paginate, respond, today, uuid } from './mockDb';
import { findResidentByProfileId, profileIdFor, stableUuid } from './people';
import { activeTenantProfileId, findUnitByReference, unitLabel } from './propertyLeaseMock';

// Demo-mode stand-in for billing-payment-service and utility-charge-service. Units are referred
// to by their "A-402" style reference. Invoices snapshot the active charge rules and the unit's
// utility charges for the period; status follows payments, adjustments and the due date.

// ---- Periods ---------------------------------------------------------------------------

interface Period {
  year: number;
  month: number;
}

const periodBefore = (monthsBack: number): Period => {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - monthsBack);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
};

const periodKey = ({ year, month }: Period) => `${year}-${String(month).padStart(2, '0')}`;
const periodStart = ({ year, month }: Period) => `${periodKey({ year, month })}-01`;
/** Invoices are due on the 15th of the month after the billing period. */
const dueDate = ({ year, month }: Period) => {
  const next = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
  return `${periodKey(next)}-15`;
};
const isoAt = (date: string, time = '09:00:00') => `${date}T${time}Z`;

const LAST = periodBefore(1);
const PREVIOUS = periodBefore(2);

// ---- Seed data -------------------------------------------------------------------------

const STAFF_NAME = 'Grace Okafor';
const SEEDED_AT = '2025-01-06T09:00:00Z';

const chargeRules = createCollection<ChargeRule>('charge_rules', () =>
  (
    [
      ['mgmt', 'Monthly Management Fee', 'MANAGEMENT_FEE', 15000, 'MONTHLY', 'ACTIVE'],
      ['parking', 'Covered Parking Bay', 'PARKING_FEE', 3500, 'MONTHLY', 'ACTIVE'],
      ['club', 'Clubhouse & Pool Access', 'FACILITY_FEE', 2500, 'MONTHLY', 'ACTIVE'],
      ['sinking', 'Quarterly Sinking Fund', 'MANAGEMENT_FEE', 12000, 'QUARTERLY', 'INACTIVE'],
    ] as const
  ).map(([key, name, chargeType, amount, billingPeriod, status]) => ({
    id: stableUuid(`charge-rule:${key}`),
    name,
    chargeType,
    amount,
    billingPeriod,
    applicableToAllUnits: true,
    status,
    createdAt: SEEDED_AT,
    updatedAt: SEEDED_AT,
    createdBy: STAFF_NAME,
  }))
);

const utilityRates = createCollection<UtilityRate>('utility_rates', () => [
  { id: 1, utilityType: 'WATER', ratePerUnit: 120, unitOfMeasure: 'm³', status: 'ACTIVE', effectiveDate: '2026-01-01' },
  { id: 2, utilityType: 'ELECTRICITY', ratePerUnit: 48, unitOfMeasure: 'kWh', status: 'ACTIVE', effectiveDate: '2026-01-01' },
  { id: 3, utilityType: 'GAS', ratePerUnit: 310, unitOfMeasure: 'kg', status: 'ACTIVE', effectiveDate: '2026-01-01' },
  { id: 4, utilityType: 'ELECTRICITY', ratePerUnit: 42, unitOfMeasure: 'kWh', status: 'INACTIVE', effectiveDate: '2025-01-01' },
]);

const BILLED_UNITS = ['A-402', 'A-108', 'A-904', 'B-205'];

// Usage per unit for [previous, last] period.
const USAGE: Record<string, { WATER: [number, number]; ELECTRICITY: [number, number] }> = {
  'A-402': { WATER: [14, 16], ELECTRICITY: [212, 236] },
  'A-108': { WATER: [9, 8], ELECTRICITY: [145, 160] },
  'A-904': { WATER: [21, 19], ELECTRICITY: [318, 297] },
  'B-205': { WATER: [12, 13], ELECTRICITY: [190, 205] },
};

const SEED_RATES: Record<'WATER' | 'ELECTRICITY', number> = { WATER: 120, ELECTRICITY: 48 };

const utilityCharges = createCollection<UtilityCharge>('utility_charges', () =>
  BILLED_UNITS.flatMap((unit, u) =>
    [PREVIOUS, LAST].flatMap((period, p) =>
      (['WATER', 'ELECTRICITY'] as const).map((type, t) => ({
        id: 1000 + u * 10 + p * 2 + t,
        unitId: unit,
        utilityType: type,
        billingYear: period.year,
        billingMonth: period.month,
        usageValue: USAGE[unit][type][p],
        ratePerUnit: SEED_RATES[type],
        calculatedAmount: USAGE[unit][type][p] * SEED_RATES[type],
        recordedAt: isoAt(`${periodKey(period)}-28`),
        recordedBy: STAFF_NAME,
      }))
    )
  )
);

const MONTHLY_SEED_RULES: [string, string, ChargeType, number][] = [
  ['mgmt', 'Monthly Management Fee', 'MANAGEMENT_FEE', 15000],
  ['parking', 'Covered Parking Bay', 'PARKING_FEE', 3500],
  ['club', 'Clubhouse & Pool Access', 'FACILITY_FEE', 2500],
];

interface StoredInvoice extends Omit<Invoice, 'lines'> {
  lines: InvoiceLine[];
  dueDate: string;
}

const seedInvoiceId = (unit: string, period: Period) => stableUuid(`invoice:${unit}:${periodKey(period)}`);

const RESIDENT_OF: Record<string, string> = {
  'A-402': 'resident-001',
  'A-108': 'resident-003',
  'A-904': 'resident-005',
  'B-205': 'resident-002',
};

const invoices = createCollection<StoredInvoice>('invoices', () =>
  BILLED_UNITS.flatMap((unit) =>
    [PREVIOUS, LAST].map((period, p) => {
      const issuedDate = dueDate(period).replace(/-15$/, '-01');
      const lines: InvoiceLine[] = [
        ...MONTHLY_SEED_RULES.map(([key, name, type, amount]) => ({
          id: stableUuid(`line:${unit}:${periodKey(period)}:${key}`),
          chargeRuleId: stableUuid(`charge-rule:${key}`),
          chargeRuleName: name,
          chargeType: type,
          amount,
          createdAt: isoAt(issuedDate),
        })),
        ...(['WATER', 'ELECTRICITY'] as const).map((type) => ({
          id: stableUuid(`line:${unit}:${periodKey(period)}:${type}`),
          chargeRuleName: `${type === 'WATER' ? 'Water' : 'Electricity'} usage`,
          chargeType: `UTILITY_${type}`,
          amount: USAGE[unit][type][p] * SEED_RATES[type],
          createdAt: isoAt(issuedDate),
        })),
      ];
      return {
        id: seedInvoiceId(unit, period),
        unitId: unit,
        residentId: profileIdFor(RESIDENT_OF[unit]),
        billingPeriod: periodKey(period),
        billingYear: period.year,
        billingMonth: period.month,
        totalAmount: lines.reduce((sum, l) => sum + l.amount, 0),
        status: 'ISSUED' as InvoiceStatus,
        issuedAt: isoAt(issuedDate),
        issuedBy: STAFF_NAME,
        lines,
        dueDate: dueDate(period),
      };
    })
  )
);

const seedTotal = (unit: string, p: number) =>
  MONTHLY_SEED_RULES.reduce((s, r) => s + r[3], 0) +
  USAGE[unit].WATER[p] * SEED_RATES.WATER +
  USAGE[unit].ELECTRICITY[p] * SEED_RATES.ELECTRICITY;

// [unit, period index, share of the invoice paid, status, method]
const PAYMENT_SEED: [string, number, number, Payment['status'], Payment['paymentMethod']][] = [
  ['A-402', 0, 1, 'CONFIRMED', 'BANK_TRANSFER'],
  ['A-108', 0, 1, 'CONFIRMED', 'CARD'],
  ['A-904', 0, 1, 'CONFIRMED', 'BANK_TRANSFER'],
  ['A-402', 1, 1, 'CONFIRMED', 'CARD'],
  ['A-108', 1, 0.5, 'CONFIRMED', 'CASH'],
  ['A-904', 1, 1, 'PENDING', 'CHEQUE'],
];

const seedPayments = (): Payment[] =>
  PAYMENT_SEED.map(([unit, p, share, status, method], i) => {
    const period = [PREVIOUS, LAST][p];
    const paidOn = p === 0 ? `${dueDate(period).slice(0, 8)}05` : today();
    return {
      id: stableUuid(`payment:${unit}:${p}`),
      invoiceId: seedInvoiceId(unit, period),
      amount: Math.round(seedTotal(unit, p) * share),
      paymentDate: paidOn,
      paymentMethod: method,
      referenceNumber: `TXN-${periodKey(period).replace('-', '')}-${100 + i}`,
      status,
      recordedAt: isoAt(paidOn, '11:30:00'),
      recordedBy: STAFF_NAME,
    };
  });

const payments = createCollection<Payment>('payments', seedPayments);

// Seeded from the seed payments only: collections seed lazily, so reading the live payments
// here would also pick up payments made before receipts were first loaded.
const receipts = createCollection<Receipt>('receipts', () =>
  seedPayments()
    .filter((p) => p.status === 'CONFIRMED')
    .map((p) => {
      const invoice = invoices.find(p.invoiceId)!;
      return {
        id: stableUuid(`receipt:${p.id}`),
        paymentId: p.id,
        unitId: invoice.unitId,
        billingPeriod: invoice.billingPeriod,
        amountPaid: p.amount,
        paymentDate: p.paymentDate,
        paymentMethod: p.paymentMethod,
        referenceNumber: p.referenceNumber,
        issuedAt: p.recordedAt,
      };
    })
);

const adjustments = createCollection<Adjustment>('adjustments', () => []);

// ---- Invoice maths ----------------------------------------------------------------------

const confirmedPaid = (invoiceId: string) =>
  payments
    .all()
    .filter((p) => p.invoiceId === invoiceId && p.status === 'CONFIRMED')
    .reduce((sum, p) => sum + p.amount, 0);

const adjustmentTotal = (invoiceId: string) =>
  adjustments
    .all()
    .filter((a) => a.invoiceId === invoiceId)
    .reduce((sum, a) => sum + (a.adjustmentType === 'DEBIT' ? a.amount : -a.amount), 0);

const outstandingOf = (invoice: StoredInvoice) =>
  invoice.status === 'CANCELLED' ? 0 : Math.max(0, invoice.totalAmount + adjustmentTotal(invoice.id) - confirmedPaid(invoice.id));

/** Status follows payments, adjustments and the due date (except a cancelled invoice). */
const currentStatus = (invoice: StoredInvoice): InvoiceStatus => {
  if (invoice.status === 'CANCELLED') return 'CANCELLED';
  if (outstandingOf(invoice) <= 0) return 'PAID';
  if (today() > invoice.dueDate) return 'OVERDUE';
  return confirmedPaid(invoice.id) > 0 ? 'PARTIALLY_PAID' : 'ISSUED';
};

const present = (invoice: StoredInvoice): Invoice => {
  const { dueDate: _due, ...rest } = invoice;
  return { ...rest, status: currentStatus(invoice) };
};

const requireInvoice = (id: string) => invoices.require(String(id), 'INVOICE_NOT_FOUND', 'This invoice could not be found.');

const resolveUnitReference = (reference: string): string => {
  const unit = findUnitByReference(reference);
  if (!unit) {
    fail(404, 'UNIT_NOT_FOUND', `No unit matches "${reference.trim()}". Use a unit reference such as A-402.`, {
      unitId: 'Unknown unit.',
    });
  }
  return unitLabel(unit!);
};

const matchesUnit = (stored: string, query?: string) => {
  if (!query?.trim()) return true;
  const unit = findUnitByReference(query);
  return unit ? stored === unitLabel(unit) : stored.toUpperCase().includes(query.trim().toUpperCase());
};

const listResponse = <T,>(rows: T[], page = 0, size = 20, message = 'OK'): ApiListResponse<T> => {
  const { items, pagination } = paginate(rows, page, size);
  return {
    success: true,
    message,
    data: items,
    pagination: { page, size, totalElements: pagination.totalElements, totalPages: pagination.totalPages, hasNext: pagination.hasNext },
    timestamp: nowIso(),
    requestId: uuid(),
  };
};

const nameOfProfile = (profileId: string) => {
  const user = findResidentByProfileId(profileId);
  return user ? `${user.firstName} ${user.lastName}` : 'Unknown resident';
};

const issueReceipt = (payment: Payment) => {
  const invoice = requireInvoice(payment.invoiceId);
  return receipts.insert({
    id: uuid(),
    paymentId: payment.id,
    unitId: invoice.unitId,
    billingPeriod: invoice.billingPeriod,
    amountPaid: payment.amount,
    paymentDate: payment.paymentDate,
    paymentMethod: payment.paymentMethod,
    referenceNumber: payment.referenceNumber,
    issuedAt: nowIso(),
  });
};

const ruleApplies = (rule: ChargeRule, month: number) =>
  rule.status === 'ACTIVE' && (rule.billingPeriod === 'MONTHLY' || [1, 4, 7, 10].includes(month));

const validateRule = (data: CreateChargeRuleRequest) => {
  if (!data.name?.trim()) fail(400, 'VALIDATION_ERROR', 'A rule name is required.', { name: 'Required.' });
  if (!(Number(data.amount) > 0)) fail(400, 'VALIDATION_ERROR', 'The amount must be greater than zero.', { amount: 'Must be positive.' });
};

// ---- billing-payment-service ------------------------------------------------------------

export const mockBillingApi = {
  createChargeRule: (data: CreateChargeRuleRequest): Promise<ChargeRule> =>
    respond(() => {
      validateRule(data);
      const name = data.name.trim();
      if (chargeRules.all().some((r) => r.name.toLowerCase() === name.toLowerCase())) {
        fail(409, 'CHARGE_RULE_ALREADY_EXISTS', `A charge rule named "${name}" already exists.`);
      }
      return chargeRules.insert({
        id: uuid(),
        name,
        chargeType: data.chargeType,
        amount: Number(data.amount),
        billingPeriod: data.billingPeriod,
        applicableToAllUnits: data.applicableToAllUnits ?? true,
        status: 'ACTIVE',
        createdAt: nowIso(),
        updatedAt: nowIso(),
        createdBy: mockActor().name,
      });
    }),

  getChargeRules: (params?: { page?: number; size?: number; status?: string }): Promise<ApiListResponse<ChargeRule>> =>
    respond(() =>
      listResponse(
        chargeRules
          .all()
          .filter((r) => !params?.status || r.status === params.status)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
        params?.page,
        params?.size ?? 100
      )
    ),

  getChargeRuleById: (chargeRuleId: string): Promise<ChargeRule> =>
    respond(() => chargeRules.require(String(chargeRuleId), 'CHARGE_RULE_NOT_FOUND', 'This charge rule could not be found.')),

  updateChargeRule: (chargeRuleId: string, data: CreateChargeRuleRequest): Promise<ChargeRule> =>
    respond(() => {
      validateRule(data);
      chargeRules.require(String(chargeRuleId), 'CHARGE_RULE_NOT_FOUND', 'This charge rule could not be found.');
      return chargeRules.update(String(chargeRuleId), { ...data, amount: Number(data.amount), updatedAt: nowIso() });
    }),

  updateChargeRuleStatus: (chargeRuleId: string, data: UpdateChargeRuleStatusRequest): Promise<ChargeRule> =>
    respond(() => {
      chargeRules.require(String(chargeRuleId), 'CHARGE_RULE_NOT_FOUND', 'This charge rule could not be found.');
      return chargeRules.update(String(chargeRuleId), { status: data.status, updatedAt: nowIso() });
    }),

  getChargeRulesByType: (chargeType: ChargeType): Promise<ChargeRule[]> =>
    respond(() => chargeRules.all().filter((r) => r.chargeType === chargeType)),

  generateInvoice: (data: GenerateInvoiceRequest): Promise<Invoice> =>
    respond(() => {
      const unitRef = resolveUnitReference(data.unitId);
      const unit = findUnitByReference(unitRef)!;
      const year = Number(data.billingYear);
      const month = Number(data.billingMonth);
      if (!(month >= 1 && month <= 12) || !(year >= 2000)) {
        fail(400, 'VALIDATION_ERROR', 'Choose a valid billing month and year.');
      }
      const period = { year, month };
      if (periodStart(period) > today()) fail(409, 'BUSINESS_RULE_VIOLATION', 'Invoices cannot be generated for a future period.');
      if (invoices.all().some((i) => i.unitId === unitRef && i.billingPeriod === periodKey(period) && i.status !== 'CANCELLED')) {
        fail(409, 'INVOICE_ALREADY_EXISTS', `${unitRef} already has an invoice for ${periodKey(period)}.`);
      }
      const residentId = activeTenantProfileId(unit.id);
      if (!residentId) {
        fail(409, 'RESPONSIBLE_PARTY_NOT_FOUND', `${unitRef} has no active lease, so there is no resident to bill.`);
      }
      const createdAt = nowIso();
      const lines: InvoiceLine[] = [
        ...chargeRules
          .all()
          .filter((r) => ruleApplies(r, month))
          .map((r) => ({ id: uuid(), chargeRuleId: r.id, chargeRuleName: r.name, chargeType: r.chargeType, amount: r.amount, createdAt })),
        ...utilityCharges
          .all()
          .filter((c) => c.unitId === unitRef && c.billingYear === year && c.billingMonth === month)
          .map((c) => ({
            id: uuid(),
            chargeRuleName: `${c.utilityType.charAt(0)}${c.utilityType.slice(1).toLowerCase()} usage (${c.usageValue})`,
            chargeType: `UTILITY_${c.utilityType}`,
            amount: c.calculatedAmount,
            createdAt,
          })),
      ];
      if (lines.length === 0) {
        fail(422, 'BUSINESS_RULE_VIOLATION', 'No active charge rules or utility charges apply to this period.');
      }
      const invoice = invoices.insert({
        id: uuid(),
        unitId: unitRef,
        residentId: residentId!,
        billingPeriod: periodKey(period),
        billingYear: year,
        billingMonth: month,
        totalAmount: lines.reduce((sum, l) => sum + l.amount, 0),
        status: 'ISSUED',
        issuedAt: createdAt,
        issuedBy: mockActor().name,
        lines,
        dueDate: dueDate(period),
      });
      return present(invoice);
    }),

  getInvoices: (params?: { page?: number; size?: number; status?: string; unitId?: string }): Promise<ApiListResponse<Invoice>> =>
    respond(() =>
      listResponse(
        invoices
          .all()
          .map(present)
          .filter((i) => (!params?.status || i.status === params.status) && matchesUnit(i.unitId, params?.unitId))
          .sort((a, b) => b.billingPeriod.localeCompare(a.billingPeriod) || a.unitId.localeCompare(b.unitId)),
        params?.page,
        params?.size ?? 100
      )
    ),

  getInvoiceById: (invoiceId: string): Promise<Invoice> => respond(() => present(requireInvoice(invoiceId))),

  getInvoicesByUnit: (unitId: string): Promise<Invoice[]> =>
    respond(() => invoices.all().filter((i) => matchesUnit(i.unitId, unitId)).map(present)),

  getInvoiceByUnitAndPeriod: (unitId: string, year: number, month: number): Promise<Invoice> =>
    respond(() => {
      const found = invoices.all().find((i) => matchesUnit(i.unitId, unitId) && i.billingYear === year && i.billingMonth === month);
      if (!found) fail(404, 'INVOICE_NOT_FOUND', 'No invoice exists for this unit and period.');
      return present(found!);
    }),

  updateInvoiceStatus: (invoiceId: string, data: UpdateInvoiceStatusRequest): Promise<Invoice> =>
    respond(() => {
      const invoice = requireInvoice(invoiceId);
      if (data.status === 'CANCELLED') {
        if (confirmedPaid(invoice.id) > 0) fail(409, 'BUSINESS_RULE_VIOLATION', 'An invoice with confirmed payments cannot be cancelled.');
        if (!data.reason?.trim()) fail(400, 'VALIDATION_ERROR', 'A reason is required to cancel an invoice.', { reason: 'Required.' });
      }
      return present(invoices.update(invoice.id, { status: data.status }));
    }),

  getInvoiceLines: (invoiceId: string): Promise<InvoiceLine[]> => respond(() => requireInvoice(invoiceId).lines),

  recordPayment: (data: RecordPaymentRequest): Promise<Payment> =>
    respond(() => {
      const invoice = requireInvoice(data.invoiceId);
      const status = currentStatus(invoice);
      if (status === 'CANCELLED' || status === 'PAID') {
        fail(409, 'BUSINESS_RULE_VIOLATION', `This invoice is ${status.toLowerCase()} and cannot take payments.`);
      }
      const amount = Number(data.amount);
      if (!(amount > 0)) fail(400, 'VALIDATION_ERROR', 'The amount must be greater than zero.', { amount: 'Must be positive.' });
      const outstanding = outstandingOf(invoice);
      if (amount > outstanding) {
        fail(409, 'BUSINESS_RULE_VIOLATION', `The amount exceeds the outstanding balance of LKR ${outstanding.toLocaleString()}.`, {
          amount: 'Exceeds the outstanding balance.',
        });
      }
      if (!data.referenceNumber?.trim()) fail(400, 'VALIDATION_ERROR', 'A reference number is required.', { referenceNumber: 'Required.' });
      // Payments taken by staff are confirmed on the spot and get a receipt straight away.
      const confirmed = isManager();
      const payment = payments.insert({
        id: uuid(),
        invoiceId: invoice.id,
        amount,
        paymentDate: data.paymentDate || today(),
        paymentMethod: data.paymentMethod,
        referenceNumber: data.referenceNumber.trim(),
        status: confirmed ? 'CONFIRMED' : 'PENDING',
        recordedAt: nowIso(),
        recordedBy: mockActor().name,
      });
      if (confirmed) issueReceipt(payment);
      return payment;
    }),

  getPayments: (params?: { page?: number; size?: number; status?: string }): Promise<ApiListResponse<Payment>> =>
    respond(() =>
      listResponse(
        payments
          .all()
          .filter((p) => !params?.status || p.status === params.status)
          .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)),
        params?.page,
        params?.size ?? 100
      )
    ),

  getPaymentById: (paymentId: number): Promise<Payment> =>
    respond(() => payments.require(String(paymentId), 'PAYMENT_NOT_FOUND', 'This payment could not be found.')),

  getPaymentsByInvoice: (invoiceId: number): Promise<Payment[]> =>
    respond(() => payments.all().filter((p) => p.invoiceId === String(invoiceId))),

  getPaymentsByUnit: (unitId: string): Promise<Payment[]> =>
    respond(() => {
      const ids = new Set(invoices.all().filter((i) => matchesUnit(i.unitId, unitId)).map((i) => i.id));
      return payments.all().filter((p) => ids.has(p.invoiceId));
    }),

  updatePaymentStatus: (paymentId: number, data: UpdatePaymentStatusRequest): Promise<Payment> =>
    respond(() => {
      const payment = payments.require(String(paymentId), 'PAYMENT_NOT_FOUND', 'This payment could not be found.');
      if (payment.status !== 'PENDING') fail(409, 'BUSINESS_RULE_VIOLATION', 'Only pending payments can be confirmed or rejected.');
      if (data.status === 'REJECTED' && !data.reason?.trim()) {
        fail(400, 'VALIDATION_ERROR', 'A reason is required to reject a payment.', { reason: 'Required.' });
      }
      const updated = payments.update(payment.id, { status: data.status });
      if (data.status === 'CONFIRMED') issueReceipt(updated);
      return updated;
    }),

  getReceiptById: (receiptId: number): Promise<Receipt> =>
    respond(() => receipts.require(String(receiptId), 'RECEIPT_NOT_FOUND', 'This receipt could not be found.')),

  getReceiptByPaymentId: (paymentId: number): Promise<Receipt> =>
    respond(() => {
      const found = receipts.all().find((r) => r.paymentId === String(paymentId));
      if (!found) fail(404, 'RECEIPT_NOT_FOUND', 'No receipt exists for this payment yet.');
      return found!;
    }),

  getReceiptsByUnit: (unitId: string): Promise<Receipt[]> =>
    respond(() =>
      receipts
        .all()
        .filter((r) => matchesUnit(r.unitId, unitId))
        .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt))
    ),

  createAdjustment: (data: CreateAdjustmentRequest): Promise<Adjustment> =>
    respond(() => {
      const invoice = requireInvoice(data.invoiceId);
      if (invoice.status === 'CANCELLED') fail(409, 'BUSINESS_RULE_VIOLATION', 'A cancelled invoice cannot be adjusted.');
      if (!(Number(data.amount) > 0)) fail(400, 'VALIDATION_ERROR', 'The amount must be greater than zero.');
      if ((data.reason ?? '').trim().length < 10) {
        fail(400, 'VALIDATION_ERROR', 'The reason must be at least 10 characters.', { reason: 'At least 10 characters.' });
      }
      return adjustments.insert({
        id: uuid(),
        invoiceId: invoice.id,
        adjustmentType: data.adjustmentType,
        amount: Number(data.amount),
        reason: data.reason.trim(),
        createdAt: nowIso(),
        createdBy: mockActor().name,
      });
    }),

  getAdjustmentsByInvoice: (invoiceId: string): Promise<Adjustment[]> =>
    respond(() => adjustments.all().filter((a) => a.invoiceId === invoiceId)),

  getUnitBalance: (unitId: string): Promise<UnitBalance> =>
    respond(() => {
      const unitRef = resolveUnitReference(unitId);
      const mine = invoices.all().filter((i) => i.unitId === unitRef);
      const paid = payments.all().filter((p) => p.status === 'CONFIRMED' && mine.some((i) => i.id === p.invoiceId));
      return {
        unitId: unitRef,
        outstandingBalance: mine.reduce((sum, i) => sum + outstandingOf(i), 0),
        overdueCount: mine.filter((i) => currentStatus(i) === 'OVERDUE').length,
        lastInvoiceDate: mine.map((i) => i.issuedAt).sort().pop() ?? null,
        lastPaymentDate: paid.map((p) => p.paymentDate).sort().pop() ?? null,
      };
    }),

  getFinanceDashboardSummary: (): Promise<FinanceDashboardSummary> =>
    respond(() => {
      const month = today().slice(0, 7);
      const all = invoices.all();
      const invoicedThisMonth = all
        .filter((i) => i.status !== 'CANCELLED' && i.issuedAt.slice(0, 7) === month)
        .reduce((sum, i) => sum + i.totalAmount, 0);
      const collectedThisMonth = payments
        .all()
        .filter((p) => p.status === 'CONFIRMED' && p.paymentDate.slice(0, 7) === month)
        .reduce((sum, p) => sum + p.amount, 0);
      return {
        totalInvoicedThisMonth: invoicedThisMonth,
        totalCollectedThisMonth: collectedThisMonth,
        totalOutstanding: all.reduce((sum, i) => sum + outstandingOf(i), 0),
        overdueAccountsCount: new Set(all.filter((i) => currentStatus(i) === 'OVERDUE').map((i) => i.unitId)).size,
        collectionRatePercent: invoicedThisMonth > 0 ? Math.round((collectedThisMonth / invoicedThisMonth) * 1000) / 10 : 0,
      };
    }),

  getArrearsReport: (): Promise<ArrearsItem[]> =>
    respond(() => {
      const byUnit = new Map<string, StoredInvoice[]>();
      invoices.all().forEach((i) => byUnit.set(i.unitId, [...(byUnit.get(i.unitId) ?? []), i]));
      return [...byUnit.entries()]
        .map(([unitId, list]) => {
          const overdue = list.filter((i) => currentStatus(i) === 'OVERDUE');
          const paid = payments.all().filter((p) => p.status === 'CONFIRMED' && list.some((i) => i.id === p.invoiceId));
          return {
            unitId,
            residentName: nameOfProfile(list[0].residentId),
            outstandingBalance: overdue.reduce((sum, i) => sum + outstandingOf(i), 0),
            overdueMonths: overdue.length,
            lastPaymentDate: paid.map((p) => p.paymentDate).sort().pop() ?? null,
          };
        })
        .filter((row) => row.overdueMonths > 0)
        .sort((a, b) => b.outstandingBalance - a.outstandingBalance);
    }),

  getCollectionSummary: (): Promise<CollectionSummaryItem[]> =>
    respond(() => {
      const periods = [...new Set(invoices.all().map((i) => i.billingPeriod))].sort();
      return periods.map((period) => {
        const list = invoices.all().filter((i) => i.billingPeriod === period && i.status !== 'CANCELLED');
        const totalInvoiced = list.reduce((sum, i) => sum + i.totalAmount, 0);
        const totalCollected = list.reduce((sum, i) => sum + confirmedPaid(i.id), 0);
        return { period, totalInvoiced, totalCollected, ratePercent: totalInvoiced ? Math.round((totalCollected / totalInvoiced) * 1000) / 10 : 0 };
      });
    }),
};

// ---- utility-charge-service --------------------------------------------------------------

const activeRate = (type: UtilityType) => utilityRates.all().find((r) => r.utilityType === type && r.status === 'ACTIVE');

export const mockUtilityApi = {
  createRate: (data: CreateUtilityRateRequest): Promise<UtilityRate> =>
    respond(() => {
      if (!(Number(data.ratePerUnit) > 0)) fail(400, 'VALIDATION_ERROR', 'The rate must be greater than zero.');
      if (!data.unitOfMeasure?.trim()) fail(400, 'VALIDATION_ERROR', 'A unit of measure is required.');
      // A new rate replaces the current one for that utility.
      utilityRates
        .all()
        .filter((r) => r.utilityType === data.utilityType && r.status === 'ACTIVE')
        .forEach((r) => utilityRates.update(r.id, { status: 'INACTIVE' }));
      return utilityRates.insert({
        id: numericId(),
        utilityType: data.utilityType,
        ratePerUnit: Number(data.ratePerUnit),
        unitOfMeasure: data.unitOfMeasure.trim(),
        status: 'ACTIVE',
        effectiveDate: today(),
      });
    }),

  getRates: (): Promise<UtilityRate[]> =>
    respond(() => utilityRates.all().sort((a, b) => a.utilityType.localeCompare(b.utilityType) || (a.status === 'ACTIVE' ? -1 : 1))),

  updateRateStatus: (utilityRateId: number, status: 'ACTIVE' | 'INACTIVE'): Promise<UtilityRate> =>
    respond(() => {
      const rate = utilityRates.require(utilityRateId, 'RATE_NOT_FOUND', 'This rate could not be found.');
      if (status === 'ACTIVE') {
        // Only one active rate per utility.
        utilityRates
          .all()
          .filter((r) => r.utilityType === rate.utilityType && r.id !== rate.id && r.status === 'ACTIVE')
          .forEach((r) => utilityRates.update(r.id, { status: 'INACTIVE' }));
      }
      return utilityRates.update(rate.id, { status });
    }),

  createCharge: (data: CreateUtilityChargeRequest): Promise<UtilityCharge> =>
    respond(() => {
      const unitRef = resolveUnitReference(data.unitId);
      const usage = Number(data.usageValue);
      if (!(usage >= 0)) fail(400, 'VALIDATION_ERROR', 'Usage must be zero or more.', { usageValue: 'Must be zero or more.' });
      const rate = activeRate(data.utilityType);
      if (!rate) fail(422, 'RATE_NOT_FOUND', `There is no active ${data.utilityType.toLowerCase()} rate. Add or activate one first.`);
      const year = Number(data.billingYear);
      const month = Number(data.billingMonth);
      if (
        utilityCharges
          .all()
          .some((c) => c.unitId === unitRef && c.utilityType === data.utilityType && c.billingYear === year && c.billingMonth === month)
      ) {
        fail(409, 'UTILITY_CHARGE_ALREADY_EXISTS', `${unitRef} already has a ${data.utilityType.toLowerCase()} reading for ${periodKey({ year, month })}.`);
      }
      return utilityCharges.insert({
        id: numericId(),
        unitId: unitRef,
        utilityType: data.utilityType,
        billingYear: year,
        billingMonth: month,
        usageValue: usage,
        ratePerUnit: rate!.ratePerUnit,
        calculatedAmount: Math.round(usage * rate!.ratePerUnit * 100) / 100,
        recordedAt: nowIso(),
        recordedBy: mockActor().name,
      });
    }),

  getCharges: (params?: { page?: number; size?: number; unitId?: string }): Promise<ApiListResponse<UtilityCharge>> =>
    respond(() =>
      listResponse(
        utilityCharges
          .all()
          .filter((c) => matchesUnit(c.unitId, params?.unitId))
          .sort((a, b) => b.billingYear - a.billingYear || b.billingMonth - a.billingMonth || a.unitId.localeCompare(b.unitId)),
        params?.page,
        params?.size ?? 100
      )
    ),

  getChargesByUnit: (unitId: string): Promise<UtilityCharge[]> =>
    respond(() => utilityCharges.all().filter((c) => matchesUnit(c.unitId, unitId))),

  deleteCharge: (utilityChargeId: number): Promise<void> =>
    respond(() => {
      utilityCharges.require(utilityChargeId, 'UTILITY_CHARGE_NOT_FOUND', 'This reading could not be found.');
      utilityCharges.remove(utilityChargeId);
    }),
};

