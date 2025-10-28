/**
 * Academic System Redux Module
 * Central export point for academic system state management
 */

// Slice and Actions
export { default as academicSystemReducer } from './academicSystemSlice';
export {
  getAcademicSystems,
  getAcademicSystemById,
  addAcademicSystem,
  editAcademicSystem,
  deleteAcademicSystem,
} from './academicSystemSlice';

// Selectors
export {
  selectAcademicSystems,
  selectIsLoadingAcademicSystems,
  selectAcademicSystemsError,
  selectAcademicSystemsPagination,
  selectAcademicSystemDetails,
  selectIsCreatingAcademicSystem,
  selectIsUpdatingAcademicSystem,
  selectIsDeletingAcademicSystem,
  selectAcademicSystemsValidationErrors,
} from './academicSystemSelectors';

// Types
export type { AcademicSystemState } from './academicSystemTypes';
export type { FetchAcademicSystemsPayload } from './academicSystemTypes';
