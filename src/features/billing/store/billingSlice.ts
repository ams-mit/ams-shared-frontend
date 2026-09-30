// src/features/billing/store/billingSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { billingApi } from '../api/billingApi';
import type {
  ChargeRule,
  CreateChargeRuleRequest,
  Invoice,
  GenerateInvoiceRequest,
  Payment,
  RecordPaymentRequest,
  Receipt,
  FinanceDashboardSummary,
  ArrearsItem,
  PaginationMeta,
} from '../types/billing.types';

interface BillingState {
  // Charge Rules
  chargeRules: ChargeRule[];
  chargeRulesLoading: boolean;
  chargeRulesError: string | null;

  // Invoices
  invoices: Invoice[];
  invoicesPagination: PaginationMeta | null;
  selectedInvoice: Invoice | null;
  invoicesLoading: boolean;
  invoicesError: string | null;

  // Payments
  payments: Payment[];
  paymentsLoading: boolean;
  paymentsError: string | null;

  // Receipts
  receipts: Receipt[];
  selectedReceipt: Receipt | null;
  receiptsLoading: boolean;
  receiptsError: string | null;

  // Dashboard & Reports
  dashboardSummary: FinanceDashboardSummary | null;
  arrears: ArrearsItem[];
  dashboardLoading: boolean;
  dashboardError: string | null;
}

const initialState: BillingState = {
  chargeRules: [],
  chargeRulesLoading: false,
  chargeRulesError: null,

  invoices: [],
  invoicesPagination: null,
  selectedInvoice: null,
  invoicesLoading: false,
  invoicesError: null,

  payments: [],
  paymentsLoading: false,
  paymentsError: null,

  receipts: [],
  selectedReceipt: null,
  receiptsLoading: false,
  receiptsError: null,

  dashboardSummary: null,
  arrears: [],
  dashboardLoading: false,
  dashboardError: null,
};

// Async Thunks
export const fetchChargeRules = createAsyncThunk(
  'billing/fetchChargeRules',
  async (params: { page?: number; size?: number; status?: string } | undefined, { rejectWithValue }) => {
    try {
      const response = await billingApi.getChargeRules(params);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch charge rules');
    }
  }
);

export const createChargeRule = createAsyncThunk(
  'billing/createChargeRule',
  async (data: CreateChargeRuleRequest, { rejectWithValue }) => {
    try {
      return await billingApi.createChargeRule(data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create charge rule');
    }
  }
);

export const toggleChargeRuleStatus = createAsyncThunk(
  'billing/toggleChargeRuleStatus',
  async ({ id, status }: { id: number; status: 'ACTIVE' | 'INACTIVE' }, { rejectWithValue }) => {
    try {
      return await billingApi.updateChargeRuleStatus(id, { status });
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update rule status');
    }
  }
);

export const fetchInvoices = createAsyncThunk(
  'billing/fetchInvoices',
  async (params: { page?: number; size?: number; status?: string; unitId?: string } | undefined, { rejectWithValue }) => {
    try {
      return await billingApi.getInvoices(params);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch invoices');
    }
  }
);

export const generateInvoice = createAsyncThunk(
  'billing/generateInvoice',
  async (data: GenerateInvoiceRequest, { rejectWithValue }) => {
    try {
      return await billingApi.generateInvoice(data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to generate invoice');
    }
  }
);

export const fetchInvoiceLines = createAsyncThunk(
  'billing/fetchInvoiceLines',
  async (invoiceId: string, { rejectWithValue }) => {
    try {
      const lines = await billingApi.getInvoiceLines(invoiceId);
      return { invoiceId, lines };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch invoice lines');
    }
  }
);

export const fetchPayments = createAsyncThunk(
  'billing/fetchPayments',
  async (params: { page?: number; size?: number; status?: string } | undefined, { rejectWithValue }) => {
    try {
      const response = await billingApi.getPayments(params);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch payments');
    }
  }
);

export const recordPayment = createAsyncThunk(
  'billing/recordPayment',
  async (data: RecordPaymentRequest, { rejectWithValue }) => {
    try {
      return await billingApi.recordPayment(data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to record payment');
    }
  }
);

export const fetchReceiptsByUnit = createAsyncThunk(
  'billing/fetchReceiptsByUnit',
  async (unitId: string, { rejectWithValue }) => {
    try {
      return await billingApi.getReceiptsByUnit(unitId);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch receipts');
    }
  }
);

export const fetchFinanceDashboard = createAsyncThunk(
  'billing/fetchFinanceDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const [summary, arrears] = await Promise.all([
        billingApi.getFinanceDashboardSummary(),
        billingApi.getArrearsReport(),
      ]);
      return { summary, arrears };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load dashboard metrics');
    }
  }
);

export const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {
    setSelectedInvoice: (state, action: PayloadAction<Invoice | null>) => {
      state.selectedInvoice = action.payload;
    },
    setSelectedReceipt: (state, action: PayloadAction<Receipt | null>) => {
      state.selectedReceipt = action.payload;
    },
    clearBillingErrors: (state) => {
      state.chargeRulesError = null;
      state.invoicesError = null;
      state.paymentsError = null;
      state.receiptsError = null;
      state.dashboardError = null;
    },
  },
  extraReducers: (builder) => {
    // Charge rules
    builder
      .addCase(fetchChargeRules.pending, (state) => {
        state.chargeRulesLoading = true;
        state.chargeRulesError = null;
      })
      .addCase(fetchChargeRules.fulfilled, (state, action) => {
        state.chargeRulesLoading = false;
        
        const payloadData = action.payload as any;
        const responseBody = payloadData?.data || payloadData;
        
        if (Array.isArray(responseBody)) {
          state.chargeRules = responseBody;
        } else if (responseBody && Array.isArray(responseBody.content)) {
          state.chargeRules = responseBody.content;
        } else {
          state.chargeRules = [];
        }
      })
      .addCase(fetchChargeRules.rejected, (state, action) => {
        state.chargeRulesLoading = false;
        state.chargeRulesError = action.payload as string;
      })
      .addCase(createChargeRule.fulfilled, (state, action) => {
        if (!Array.isArray(state.chargeRules)) {
          state.chargeRules = [];
        }
        
        const payloadObj = action.payload as any;
        const newRule = payloadObj?.data || payloadObj;
        
        if (newRule) {
          state.chargeRules.unshift(newRule);
        }
      })
      .addCase(toggleChargeRuleStatus.fulfilled, (state, action) => {
        const index = state.chargeRules.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.chargeRules[index] = action.payload;
        }
      });

    // Invoices
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.invoicesLoading = true;
        state.invoicesError = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.invoicesLoading = false;
        const payloadData = action.payload as any;
        const responseBody = payloadData?.data || payloadData;
        
        if (Array.isArray(responseBody)) {
          state.invoices = responseBody;
        } else if (responseBody && Array.isArray(responseBody.content)) {
          state.invoices = responseBody.content;
          state.invoicesPagination = {
            page: responseBody.number ?? 0,
            size: responseBody.size ?? 20,
            totalElements: responseBody.totalElements ?? responseBody.content.length,
            totalPages: responseBody.totalPages ?? 1,
            hasNext: !responseBody.last,
          };
        } else {
          state.invoices = [];
        }
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.invoicesLoading = false;
        state.invoicesError = action.payload as string;
      })
      .addCase(generateInvoice.fulfilled, (state, action) => {
        if (!Array.isArray(state.invoices)) {
          state.invoices = [];
        }
        const payloadObj = action.payload as any;
        const newInvoice = payloadObj?.data || payloadObj;
        if (newInvoice) {
          state.invoices.unshift(newInvoice);
        }
      })
      .addCase(fetchInvoiceLines.fulfilled, (state, action) => {
        if (state.selectedInvoice && state.selectedInvoice.id === action.payload.invoiceId) {
          state.selectedInvoice.lines = action.payload.lines;
        }
      });

    // Payments
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.paymentsLoading = true;
        state.paymentsError = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.paymentsLoading = false;
        const payloadData = action.payload as any;
        const responseBody = payloadData?.data || payloadData;
        
        if (Array.isArray(responseBody)) {
          state.payments = responseBody;
        } else if (responseBody && Array.isArray(responseBody.content)) {
          state.payments = responseBody.content;
        } else {
          state.payments = [];
        }
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.paymentsLoading = false;
        state.paymentsError = action.payload as string;
      })
      .addCase(recordPayment.fulfilled, (state, action) => {
        if (!Array.isArray(state.payments)) {
          state.payments = [];
        }
        
        const payloadObj = action.payload as any;
        const newPayment = payloadObj?.data || payloadObj;
        
        if (newPayment) {
          state.payments.unshift(newPayment);
        }
      });

    // Receipts
    builder
      .addCase(fetchReceiptsByUnit.pending, (state) => {
        state.receiptsLoading = true;
        state.receiptsError = null;
      })
      .addCase(fetchReceiptsByUnit.fulfilled, (state, action) => {
        state.receiptsLoading = false;
        const payloadData = action.payload as any;
        const responseBody = payloadData?.data || payloadData;
        
        if (Array.isArray(responseBody)) {
          state.receipts = responseBody;
        } else if (responseBody && Array.isArray(responseBody.content)) {
          state.receipts = responseBody.content;
        } else {
          state.receipts = [];
        }
      })
      .addCase(fetchReceiptsByUnit.rejected, (state, action) => {
        state.receiptsLoading = false;
        state.receiptsError = action.payload as string;
      });

    // Dashboard
    builder
      .addCase(fetchFinanceDashboard.pending, (state) => {
        state.dashboardLoading = true;
        state.dashboardError = null;
      })
      .addCase(fetchFinanceDashboard.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardSummary = action.payload.summary;
        state.arrears = action.payload.arrears;
      })
      .addCase(fetchFinanceDashboard.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardError = action.payload as string;
      });
  },
});

export const { setSelectedInvoice, setSelectedReceipt, clearBillingErrors } = billingSlice.actions;
export default billingSlice.reducer;