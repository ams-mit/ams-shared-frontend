import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/store/authSlice';
import facilityReducer from '@/features/facilities/store/facilitySlice';
import visitorReducer from '@/features/visitors/store/visitorSlice';
import announcementReducer from '@/features/announcements/store/announcementSlice';
import uiReducer from './uiSlice';

export const rootReducer = combineReducers({
  auth: authReducer,
  facilities: facilityReducer,
  visitors: visitorReducer,
  announcements: announcementReducer,
  ui: uiReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
