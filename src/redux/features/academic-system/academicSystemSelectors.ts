/**
 * Academic System Redux Selectors
 * Memoized selectors for academic system state
 */

import type { RootState } from '@/redux/store/store';
import type { AcademicSubSystemResponse } from '@/services/api/types/academic-system.types';

/**
 * Select all academic systems
 */
export const selectAcademicSystems = (state: RootState): AcademicSubSystemResponse[] =>
  state.academicSystems.academicSystems;

/**
 * Select loading state
 */
export const selectIsLoadingAcademicSystems = (state: RootState): boolean =>
  state.academicSystems.isLoading;

/**
 * Select error state
 */
export const selectAcademicSystemsError = (state: RootState): string | null =>
  state.academicSystems.error;

/**
 * Select pagination
 */
export const selectAcademicSystemsPagination = (state: RootState) =>
  state.academicSystems.pagination;

/**
 * Select academic system details
 */
export const selectAcademicSystemDetails = (state: RootState) =>
  state.academicSystems.academicSystemDetails;

/**
 * Select creating state
 */
export const selectIsCreatingAcademicSystem = (state: RootState): boolean =>
  state.academicSystems.isCreating;

/**
 * Select updating state
 */
export const selectIsUpdatingAcademicSystem = (state: RootState): boolean =>
  state.academicSystems.isUpdating;

/**
 * Select deleting state
 */
export const selectIsDeletingAcademicSystem = (state: RootState): boolean =>
  state.academicSystems.isDeleting;

/**
 * Select validation errors
 */
export const selectAcademicSystemsValidationErrors = (state: RootState) =>
  state.academicSystems.validationErrors;
