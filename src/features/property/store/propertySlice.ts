import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { toApiError, type ApiErrorInfo } from '@/services/api/apiError';
import { propertyApi } from '../api/propertyApi';
import type {
  ActiveOccupancy,
  Building,
  CreateBuildingRequest,
  CreateOwnershipRequest,
  CreateUnitTypeRequest,
  Ownership,
  OwnershipLookup,
  UnitType,
} from '../types/property.types';

/**
 * Buildings and unit types are read from the `units` slice (fetchInventory); this slice owns
 * creating them, ownership records, and the signed-in resident's active lease.
 */
interface PropertyState {
  ownerships: Ownership[];
  ownershipLookup: OwnershipLookup | null;
  ownershipsLoading: boolean;
  ownershipsError: ApiErrorInfo | null;
  activeOccupancy: ActiveOccupancy | null;
  occupancyLoading: boolean;
  occupancyError: ApiErrorInfo | null;
}

const initialState: PropertyState = {
  ownerships: [],
  ownershipLookup: null,
  ownershipsLoading: false,
  ownershipsError: null,
  activeOccupancy: null,
  occupancyLoading: false,
  occupancyError: null,
};

export const createBuilding = createAsyncThunk<Building, CreateBuildingRequest, { rejectValue: ApiErrorInfo }>(
  'property/createBuilding',
  async (payload, { rejectWithValue }) => {
    try {
      return await propertyApi.createBuilding(payload);
    } catch (err) {
      return rejectWithValue(toApiError(err, 'Failed to create building.'));
    }
  }
);

export const createUnitType = createAsyncThunk<UnitType, CreateUnitTypeRequest, { rejectValue: ApiErrorInfo }>(
  'property/createUnitType',
  async (payload, { rejectWithValue }) => {
    try {
      return await propertyApi.createUnitType(payload);
    } catch (err) {
      return rejectWithValue(toApiError(err, 'Failed to create unit type.'));
    }
  }
);

export const fetchOwnerships = createAsyncThunk<Ownership[], OwnershipLookup, { rejectValue: ApiErrorInfo }>(
  'property/fetchOwnerships',
  async (lookup, { rejectWithValue }) => {
    try {
      return await propertyApi.getOwnerships(lookup);
    } catch (err) {
      return rejectWithValue(toApiError(err, 'Failed to load ownership records.'));
    }
  }
);

export const createOwnership = createAsyncThunk<Ownership, CreateOwnershipRequest, { rejectValue: ApiErrorInfo }>(
  'property/createOwnership',
  async (payload, { rejectWithValue }) => {
    try {
      return await propertyApi.createOwnership(payload);
    } catch (err) {
      return rejectWithValue(toApiError(err, 'Failed to assign owner.'));
    }
  }
);

export const fetchActiveOccupancy = createAsyncThunk<ActiveOccupancy, string, { rejectValue: ApiErrorInfo }>(
  'property/fetchActiveOccupancy',
  async (unitId, { rejectWithValue }) => {
    try {
      return await propertyApi.getActiveOccupancy(unitId);
    } catch (err) {
      return rejectWithValue(toApiError(err, 'Failed to load the active lease for this unit.'));
    }
  }
);

const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOwnerships.pending, (state, action) => {
        state.ownershipsLoading = true;
        state.ownershipsError = null;
        state.ownershipLookup = action.meta.arg;
      })
      .addCase(fetchOwnerships.fulfilled, (state, action) => {
        state.ownershipsLoading = false;
        state.ownerships = action.payload;
      })
      .addCase(fetchOwnerships.rejected, (state, action) => {
        state.ownershipsLoading = false;
        state.ownershipsError = action.payload ?? { message: action.error.message ?? 'Request failed.' };
      })
      .addCase(createOwnership.fulfilled, (state, action) => {
        const lookup = state.ownershipLookup;
        const matches =
          lookup &&
          ((lookup.by === 'unit' && lookup.unitId === action.payload.unitId) ||
            (lookup.by === 'owner' && lookup.ownerId === action.payload.ownerId));
        if (matches) state.ownerships.push(action.payload);
      })
      .addCase(fetchActiveOccupancy.pending, (state) => {
        state.occupancyLoading = true;
        state.occupancyError = null;
        state.activeOccupancy = null;
      })
      .addCase(fetchActiveOccupancy.fulfilled, (state, action) => {
        state.occupancyLoading = false;
        state.activeOccupancy = action.payload;
      })
      .addCase(fetchActiveOccupancy.rejected, (state, action) => {
        state.occupancyLoading = false;
        state.occupancyError = action.payload ?? { message: action.error.message ?? 'Request failed.' };
      });
  },
});

export default propertySlice.reducer;
