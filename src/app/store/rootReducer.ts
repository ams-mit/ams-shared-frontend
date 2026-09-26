import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/store/authSlice';
import facilityReducer from '@/features/facilities/store/facilitySlice';
import visitorReducer from '@/features/visitors/store/visitorSlice';
import announcementReducer from '@/features/announcements/store/announcementSlice';
import unitReducer from '@/features/units/store/unitSlice';
import leaseReducer from '@/features/leases/store/leaseSlice';
import propertyReducer from '@/features/property/store/propertySlice';
import uiReducer from './uiSlice';

export const rootReducer = combineReducers({
  auth: authReducer,
  facilities: facilityReducer,
  visitors: visitorReducer,
  announcements: announcementReducer,
  units: unitReducer,
  leases: leaseReducer,
  property: propertyReducer,
  ui: uiReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
