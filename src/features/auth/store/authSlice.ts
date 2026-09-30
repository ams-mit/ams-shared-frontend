import { readTokenClaims } from './permissions';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RelationshipStatus } from '@/types/common';
import { PRESET_USERS, type MockUser, type UserRole } from '@/constants/roles';
import { tokenStorage } from '@/services/storage/tokenStorage';

export interface User {
  id: string;
  unitId?: string;
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
const claims = readTokenClaims(initialToken);
const savedUser = tokenStorage.getUser() as User | null;
const initialUser: User | MockUser = initialToken
  ? savedUser && savedUser.id === claims.sub
    ? savedUser
    : {
        id: claims.sub ?? '',
        name: 'Signed-in User',
        email: '',
        role: claims.roles?.[0] ?? 'RESIDENT',
      }
  : PRESET_USERS[0];

const initialState: AuthState = {
  user: initialToken ? (initialUser as User) : null,
  currentUser: initialUser,
  availableUsers: PRESET_USERS,
  activeRole: initialUser.role,
  token: initialToken,
  isAuthenticated: !!initialToken,
  isLoading: false,
  error: null,
  mustChangePassword: !!(
    initialToken && (initialUser as User).mustChangePassword
  ),
  isDemoMode: !initialToken,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Authentication Actions (from loginscreen)
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        token: string;
        mustChangePassword?: boolean;
      }>
    ) => {
      const { user, token, mustChangePassword } = action.payload;
      state.user = {
        ...user,
        mustChangePassword: !!mustChangePassword || !!user.mustChangePassword,
      };
      state.currentUser = state.user;
      state.activeRole = user.role;
      state.token = token;
      state.isAuthenticated = true;
      state.isDemoMode = false;
      state.error = null;
      state.mustChangePassword =
        !!mustChangePassword || !!user.mustChangePassword;
      tokenStorage.setToken(token);
      tokenStorage.setUser(state.user);
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
        tokenStorage.setUser(state.user);
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
      if (!state.isDemoMode) return;
      state.currentUser = action.payload;
      state.activeRole = action.payload.role;
    },
    switchUserById: (state, action: PayloadAction<string>) => {
      if (!state.isDemoMode) return;
      const found = state.availableUsers.find((u) => u.id === action.payload);
      if (found) {
        state.currentUser = found;
        state.activeRole = found.role;
      }
    },
    setActiveRole: (state, action: PayloadAction<UserRole>) => {
      if (!state.isDemoMode) return;
      state.activeRole = action.payload;
      state.currentUser = {
        ...state.currentUser,
        role: action.payload,
      };
    },
    toggleDemoMode: (state) => {
      state.isDemoMode = !state.isDemoMode;
    },
    sessionExpired: (
      state,
      action: PayloadAction<string | undefined | void>
    ) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error =
        action.payload || 'Your session has expired. Please log in again.';
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
