import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { toApiError, type ApiErrorInfo } from '@/services/api/apiError';
import { leaseApi } from '../api/leaseApi';
import type {
  CreateLeaseRequest,
  Lease,
  LeaseListFilters,
  LeaseStatus,
  PaginationMeta,
  UpdateLeaseStatusRequest,
} from '../types/lease.types';

interface LeaseState {
  leases: Lease[];
  pagination: PaginationMeta | null;
  statusFilter: LeaseStatus | '';
  loading: boolean;
  error: ApiErrorInfo | null;
}

const initialState: LeaseState = {
  leases: [],
  pagination: null,
  statusFilter: '',
  loading: false,
  error: null,
};

export const fetchLeases = createAsyncThunk<
  { leases: Lease[]; pagination: PaginationMeta | null },
  LeaseListFilters | undefined,
  { rejectValue: ApiErrorInfo }
>('leases/fetchLeases', async (filters, { rejectWithValue }) => {
  try {
    return await leaseApi.list(filters);
  } catch (err) {
    return rejectWithValue(toApiError(err, 'Failed to load leases.'));
  }
});

export const createLease = createAsyncThunk<Lease, CreateLeaseRequest, { rejectValue: ApiErrorInfo }>(
  'leases/createLease',
  async (payload, { rejectWithValue }) => {
    try {
      return await leaseApi.create(payload);
    } catch (err) {
      return rejectWithValue(toApiError(err, 'Failed to create lease.'));
    }
  }
);

export const updateLeaseStatus = createAsyncThunk<
  Lease,
  { leaseId: string } & UpdateLeaseStatusRequest,
  { rejectValue: ApiErrorInfo }
>('leases/updateLeaseStatus', async ({ leaseId, ...payload }, { rejectWithValue }) => {
  try {
    return await leaseApi.updateStatus(leaseId, payload);
  } catch (err) {
    return rejectWithValue(toApiError(err, 'Failed to update lease status.'));
  }
});

const leaseSlice = createSlice({
  name: 'leases',
  initialState,
  reducers: {
    setStatusFilter: (state, action: PayloadAction<LeaseStatus | ''>) => {
      state.statusFilter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeases.fulfilled, (state, action) => {
        state.loading = false;
        state.leases = action.payload.leases;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchLeases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? { message: action.error.message ?? 'Failed to load leases.' };
      })
      .addCase(createLease.fulfilled, (state, action) => {
        if (!state.statusFilter || state.statusFilter === action.payload.status) {
          state.leases.unshift(action.payload);
        }
        if (state.pagination) state.pagination.totalElements += 1;
      })
      .addCase(updateLeaseStatus.fulfilled, (state, action) => {
        state.leases = state.leases.map((lease) => (lease.id === action.payload.id ? action.payload : lease));
      });
  },
});

export const { setStatusFilter } = leaseSlice.actions;
export default leaseSlice.reducer;
