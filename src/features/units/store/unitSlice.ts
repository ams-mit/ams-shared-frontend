import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { toApiError, type ApiErrorInfo } from '@/services/api/apiError';
import { unitApi } from '../api/unitApi';
import type { Building, CreateUnitRequest, Unit, UnitStatus, UnitType } from '../types/unit.types';

interface UnitState {
  buildings: Building[];
  unitTypes: UnitType[];
  units: Unit[];
  unitsApiAvailable: boolean;
  loading: boolean;
  error: ApiErrorInfo | null;
  statusFilter: UnitStatus | null;
  buildingFilter: number | null;
}

const initialState: UnitState = {
  buildings: [],
  unitTypes: [],
  units: [],
  unitsApiAvailable: true,
  loading: false,
  error: null,
  statusFilter: null,
  buildingFilter: null,
};

interface InventoryPayload {
  buildings: Building[];
  unitTypes: UnitType[];
  units: Unit[];
  unitsApiAvailable: boolean;
}

export const fetchInventory = createAsyncThunk<InventoryPayload, void, { rejectValue: ApiErrorInfo }>(
  'units/fetchInventory',
  async (_, { rejectWithValue }) => {
    try {
      const [buildings, unitTypes, unitsResult] = await Promise.all([
        unitApi.getBuildings(),
        unitApi.getUnitTypes(),
        unitApi
          .getUnits()
          .then((units) => ({ units, available: true }))
          .catch((err: unknown) => {
            // GET /units is not implemented yet; show buildings without units instead of failing.
            if (toApiError(err, '').status === 404) return { units: [] as Unit[], available: false };
            throw err;
          }),
      ]);
      return { buildings, unitTypes, units: unitsResult.units, unitsApiAvailable: unitsResult.available };
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

export const updateUnitStatus = createAsyncThunk<
  { unitId: number; status: UnitStatus },
  { unitId: number; status: UnitStatus },
  { rejectValue: ApiErrorInfo }
>('units/updateUnitStatus', async ({ unitId, status }, { rejectWithValue }) => {
  try {
    const updated = await unitApi.updateStatus(unitId, status);
    return { unitId, status: updated?.status ?? status };
  } catch (err) {
    return rejectWithValue(toApiError(err, 'Failed to update unit status.'));
  }
});

const unitSlice = createSlice({
  name: 'units',
  initialState,
  reducers: {
    setStatusFilter: (state, action: PayloadAction<UnitStatus | null>) => {
      state.statusFilter = action.payload;
    },
    setBuildingFilter: (state, action: PayloadAction<number | null>) => {
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
        state.unitsApiAvailable = action.payload.unitsApiAvailable;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? { message: action.error.message ?? 'Failed to load the unit inventory.' };
      })
      .addCase(createUnit.fulfilled, (state, action) => {
        state.units.push(action.payload);
      })
      .addCase(updateUnitStatus.fulfilled, (state, action) => {
        const unit = state.units.find((u) => u.id === action.payload.unitId);
        if (unit) unit.status = action.payload.status;
      });
  },
});

export const { setStatusFilter, setBuildingFilter } = unitSlice.actions;
export default unitSlice.reducer;
