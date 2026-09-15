import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/store/authSlice';
import uiReducer from './uiSlice';

export const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

