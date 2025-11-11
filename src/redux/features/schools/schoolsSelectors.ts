/**
 * Schools Redux Selectors
 * Memoized selectors for schools state
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/redux/store/store';
import type { SchoolsState } from './schoolsTypes';
import type {
  School,
  SchoolDetail,
  SchoolStatisticsResponse,
  SchoolStatusEnum,
} from '@/services/api/types/school.types';

// ============================================================================
// Base Selectors
// ============================================================================

/**
 * Select the entire schools state
 */
export const selectSchoolsState = (state: RootState): SchoolsState => state.schools;

// ============================================================================
// Data Selectors
// ============================================================================

/**
 * Select all schools
 */
export const selectSchools = createSelector(
  [selectSchoolsState],
  (schoolsState): School[] => schoolsState.schools
);

/**
 * Select current school
 */
export const selectCurrentSchool = createSelector(
  [selectSchoolsState],
  (schoolsState): SchoolDetail | null => schoolsState.currentSchool
);

/**
 * Select school statistics
 */
export const selectSchoolStatistics = createSelector(
  [selectSchoolsState],
  (schoolsState): SchoolStatisticsResponse | null => schoolsState.statistics
);

// ============================================================================
// Pagination Selectors
// ============================================================================

/**
 * Select pagination data
 */
export const selectPagination = createSelector(
  [selectSchoolsState],
  (schoolsState) => schoolsState.pagination
);

/**
 * Select current page
 */
export const selectCurrentPage = createSelector(
  [selectPagination],
  (pagination) => pagination.page
);

/**
 * Select page limit
 */
export const selectPageLimit = createSelector([selectPagination], (pagination) => pagination.limit);

/**
 * Select total schools count
 */
export const selectTotalSchools = createSelector(
  [selectPagination],
  (pagination) => pagination.total
);

/**
 * Select total pages
 */
export const selectTotalPages = createSelector(
  [selectPagination],
  (pagination) => pagination.totalPages
);

// ============================================================================
// Filter Selectors
// ============================================================================

/**
 * Select active filters
 */
export const selectFilters = createSelector(
  [selectSchoolsState],
  (schoolsState) => schoolsState.filters
);

/**
 * Check if filters are active
 */
export const selectHasActiveFilters = createSelector(
  [selectFilters],
  (filters) => Object.keys(filters).length > 0
);

// ============================================================================
// Loading State Selectors
// ============================================================================

/**
 * Select loading state
 */
export const selectIsLoading = createSelector(
  [selectSchoolsState],
  (schoolsState) => schoolsState.isLoading
);

/**
 * Select creating state
 */
export const selectIsCreating = createSelector(
  [selectSchoolsState],
  (schoolsState) => schoolsState.isCreating
);

/**
 * Select updating state
 */
export const selectIsUpdating = createSelector(
  [selectSchoolsState],
  (schoolsState) => schoolsState.isUpdating
);

/**
 * Select deleting state
 */
export const selectIsDeleting = createSelector(
  [selectSchoolsState],
  (schoolsState) => schoolsState.isDeleting
);

/**
 * Select fetching statistics state
 */
export const selectIsFetchingStats = createSelector(
  [selectSchoolsState],
  (schoolsState) => schoolsState.isFetchingStats
);

/**
 * Select if any operation is in progress
 */
export const selectIsOperationInProgress = createSelector(
  [selectIsLoading, selectIsCreating, selectIsUpdating, selectIsDeleting],
  (isLoading, isCreating, isUpdating, isDeleting) =>
    isLoading || isCreating || isUpdating || isDeleting
);

// ============================================================================
// Error State Selectors
// ============================================================================

/**
 * Select error
 */
export const selectError = createSelector(
  [selectSchoolsState],
  (schoolsState) => schoolsState.error
);

/**
 * Select validation errors
 */
export const selectValidationErrors = createSelector(
  [selectSchoolsState],
  (schoolsState) => schoolsState.validationErrors
);

/**
 * Check if there are any errors
 */
export const selectHasError = createSelector(
  [selectError, selectValidationErrors],
  (error, validationErrors) => error !== null || validationErrors !== null
);

// ============================================================================
// UI State Selectors
// ============================================================================

/**
 * Select selected school IDs
 */
export const selectSelectedSchoolIds = createSelector(
  [selectSchoolsState],
  (schoolsState) => schoolsState.selectedSchoolIds
);

/**
 * Select count of selected schools
 */
export const selectSelectedSchoolsCount = createSelector(
  [selectSelectedSchoolIds],
  (selectedIds) => selectedIds.length
);

/**
 * Check if any schools are selected
 */
export const selectHasSelectedSchools = createSelector(
  [selectSelectedSchoolsCount],
  (count) => count > 0
);

/**
 * Check if all schools are selected
 */
export const selectAllSchoolsSelected = createSelector(
  [selectSchools, selectSelectedSchoolIds],
  (schools, selectedIds) => schools.length > 0 && schools.length === selectedIds.length
);

/**
 * Select if state is initialized
 */
export const selectIsInitialized = createSelector(
  [selectSchoolsState],
  (schoolsState) => schoolsState.isInitialized
);

// ============================================================================
// Derived/Computed Selectors
// ============================================================================

/**
 * Select school by ID
 */
export const selectSchoolById = (id: string) =>
  createSelector([selectSchools], (schools) => schools.find((school) => school.id === id));

/**
 * Select schools by status
 */
export const selectSchoolsByStatus = (status: SchoolStatusEnum) =>
  createSelector([selectSchools], (schools) =>
    schools.filter((school) => school.schoolStatus === status)
  );

/**
 * Select schools count by status
 */
export const selectSchoolsCountByStatus = createSelector([selectSchools], (schools) => {
  const counts: Record<number, number> = {};

  schools.forEach((school) => {
    counts[school.schoolStatus] = (counts[school.schoolStatus] || 0) + 1;
  });

  return counts;
});

/**
 * Select pending schools count
 */
export const selectPendingSchoolsCount = createSelector(
  [selectSchoolStatistics],
  (statistics) => statistics?.pending || 0
);

/**
 * Select approved schools count
 */
export const selectApprovedSchoolsCount = createSelector(
  [selectSchoolStatistics],
  (statistics) => statistics?.approved || 0
);

/**
 * Select active schools count
 */
export const selectActiveSchoolsCount = createSelector(
  [selectSchoolStatistics],
  (statistics) => statistics?.active || 0
);

/**
 * Select rejected schools count
 */
export const selectRejectedSchoolsCount = createSelector(
  [selectSchoolStatistics],
  (statistics) => statistics?.rejected || 0
);

/**
 * Select selected schools (full objects)
 */
export const selectSelectedSchools = createSelector(
  [selectSchools, selectSelectedSchoolIds],
  (schools, selectedIds) => schools.filter((school) => selectedIds.includes(school.id))
);

/**
 * Check if specific school is selected
 */
export const selectIsSchoolSelected = (id: string) =>
  createSelector([selectSelectedSchoolIds], (selectedIds) => selectedIds.includes(id));

/**
 * Select schools with search filter applied
 */
export const selectFilteredSchools = createSelector(
  [selectSchools, selectFilters],
  (schools, filters) => {
    let filtered = [...schools];

    // Apply search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter((school) => {
        const nameMatch =
          school.nameAr.toLowerCase().includes(searchLower) ||
          school.nameEn.toLowerCase().includes(searchLower);
        const emailMatch = school.email.toLowerCase().includes(searchLower);
        const academicSystemMatch = school.academicSystemId.toLowerCase().includes(searchLower);

        return nameMatch || emailMatch || academicSystemMatch;
      });
    }

    // Apply status filter
    if (filters.schoolStatus) {
      const statusArray = Array.isArray(filters.schoolStatus)
        ? filters.schoolStatus
        : [filters.schoolStatus];
      filtered = filtered.filter((school) => statusArray.includes(school.schoolStatus));
    }

    // Apply country filter
    if (filters.lKCountryId) {
      filtered = filtered.filter((school) =>
        school.schoolBranches.some((branch) => branch.lkCountryId === filters.lKCountryId)
      );
    }

    // Apply region filter
    if (filters.region) {
      filtered = filtered.filter((school) =>
        school.schoolBranches.some((branch) => branch.region === filters.region)
      );
    }

    // Apply neighborhood filter
    if (filters.neighborhood) {
      filtered = filtered.filter((school) =>
        school.schoolBranches.some((branch) => branch.neighborhood === filters.neighborhood)
      );
    }

    // Apply academic system filter
    if (filters.academicSystemId) {
      filtered = filtered.filter((school) => school.academicSystemId === filters.academicSystemId);
    }

    return filtered;
  }
);

/**
 * Select empty state
 */
export const selectIsEmpty = createSelector(
  [selectSchools, selectIsLoading, selectIsInitialized],
  (schools, isLoading, isInitialized) => !isLoading && isInitialized && schools.length === 0
);
