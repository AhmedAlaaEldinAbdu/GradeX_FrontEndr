/**
 * User Management Redux Selectors
 * Memoized selectors for user management state
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/redux/store/store';
import type { UserManagementState } from './userManagementTypes';
import type { User } from '@/services/api/types/users.types';

// ============================================================================
// Base Selectors
// ============================================================================

/**
 * Select the entire user management state
 */
export const selectUserManagementState = (state: RootState): UserManagementState =>
  state.userManagement;

// ============================================================================
// Data Selectors
// ============================================================================

/**
 * Select all users
 */
export const selectUsers = createSelector(
  [selectUserManagementState],
  (userManagementState): User[] => userManagementState.users
);

/**
 * Select current user
 */
export const selectCurrentUser = createSelector(
  [selectUserManagementState],
  (userManagementState): User | null => userManagementState.currentUser
);

// ============================================================================
// Pagination Selectors
// ============================================================================

/**
 * Select pagination data
 */
export const selectPagination = createSelector(
  [selectUserManagementState],
  (userManagementState) => userManagementState.pagination
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
 * Select total users count
 */
export const selectTotalUsers = createSelector(
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

/**
 * @deprecated Use selectTotalUsers instead
 */
export const selectTotalRecords = selectTotalUsers;

// ============================================================================
// Filter Selectors
// ============================================================================

/**
 * Select active filters
 */
export const selectFilters = createSelector(
  [selectUserManagementState],
  (userManagementState) => userManagementState.filters
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
  [selectUserManagementState],
  (userManagementState) => userManagementState.isLoading
);

/**
 * Select creating state
 */
export const selectIsCreating = createSelector(
  [selectUserManagementState],
  (userManagementState) => userManagementState.isCreating
);

/**
 * Select updating state
 */
export const selectIsUpdating = createSelector(
  [selectUserManagementState],
  (userManagementState) => userManagementState.isUpdating
);

/**
 * Select deleting state
 */
export const selectIsDeleting = createSelector(
  [selectUserManagementState],
  (userManagementState) => userManagementState.isDeleting
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
  [selectUserManagementState],
  (userManagementState) => userManagementState.error
);

/**
 * @deprecated Use selectError instead
 */
export const selectUsersError = selectError;

/**
 * Select validation errors
 */
export const selectValidationErrors = createSelector(
  [selectUserManagementState],
  (userManagementState) => userManagementState.validationErrors
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
 * Select selected user IDs
 */
export const selectSelectedUserIds = createSelector(
  [selectUserManagementState],
  (userManagementState) => userManagementState.selectedUserIds
);

/**
 * Select count of selected users
 */
export const selectSelectedUsersCount = createSelector(
  [selectSelectedUserIds],
  (selectedIds) => selectedIds.length
);

/**
 * Check if any users are selected
 */
export const selectHasSelectedUsers = createSelector(
  [selectSelectedUsersCount],
  (count) => count > 0
);

/**
 * Select if state is initialized
 */
export const selectIsInitialized = createSelector(
  [selectUserManagementState],
  (userManagementState) => userManagementState.isInitialized
);

// ============================================================================
// Derived/Computed Selectors
// ============================================================================

/**
 * Select user by ID
 */
export const selectUserById = (id: string) =>
  createSelector([selectUsers], (users) => users.find((user) => user.id === id));

/**
 * Select users with search filter applied
 */
export const selectFilteredUsers = createSelector(
  [selectUsers, selectFilters],
  (users, filters) => {
    let filtered = [...users];

    // Apply search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter((user) => {
        const nameMatch = user.fullName.toLowerCase().includes(searchLower);
        const emailMatch = user.email.toLowerCase().includes(searchLower);

        return nameMatch || emailMatch;
      });
    }

    return filtered;
  }
);

/**
 * Select empty state
 */
export const selectIsEmpty = createSelector(
  [selectUsers, selectIsLoading, selectIsInitialized],
  (users, isLoading, isInitialized) => !isLoading && isInitialized && users.length === 0
);
