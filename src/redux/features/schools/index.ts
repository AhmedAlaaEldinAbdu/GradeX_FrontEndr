/**
 * Schools Redux Feature
 * Exports for schools state management
 */

// Reducer
export { default as schoolsReducer } from './schoolsSlice';

// Actions (Async Thunks and Sync Actions)
export {
  fetchSchools,
  fetchRegisteredSchools,
  fetchPendingSchools,
  fetchDeletedSchools,
  fetchSchoolById,
  createSchool,
  createSchoolWithFormData,
  updateSchool,
  updateSchoolWithFormData,
  deleteSchool,
  restoreSchool,
  updateSchoolStatus,
  approveSchool,
  rejectSchool,
  acceptSchoolApplication,
  rejectSchoolApplication,
  sendSchoolEditRequest,
  activateSchool,
  deactivateSchool,
  fetchSchoolStatistics,
  exportSchoolsExcel,
  setPagination,
  resetPagination,
  clearSchools,
} from './schoolsSlice';

// Selectors
export * from './schoolsSelectors';

// Types
export * from './schoolsTypes';
