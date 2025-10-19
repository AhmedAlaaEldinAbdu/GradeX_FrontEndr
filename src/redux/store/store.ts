import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import schoolsReducer from '../features/schools/schoolsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    schools: schoolsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
