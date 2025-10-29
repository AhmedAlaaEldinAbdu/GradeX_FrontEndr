/**
 * Schools Redux Feature
 * Exports for schools state management
 */

// Reducer
export { default as schoolsReducer } from './schoolsSlice';

// Actions (Async Thunks)
export {
  fetchSchools,
  fetchSchoolById,
  createSchool,
  createSchoolWithFormData,
  updateSchool,
  deleteSchool,
  restoreSchool,
  updateSchoolStatus,
  approveSchool,
  rejectSchool,
  activateSchool,
  deactivateSchool,
  fetchSchoolStatistics,
} from './schoolsSlice';

// Selectors
export * from './schoolsSelectors';

// Types
export * from './schoolsTypes';
