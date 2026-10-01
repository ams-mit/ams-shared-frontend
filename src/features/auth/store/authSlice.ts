import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RelationshipStatus } from '@/types/common';
import { PRESET_USERS, type MockUser, type UserRole } from '@/constants/roles';
import type { AccountStatus } from '@/features/users/types/user.types';
import { tokenStorage } from '@/services/storage/tokenStorage';

export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  unitId?: string;
  role: UserRole;
  relationshipStatus?: RelationshipStatus;
  accountStatus?: AccountStatus;
  grantedRoles?: UserRole[];
  systemRole?: string;
  systemRoles?: string[];
  mustChangePassword?: boolean;
}

interface AuthState {
  user: User | null;
  currentUser: User | MockUser;
  availableUsers: MockUser[];
  activeRole: UserRole;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  mustChangePassword: boolean;
  isDemoMode: boolean;
}

const initialToken = tokenStorage.getToken();
// Restored after a page reload; SessionRestorer then refreshes it from GET /auth/me.
const restoredUser = initialToken ? tokenStorage.getSessionUser<User>() : null;
const initialUser: User | MockUser = restoredUser ?? PRESET_USERS[0];

const initialState: AuthState = {
  user: restoredUser,
  currentUser: initialUser,
  availableUsers: PRESET_USERS,
  activeRole: initialUser.role,
  token: initialToken,
  isAuthenticated: !!initialToken,
  isLoading: false,
  error: null,
  mustChangePassword: Boolean(restoredUser?.mustChangePassword),
  isDemoMode: true,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
// Authentication Actions (from loginscreen)
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string; mustChangePassword?: boolean }>
    ) => {
      const { user, token, mustChangePassword } = action.payload;
      state.user = user;
      state.currentUser = user;
      state.activeRole = user.role;
      state.token = token;
      state.isAuthenticated = true;
      state.error = null;
      state.mustChangePassword = !!mustChangePassword || !!user.mustChangePassword;
      tokenStorage.setToken(token);
      tokenStorage.setSessionUser({ ...user, mustChangePassword: state.mustChangePassword });
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.mustChangePassword = false;
      tokenStorage.clearTokens();
    },
    setMustChangePassword: (state, action: PayloadAction<boolean>) => {
      state.mustChangePassword = action.payload;
      if (state.user) {
        state.user.mustChangePassword = action.payload;
        tokenStorage.setSessionUser(state.user);
      }
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Persona / Demo Actions (from main)
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
      state.currentUser = {
        ...state.currentUser,
        role: action.payload,
      };
    },
    toggleDemoMode: (state) => {
      state.isDemoMode = !state.isDemoMode;
    },
    sessionExpired: (state, action: PayloadAction<string | undefined | void>) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = action.payload || 'Your session has expired. Please log in again.';
      tokenStorage.clearTokens();
    },
  },
});

export const {
  setCredentials,
  logout,
  setMustChangePassword,
  setAuthLoading,
  setAuthError,
  sessionExpired,
  setCurrentUser,
  switchUserById,
  setActiveRole,
  toggleDemoMode,
} = authSlice.actions;
export default authSlice.reducer;
