import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import schoolsReducer from '../features/schools/schoolsSlice';
import lookupsReducer from '../features/lookups/lookupsSlice';
// import academicSystemsSlice from '../features/academic-system/academicSystemSlice';
import academicSystemsReducer from '../features/academic-system/academicSystemSlice';
import academicSubSystemsReducer from '../features/academic-subsystem/academicSubSystemSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    schools: schoolsReducer,
    lookups: lookupsReducer,
    // academicSystems: academicSystemsSlice,
    academicSystems: academicSystemsReducer,
    academicSubSystems: academicSubSystemsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
