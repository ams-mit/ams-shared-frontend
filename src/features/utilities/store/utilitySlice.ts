// src/features/utilities/store/utilitySlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { utilityApi } from '../api/utilityApi';
import type {
  UtilityRate,
  CreateUtilityRateRequest,
  UtilityCharge,
  CreateUtilityChargeRequest,
} from '../types/utility.types';

interface UtilityState {
  rates: UtilityRate[];
  ratesLoading: boolean;
  ratesError: string | null;

  charges: UtilityCharge[];
  chargesLoading: boolean;
  chargesError: string | null;
}

const initialState: UtilityState = {
  rates: [],
  ratesLoading: false,
  ratesError: null,

  charges: [],
  chargesLoading: false,
  chargesError: null,
};

export const fetchUtilityRates = createAsyncThunk('utilities/fetchRates', async (_, { rejectWithValue }) => {
  try {
    return await utilityApi.getRates();
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch rates');
  }
});

export const createUtilityRate = createAsyncThunk(
  'utilities/createRate',
  async (data: CreateUtilityRateRequest, { rejectWithValue }) => {
    try {
      return await utilityApi.createRate(data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create rate');
    }
  }
);

export const toggleUtilityRateStatus = createAsyncThunk(
  'utilities/toggleRateStatus',
  async ({ id, status }: { id: number; status: 'ACTIVE' | 'INACTIVE' }, { rejectWithValue }) => {
    try {
      return await utilityApi.updateRateStatus(id, status);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update rate status');
    }
  }
);

export const fetchUtilityCharges = createAsyncThunk(
  'utilities/fetchCharges',
  async (params: { page?: number; size?: number; unitId?: string } | undefined, { rejectWithValue }) => {
    try {
      const res = await utilityApi.getCharges(params);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch utility charges');
    }
  }
);

export const createUtilityCharge = createAsyncThunk(
  'utilities/createCharge',
  async (data: CreateUtilityChargeRequest, { rejectWithValue }) => {
    try {
      return await utilityApi.createCharge(data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to record utility charge');
    }
  }
);

export const utilitySlice = createSlice({
  name: 'utilities',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUtilityRates.pending, (state) => {
        state.ratesLoading = true;
        state.ratesError = null;
      })
      .addCase(fetchUtilityRates.fulfilled, (state, action) => {
        state.ratesLoading = false;
        state.rates = action.payload;
      })
      .addCase(fetchUtilityRates.rejected, (state, action) => {
        state.ratesLoading = false;
        state.ratesError = action.payload as string;
      })
      .addCase(createUtilityRate.fulfilled, (state, action) => {
        state.rates.push(action.payload);
      })
      .addCase(toggleUtilityRateStatus.fulfilled, (state, action) => {
        const idx = state.rates.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) {
          state.rates[idx] = action.payload;
        }
      });

    builder
      .addCase(fetchUtilityCharges.pending, (state) => {
        state.chargesLoading = true;
        state.chargesError = null;
      })
      .addCase(fetchUtilityCharges.fulfilled, (state, action) => {
        state.chargesLoading = false;
        state.charges = action.payload;
      })
      .addCase(fetchUtilityCharges.rejected, (state, action) => {
        state.chargesLoading = false;
        state.chargesError = action.payload as string;
      })
      .addCase(createUtilityCharge.fulfilled, (state, action) => {
        state.charges.unshift(action.payload);
      });
  },
});

export default utilitySlice.reducer;