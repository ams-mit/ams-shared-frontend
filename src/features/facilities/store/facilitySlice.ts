import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Facility, Booking, BookingRequest, BookingStatus } from '../types/facility.types';
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

export const fetchBookings = createAsyncThunk(
  'facilities/fetchBookings',
  async (_, { rejectWithValue }) => {
    try {
      return await facilityApi.getAllBookings();
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
    { bookingId, status }: { bookingId: number; status: BookingStatus },
    { rejectWithValue }
  ) => {
    try {
      return await facilityApi.updateBookingStatus(bookingId, status);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to update booking status');
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
  },
});

export const { clearFeedback } = facilitySlice.actions;
export default facilitySlice.reducer;
