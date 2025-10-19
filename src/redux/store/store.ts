import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import schoolsReducer from '../features/schools/schoolsSlice';
import lookupsReducer from '../features/lookups/lookupsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    schools: schoolsReducer,
    lookups: lookupsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
