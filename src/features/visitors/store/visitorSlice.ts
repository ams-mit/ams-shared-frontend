import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Visitor, VisitorRequest, VisitorFilters } from '../types/visitor.types';
import { visitorApi } from '../api/visitorApi';

interface VisitorState {
  visitors: Visitor[];
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: VisitorState = {
  visitors: [],
  loading: false,
  actionLoading: false,
  error: null,
  successMessage: null,
};

export const fetchVisitors = createAsyncThunk<Visitor[], VisitorFilters | void>(
  'visitors/fetchVisitors',
  async (filters, { rejectWithValue }) => {
    try {
      return await visitorApi.getAllVisitors(filters || undefined);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch visitors');
    }
  }
);

export const registerVisitor = createAsyncThunk(
  'visitors/registerVisitor',
  async (request: VisitorRequest, { rejectWithValue }) => {
    try {
      return await visitorApi.registerVisitor(request);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to register visitor');
    }
  }
);

export const checkInVisitor = createAsyncThunk(
  'visitors/checkInVisitor',
  async (visitorId: number, { rejectWithValue }) => {
    try {
      return await visitorApi.checkInVisitor(visitorId);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to check-in visitor');
    }
  }
);

export const checkOutVisitor = createAsyncThunk(
  'visitors/checkOutVisitor',
  async (visitorId: number, { rejectWithValue }) => {
    try {
      return await visitorApi.checkOutVisitor(visitorId);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to check-out visitor');
    }
  }
);

export const cancelVisitorPass = createAsyncThunk(
  'visitors/cancelVisitorPass',
  async (visitorId: number, { rejectWithValue }) => {
    try {
      return await visitorApi.cancelVisitorPass(visitorId);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to cancel visitor pass');
    }
  }
);

export const visitorSlice = createSlice({
  name: 'visitors',
  initialState,
  reducers: {
    clearVisitorFeedback: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // fetchVisitors
    builder.addCase(fetchVisitors.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchVisitors.fulfilled, (state, action: PayloadAction<Visitor[]>) => {
      state.loading = false;
      state.visitors = [...action.payload];
    });
    builder.addCase(fetchVisitors.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // registerVisitor
    builder.addCase(registerVisitor.pending, (state) => {
      state.actionLoading = true;
      state.error = null;
    });
    builder.addCase(registerVisitor.fulfilled, (state, action: PayloadAction<Visitor>) => {
      state.actionLoading = false;
      state.visitors = [action.payload, ...state.visitors.filter((v) => v.id !== action.payload.id)];
      state.successMessage = `Visitor ${action.payload.visitorName} pre-registered successfully. Gate pass issued!`;
    });
    builder.addCase(registerVisitor.rejected, (state, action) => {
      state.actionLoading = false;
      state.error = action.payload as string;
    });

    // checkInVisitor
    builder.addCase(checkInVisitor.pending, (state) => {
      state.actionLoading = true;
      state.error = null;
    });
    builder.addCase(checkInVisitor.fulfilled, (state, action: PayloadAction<Visitor>) => {
      state.actionLoading = false;
      state.visitors = state.visitors.map((v) => (v.id === action.payload.id ? action.payload : v));
      state.successMessage = `${action.payload.visitorName} successfully checked in at the security gate!`;
    });
    builder.addCase(checkInVisitor.rejected, (state, action) => {
      state.actionLoading = false;
      state.error = action.payload as string;
    });

    // checkOutVisitor
    builder.addCase(checkOutVisitor.pending, (state) => {
      state.actionLoading = true;
      state.error = null;
    });
    builder.addCase(checkOutVisitor.fulfilled, (state, action: PayloadAction<Visitor>) => {
      state.actionLoading = false;
      state.visitors = state.visitors.map((v) => (v.id === action.payload.id ? action.payload : v));
      state.successMessage = `${action.payload.visitorName} successfully checked out!`;
    });
    builder.addCase(checkOutVisitor.rejected, (state, action) => {
      state.actionLoading = false;
      state.error = action.payload as string;
    });

    // cancelVisitorPass
    builder.addCase(cancelVisitorPass.pending, (state) => {
      state.actionLoading = true;
      state.error = null;
    });
    builder.addCase(cancelVisitorPass.fulfilled, (state, action: PayloadAction<Visitor>) => {
      state.actionLoading = false;
      state.visitors = state.visitors.map((v) => (v.id === action.payload.id ? action.payload : v));
      state.successMessage = `Visitor pass for ${action.payload.visitorName} cancelled.`;
    });
    builder.addCase(cancelVisitorPass.rejected, (state, action) => {
      state.actionLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearVisitorFeedback } = visitorSlice.actions;
export default visitorSlice.reducer;
