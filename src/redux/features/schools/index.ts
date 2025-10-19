/**
 * Schools Redux Feature
 * Exports for schools state management
 */

// Reducer
export { default as schoolsReducer } from './schoolsSlice';

// Actions from Slice
export {
  setFilters,
  clearFilters,
  setPagination,
  selectSchools as selectSchoolsAction,
  toggleSchoolSelection,
  selectAllSchools as selectAllSchoolsAction,
  clearSelection,
  clearCurrentSchool,
  clearErrors,
  resetSchoolsState,
} from './schoolsSlice';

// Actions (Async Thunks)
export * from './schoolsActions';

// Selectors
export * from './schoolsSelectors';

// Types
export * from './schoolsTypes';
