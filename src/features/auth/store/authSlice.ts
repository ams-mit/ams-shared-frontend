import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UserRole, RelationshipStatus } from '@/types/common';
import { tokenStorage } from '@/services/storage/tokenStorage';

export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  role: UserRole;
  relationshipStatus?: RelationshipStatus;
  accountStatus?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LOCKED';
  grantedRoles?: UserRole[];
  mustChangePassword?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  mustChangePassword: boolean;
}

const initialToken = tokenStorage.getToken();

const initialState: AuthState = {
  user: null,
  token: initialToken,
  isAuthenticated: !!initialToken,
  isLoading: false,
  error: null,
  mustChangePassword: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string; mustChangePassword?: boolean }>
    ) => {
      const { user, token, mustChangePassword } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.error = null;
      state.mustChangePassword = !!mustChangePassword || !!user.mustChangePassword;
      tokenStorage.setToken(token);
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
      }
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
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
} = authSlice.actions;

export default authSlice.reducer;
