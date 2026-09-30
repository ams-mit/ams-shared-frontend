import { setSessionExpiredHandler } from '@/services/api/interceptors';
import { sessionExpired } from '@/features/auth/store/authSlice';
import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './rootReducer';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});

setSessionExpiredHandler(() => {
  store.dispatch(sessionExpired());
});

export type AppDispatch = typeof store.dispatch;
export type { RootState } from './rootReducer';
