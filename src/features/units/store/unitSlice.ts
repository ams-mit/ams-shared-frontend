import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { toApiError, type ApiErrorInfo } from '@/services/api/apiError';
import { unitApi } from '../api/unitApi';
import { leaseApi } from '@/features/leases/api/leaseApi';
import type { Building, CreateUnitRequest, Unit, UnitStatus, UnitType } from '../types/unit.types';

interface UnitState {
  buildings: Building[];
  unitTypes: UnitType[];
  units: Unit[];
  /** Units with an ACTIVE lease in lease-occupancy-service. */
  leasedUnitIds: string[];
  loading: boolean;
  error: ApiErrorInfo | null;
  statusFilter: UnitStatus | null;
  buildingFilter: string | null;
}

const initialState: UnitState = {
  buildings: [],
  unitTypes: [],
  units: [],
  leasedUnitIds: [],
  loading: false,
  error: null,
  statusFilter: null,
  buildingFilter: null,
};

interface InventoryPayload {
  buildings: Building[];
  unitTypes: UnitType[];
  units: Unit[];
  leasedUnitIds: string[];
}

export const fetchInventory = createAsyncThunk<InventoryPayload, void, { rejectValue: ApiErrorInfo }>(
  'units/fetchInventory',
  async (_, { rejectWithValue }) => {
    try {
      const [buildings, unitTypes, units, activeLeases] = await Promise.all([
        unitApi.getBuildings(),
        unitApi.getUnitTypes(),
        unitApi.getUnits(),
        // Optional: without lease data the grid falls back to the property-service status.
        leaseApi.listAll({ status: 'ACTIVE' }).catch(() => []),
      ]);
      return { buildings, unitTypes, units, leasedUnitIds: [...new Set(activeLeases.map((l) => l.unitId))] };
    } catch (err) {
      return rejectWithValue(toApiError(err, 'Failed to load the unit inventory.'));
    }
  }
);

export const createUnit = createAsyncThunk<Unit, CreateUnitRequest, { rejectValue: ApiErrorInfo }>(
  'units/createUnit',
  async (payload, { rejectWithValue }) => {
    try {
      return await unitApi.createUnit(payload);
    } catch (err) {
      return rejectWithValue(toApiError(err, 'Failed to add unit.'));
    }
  }
);

const unitSlice = createSlice({
  name: 'units',
  initialState,
  reducers: {
    setStatusFilter: (state, action: PayloadAction<UnitStatus | null>) => {
      state.statusFilter = action.payload;
    },
    setBuildingFilter: (state, action: PayloadAction<string | null>) => {
      state.buildingFilter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.buildings = action.payload.buildings;
        state.unitTypes = action.payload.unitTypes;
        state.units = action.payload.units;
        state.leasedUnitIds = action.payload.leasedUnitIds;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? { message: action.error.message ?? 'Failed to load the unit inventory.' };
      })
      .addCase(createUnit.fulfilled, (state, action) => {
        state.units.push(action.payload);
      });
  },
});

export const { setStatusFilter, setBuildingFilter } = unitSlice.actions;
export default unitSlice.reducer;
