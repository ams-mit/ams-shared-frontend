import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import { toApiError, type ApiErrorInfo } from '@/services/api/apiError';
import type { RootState } from '@/app/store';
import { selectGrantedRoles } from '@/features/auth/store/permissions';
import { unitApi } from '../api/unitApi';
import type {
  Building,
  CreateUnitRequest,
  Unit,
  UnitStatus,
  UnitType,
} from '../types/unit.types';

interface UnitState {
  buildings: Building[];
  buildingsLoading: boolean;
  buildingsError: ApiErrorInfo | null;
  unitTypes: UnitType[];
  units: Unit[];
  loading: boolean;
  error: ApiErrorInfo | null;
  statusFilter: UnitStatus | null;
}

const initialState: UnitState = {
  buildings: [],
  buildingsLoading: false,
  buildingsError: null,
  unitTypes: [],
  units: [],
  loading: false,
  error: null,
  statusFilter: null,
};

interface InventoryPayload {
  unitTypes: UnitType[];
  units: Unit[];
}
export const fetchInventory = createAsyncThunk<
  InventoryPayload,
  void,
  { rejectValue: ApiErrorInfo }
>('units/fetchInventory', async (_, { rejectWithValue }) => {
  try {
    const [unitTypes, units] = await Promise.all([
      unitApi.getUnitTypes(),
      unitApi.getUnits(),
    ]);
    return { unitTypes, units };
  } catch (err) {
    return rejectWithValue(
      toApiError(err, 'Failed to load the unit inventory.')
    );
  }
});
export const fetchBuildings = createAsyncThunk<
  Building[],
  void,
  { rejectValue: ApiErrorInfo }
>('units/fetchBuildings', async (_, { rejectWithValue, getState }) => {
  if (
    !selectGrantedRoles(getState() as RootState).some(
      (r) => ['ADMIN', 'PROPERTY_MANAGER', 'MANAGER', 'TENANT'].includes(r)
    )
  )
    return [];
  try {
    return await unitApi.getBuildings();
  } catch (err) {
    return rejectWithValue(toApiError(err, 'Failed to load buildings.'));
  }
});

export const createUnit = createAsyncThunk<
  Unit,
  CreateUnitRequest,
  { rejectValue: ApiErrorInfo }
>('units/createUnit', async (payload, { rejectWithValue }) => {
  try {
    return await unitApi.createUnit(payload);
  } catch (err) {
    return rejectWithValue(toApiError(err, 'Failed to add unit.'));
  }
});

const unitSlice = createSlice({
  name: 'units',
  initialState,
  reducers: {
    setStatusFilter: (state, action: PayloadAction<UnitStatus | null>) => {
      state.statusFilter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBuildings.pending, (state) => {
        state.buildingsLoading = true;
        state.buildingsError = null;
      })
      .addCase(fetchBuildings.fulfilled, (state, action) => {
        state.buildingsLoading = false;
        state.buildings = action.payload;
      })
      .addCase(fetchBuildings.rejected, (state, action) => {
        state.buildingsLoading = false;
        state.buildingsError = action.payload ?? {
          message: 'Failed to load buildings.',
        };
      })
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.unitTypes = action.payload.unitTypes;
        state.units = action.payload.units;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? {
          message: action.error.message ?? 'Failed to load the unit inventory.',
        };
      })
      .addCase(createUnit.fulfilled, (state, action) => {
        state.units.push(action.payload);
      });
  },
});

export const { setStatusFilter } = unitSlice.actions;
export default unitSlice.reducer;
