/**
 * Roles Redux Selectors
 * Memoized selectors for roles state
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/redux/store/store';
import type { RolesState } from './rolesTypes';
import type { Role } from '@/services/api/types/roles.types';

// ============================================================================
// Base Selectors
// ============================================================================

/**
 * Select the entire roles state
 */
export const selectRolesState = (state: RootState): RolesState => state.roles;

// ============================================================================
// Data Selectors
// ============================================================================

/**
 * Select all roles
 */
export const selectRoles = createSelector(
  [selectRolesState],
  (rolesState): Role[] => rolesState.roles
);

/**
 * Select current role
 */
export const selectCurrentRole = createSelector(
  [selectRolesState],
  (rolesState): Role | null => rolesState.currentRole
);

// ============================================================================
// Pagination Selectors
// ============================================================================

/**
 * Select pagination data
 */
export const selectPagination = createSelector(
  [selectRolesState],
  (rolesState) => rolesState.pagination
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
 * Select total roles count
 */
export const selectTotalRoles = createSelector(
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
export const selectFilters = createSelector([selectRolesState], (rolesState) => rolesState.filters);

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
  [selectRolesState],
  (rolesState) => rolesState.isLoading
);

/**
 * Select creating state
 */
export const selectIsCreating = createSelector(
  [selectRolesState],
  (rolesState) => rolesState.isCreating
);

/**
 * Select updating state
 */
export const selectIsUpdating = createSelector(
  [selectRolesState],
  (rolesState) => rolesState.isUpdating
);

/**
 * Select deleting state
 */
export const selectIsDeleting = createSelector(
  [selectRolesState],
  (rolesState) => rolesState.isDeleting
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
export const selectError = createSelector([selectRolesState], (rolesState) => rolesState.error);

/**
 * Select validation errors
 */
export const selectValidationErrors = createSelector(
  [selectRolesState],
  (rolesState) => rolesState.validationErrors
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
 * Select selected role IDs
 */
export const selectSelectedRoleIds = createSelector(
  [selectRolesState],
  (rolesState) => rolesState.selectedRoleIds
);

/**
 * Select count of selected roles
 */
export const selectSelectedRolesCount = createSelector(
  [selectSelectedRoleIds],
  (selectedIds) => selectedIds.length
);

/**
 * Check if any roles are selected
 */
export const selectHasSelectedRoles = createSelector(
  [selectSelectedRolesCount],
  (count) => count > 0
);

/**
 * Select if state is initialized
 */
export const selectIsInitialized = createSelector(
  [selectRolesState],
  (rolesState) => rolesState.isInitialized
);

// ============================================================================
// Derived/Computed Selectors
// ============================================================================

/**
 * Select role by ID
 */
export const selectRoleById = (id: string) =>
  createSelector([selectRoles], (roles) => roles.find((role) => role.id === id));

/**
 * Select roles with search filter applied
 */
export const selectFilteredRoles = createSelector(
  [selectRoles, selectFilters],
  (roles, filters) => {
    let filtered = [...roles];

    // Apply search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter((role) => {
        const nameMatch = role.name.toLowerCase().includes(searchLower);
        const descriptionMatch = role.description?.toLowerCase().includes(searchLower);

        return nameMatch || descriptionMatch;
      });
    }

    return filtered;
  }
);

/**
 * Select empty state
 */
export const selectIsEmpty = createSelector(
  [selectRoles, selectIsLoading, selectIsInitialized],
  (roles, isLoading, isInitialized) => !isLoading && isInitialized && roles.length === 0
);
