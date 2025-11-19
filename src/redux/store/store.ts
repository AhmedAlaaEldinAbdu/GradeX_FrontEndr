import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import schoolsReducer from '../features/schools/schoolsSlice';
import lookupsReducer from '../features/lookups/lookupsSlice';
// import academicSystemsSlice from '../features/academic-system/academicSystemSlice';
import academicSystemsReducer from '../features/academic-system/academicSystemSlice';
import academicSubSystemsReducer from '../features/academic-subsystem/academicSubSystemSlice';
import educationalStagesReducer from '../features/educational-stages/educationalStagesSlice';
import rolesReducer from '../features/roles/rolesSlice';
import userManagementReducer from '../features/user-management/userManagementSlice';
import officialHolidaysReducer from '../features/official-holidays';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    schools: schoolsReducer,
    lookups: lookupsReducer,
    // academicSystems: academicSystemsSlice,
    academicSystems: academicSystemsReducer,
    academicSubSystems: academicSubSystemsReducer,
    educationalStages: educationalStagesReducer,
    roles: rolesReducer,
    userManagement: userManagementReducer,
    officialHolidays: officialHolidaysReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
