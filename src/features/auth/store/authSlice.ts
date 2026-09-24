import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PRESET_USERS, MockUser, UserRole } from '@/constants/roles';
import { AuthState } from '../types/auth.types';

const initialUser: MockUser = PRESET_USERS[0];

const initialState: AuthState = {
  currentUser: initialUser,
  availableUsers: PRESET_USERS,
  activeRole: initialUser.role,
  isDemoMode: true,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<MockUser>) => {
      state.currentUser = action.payload;
      state.activeRole = action.payload.role;
    },
    switchUserById: (state, action: PayloadAction<string>) => {
      const found = state.availableUsers.find((u) => u.id === action.payload);
      if (found) {
        state.currentUser = found;
        state.activeRole = found.role;
      }
    },
    setActiveRole: (state, action: PayloadAction<UserRole>) => {
      state.activeRole = action.payload;
      // also adjust current user role if necessary
      state.currentUser = {
        ...state.currentUser,
        role: action.payload,
      };
    },
    toggleDemoMode: (state) => {
      state.isDemoMode = !state.isDemoMode;
    },
  },
});

export const { setCurrentUser, switchUserById, setActiveRole, toggleDemoMode } = authSlice.actions;
export default authSlice.reducer;
