import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Facility, FacilityRequest, Booking, BookingRequest, BookingStatus, BookingFilters } from '../types/facility.types';
import { facilityApi } from '../api/facilityApi';

interface FacilityState {
  facilities: Facility[];
  bookings: Booking[];
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: FacilityState = {
  facilities: [],
  bookings: [],
  loading: false,
  actionLoading: false,
  error: null,
  successMessage: null,
};

export const fetchFacilities = createAsyncThunk(
  'facilities/fetchFacilities',
  async (_, { rejectWithValue }) => {
    try {
      return await facilityApi.getAllFacilities();
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch facilities');
    }
  }
);

export const createFacility = createAsyncThunk(
  'facilities/createFacility',
  async (data: FacilityRequest, { rejectWithValue }) => {
    try {
      return await facilityApi.createFacility(data);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to create facility');
    }
  }
);

export const updateFacility = createAsyncThunk(
  'facilities/updateFacility',
  async ({ id, data }: { id: number; data: Partial<FacilityRequest> }, { rejectWithValue }) => {
    try {
      return await facilityApi.updateFacility(id, data);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to update facility');
    }
  }
);

export const toggleFacilityStatus = createAsyncThunk(
  'facilities/toggleFacilityStatus',
  async ({ id, status }: { id: number; status?: 'ACTIVE' | 'INACTIVE' }, { rejectWithValue }) => {
    try {
      return await facilityApi.toggleFacilityStatus(id, status);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to toggle facility status');
    }
  }
);

export const deleteFacility = createAsyncThunk(
  'facilities/deleteFacility',
  async (id: number, { rejectWithValue }) => {
    try {
      await facilityApi.deleteFacility(id);
      return id;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to delete facility');
    }
  }
);

export const fetchBookings = createAsyncThunk<Booking[], BookingFilters | void>(
  'facilities/fetchBookings',
  async (filters, { rejectWithValue }) => {
    try {
      return await facilityApi.getAllBookings(filters || undefined);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch bookings');
    }
  }
);

export const createBooking = createAsyncThunk(
  'facilities/createBooking',
  async (request: BookingRequest, { rejectWithValue }) => {
    try {
      return await facilityApi.createBooking(request);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to create booking');
    }
  }
);

export const updateBookingStatus = createAsyncThunk(
  'facilities/updateBookingStatus',
  async (
    { bookingId, status, rejectionReason }: { bookingId: number; status: BookingStatus; rejectionReason?: string },
    { rejectWithValue }
  ) => {
    try {
      return await facilityApi.updateBookingStatus(bookingId, status, rejectionReason);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to update booking status');
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'facilities/cancelBooking',
  async (bookingId: number, { rejectWithValue }) => {
    try {
      return await facilityApi.cancelBooking(bookingId);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to cancel reservation');
    }
  }
);

export const facilitySlice = createSlice({
  name: 'facilities',
  initialState,
  reducers: {
    clearFeedback: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // fetchFacilities
    builder.addCase(fetchFacilities.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchFacilities.fulfilled, (state, action: PayloadAction<Facility[]>) => {
      state.loading = false;
      state.facilities = [...action.payload];
    });
    builder.addCase(fetchFacilities.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // createFacility
    builder.addCase(createFacility.pending, (state) => {
      state.actionLoading = true;
      state.error = null;
    });
    builder.addCase(createFacility.fulfilled, (state, action: PayloadAction<Facility>) => {
      state.actionLoading = false;
      state.facilities = [action.payload, ...state.facilities.filter((f) => f.id !== action.payload.id)];
      state.successMessage = `Facility "${action.payload.name}" created successfully.`;
    });
    builder.addCase(createFacility.rejected, (state, action) => {
      state.actionLoading = false;
      state.error = action.payload as string;
    });

    // updateFacility
    builder.addCase(updateFacility.pending, (state) => {
      state.actionLoading = true;
      state.error = null;
    });
    builder.addCase(updateFacility.fulfilled, (state, action: PayloadAction<Facility>) => {
      state.actionLoading = false;
      state.facilities = state.facilities.map((f) => (f.id === action.payload.id ? action.payload : f));
      state.successMessage = `Facility "${action.payload.name}" updated successfully.`;
    });
    builder.addCase(updateFacility.rejected, (state, action) => {
      state.actionLoading = false;
      state.error = action.payload as string;
    });

    // toggleFacilityStatus
    builder.addCase(toggleFacilityStatus.fulfilled, (state, action: PayloadAction<Facility>) => {
      state.facilities = state.facilities.map((f) => (f.id === action.payload.id ? action.payload : f));
      state.successMessage = `Facility "${action.payload.name}" status changed to ${action.payload.status}.`;
    });

    // deleteFacility
    builder.addCase(deleteFacility.fulfilled, (state, action: PayloadAction<number>) => {
      state.facilities = state.facilities.filter((f) => f.id !== action.payload);
      state.successMessage = 'Facility removed successfully.';
    });

    // fetchBookings
    builder.addCase(fetchBookings.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchBookings.fulfilled, (state, action: PayloadAction<Booking[]>) => {
      state.loading = false;
      state.bookings = [...action.payload];
    });
    builder.addCase(fetchBookings.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // createBooking
    builder.addCase(createBooking.pending, (state) => {
      state.actionLoading = true;
      state.error = null;
    });
    builder.addCase(createBooking.fulfilled, (state, action: PayloadAction<Booking>) => {
      state.actionLoading = false;
      state.bookings = [action.payload, ...state.bookings.filter((b) => b.id !== action.payload.id)];
      state.successMessage = `Reservation for ${action.payload.facilityName} created successfully (Status: PENDING)`;
    });
    builder.addCase(createBooking.rejected, (state, action) => {
      state.actionLoading = false;
      state.error = action.payload as string;
    });

    // updateBookingStatus
    builder.addCase(updateBookingStatus.pending, (state) => {
      state.actionLoading = true;
      state.error = null;
    });
    builder.addCase(updateBookingStatus.fulfilled, (state, action: PayloadAction<Booking>) => {
      state.actionLoading = false;
      state.bookings = state.bookings.map((b) => (b.id === action.payload.id ? action.payload : b));
      state.successMessage = `Booking #${action.payload.id} status updated to ${action.payload.status}`;
    });
    builder.addCase(updateBookingStatus.rejected, (state, action) => {
      state.actionLoading = false;
      state.error = action.payload as string;
    });

    // cancelBooking
    builder.addCase(cancelBooking.pending, (state) => {
      state.actionLoading = true;
      state.error = null;
    });
    builder.addCase(cancelBooking.fulfilled, (state, action: PayloadAction<Booking>) => {
      state.actionLoading = false;
      state.bookings = state.bookings.map((b) => (b.id === action.payload.id ? action.payload : b));
      state.successMessage = `Reservation #${action.payload.id} has been cancelled.`;
    });
    builder.addCase(cancelBooking.rejected, (state, action) => {
      state.actionLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearFeedback } = facilitySlice.actions;
export default facilitySlice.reducer;
