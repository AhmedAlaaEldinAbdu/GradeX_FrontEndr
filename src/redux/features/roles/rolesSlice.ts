/**
 * Roles Redux Slice
 * State management for roles
 */

import {
  createSlice,
  type PayloadAction,
  type ActionReducerMapBuilder,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import type { FetchRolesPayload, FetchRolesResponse, RolesState } from './rolesTypes';
import {
  rolesApiService,
  type CreateRoleRequest,
  type Role,
  type RoleQueryParams,
  type UpdateRoleRequest,
} from '@/services/api';
import { getErrorMessage } from '@/lib/http';

const initialState: RolesState = {
  // Data
  roles: [],
  currentRole: null,

  // Pagination
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  // Filters
  filters: {},

  // Loading States
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,

  // Error States
  error: null,
  validationErrors: null,

  // UI States
  selectedRoleIds: [],
  isInitialized: false,
};

// ============================================================================
// Async Thunks
// ============================================================================

export const fetchRoles = createAsyncThunk<FetchRolesResponse, FetchRolesPayload | void>(
  'roles/fetchRoles',
  async (payload, { rejectWithValue }) => {
    try {
      const params: Partial<RoleQueryParams> = {};

      if (payload) {
        if (payload.page) params.pageIndex = payload.page;
        if (payload.limit) params.pageSize = payload.limit;
        if (payload.sortBy) params.sortBy = payload.sortBy as RoleQueryParams['sortBy'];
        if (payload.sortOrder) params.sortOrder = payload.sortOrder;

        if (payload.filters) {
          if (payload.filters.searchTerm) params.searchTerm = payload.filters.searchTerm;
        }
      }

      const response = await rolesApiService.getRoles(params as RoleQueryParams);

      if (!response) {
        return {
          data: [],
          meta: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
          },
        };
      }

      return {
        data: response.items || [],
        meta: {
          total: response.totalItems || 0,
          page: response.pageIndex || 1,
          limit: response.pageSize || 10,
          totalPages: response.totalPages || 0,
        },
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchRoleById = createAsyncThunk<Role, string>(
  'roles/fetchRoleById',
  async (id, { rejectWithValue }) => {
    try {
      const role = await rolesApiService.getRoleById(id);
      return role;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createRole = createAsyncThunk<Role, CreateRoleRequest>(
  'roles/createRole',
  async (data, { rejectWithValue }) => {
    try {
      const role = await rolesApiService.createRole(data);
      return role;
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'isValidationError' in error &&
        error.isValidationError
      ) {
        const validationErrors = (error as unknown as { validationErrors: unknown })
          .validationErrors;

        let errorMessage = getErrorMessage(error);
        if (Array.isArray(validationErrors) && validationErrors.length > 0) {
          const firstError = validationErrors[0];
          if (
            typeof firstError === 'object' &&
            firstError !== null &&
            'errorMessage' in firstError
          ) {
            errorMessage = (firstError as { errorMessage: string }).errorMessage;
          } else if (typeof firstError === 'string') {
            errorMessage = firstError;
          }
        }

        return rejectWithValue({
          message: errorMessage,
          validationErrors: validationErrors,
        });
      }
      return rejectWithValue({ message: getErrorMessage(error), validationErrors: null });
    }
  }
);

export const updateRole = createAsyncThunk<Role, UpdateRoleRequest>(
  'roles/updateRole',
  async (data, { rejectWithValue }) => {
    try {
      const role = await rolesApiService.updateRole(data);
      return role;
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'isValidationError' in error &&
        error.isValidationError
      ) {
        const validationErrors = (error as unknown as { validationErrors: unknown })
          .validationErrors;

        let errorMessage = getErrorMessage(error);
        if (Array.isArray(validationErrors) && validationErrors.length > 0) {
          const firstError = validationErrors[0];
          if (
            typeof firstError === 'object' &&
            firstError !== null &&
            'errorMessage' in firstError
          ) {
            errorMessage = (firstError as { errorMessage: string }).errorMessage;
          } else if (typeof firstError === 'string') {
            errorMessage = firstError;
          }
        }

        return rejectWithValue({
          message: errorMessage,
          validationErrors: validationErrors,
        });
      }
      return rejectWithValue({ message: getErrorMessage(error), validationErrors: null });
    }
  }
);

export const deleteRole = createAsyncThunk<string, string>(
  'roles/deleteRole',
  async (id, { rejectWithValue }) => {
    try {
      await rolesApiService.deleteRole(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// ============================================================================
// Slice
// ============================================================================

const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    /**
     * Set pagination
     */
    setPagination: (state, action: PayloadAction<{ page?: number; limit?: number }>) => {
      if (action.payload.page !== undefined) {
        state.pagination.page = action.payload.page;
      }
      if (action.payload.limit !== undefined) {
        state.pagination.limit = action.payload.limit;
      }
    },
    /**
     * Reset pagination to initial state
     */
    resetPagination: (state) => {
      state.pagination = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };
    },
    /**
     * Set filters
     */
    setFilters: (state, action: PayloadAction<RolesState['filters']>) => {
      state.filters = action.payload;
    },
    /**
     * Clear error
     */
    clearError: (state) => {
      state.error = null;
      state.validationErrors = null;
    },
  },

  extraReducers: (builder: ActionReducerMapBuilder<RolesState>) => {
    // Fetch Roles
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.roles = action.payload.data;
        state.pagination = {
          page: action.payload.meta.page,
          limit: action.payload.meta.limit,
          total: action.payload.meta.total,
          totalPages: action.payload.meta.totalPages,
        };
        state.error = null;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Role By ID
    builder
      .addCase(fetchRoleById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRoleById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRole = action.payload;
        state.error = null;
      })
      .addCase(fetchRoleById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Role
    builder
      .addCase(createRole.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.isCreating = false;
        state.roles.unshift(action.payload);
        state.pagination.total += 1;
        state.error = null;
      })
      .addCase(createRole.rejected, (state, action) => {
        state.isCreating = false;
        const payload = action.payload as
          | { message: string; validationErrors: unknown }
          | undefined;
        if (payload) {
          state.error = payload.message;
          state.validationErrors = payload.validationErrors as Record<string, string> | null;
        } else {
          state.error = 'An error occurred';
        }
      });

    // Update Role
    builder
      .addCase(updateRole.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.roles.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.roles[index] = action.payload;
        }
        if (state.currentRole?.id === action.payload.id) {
          state.currentRole = action.payload;
        }
        state.error = null;
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.isUpdating = false;
        const payload = action.payload as
          | { message: string; validationErrors: unknown }
          | undefined;
        if (payload) {
          state.error = payload.message;
          state.validationErrors = payload.validationErrors as Record<string, string> | null;
        } else {
          state.error = 'An error occurred';
        }
      });

    // Delete Role
    builder
      .addCase(deleteRole.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.roles = state.roles.filter((r) => r.id !== action.payload);
        state.pagination.total -= 1;
        state.error = null;
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export const { setPagination, resetPagination, setFilters, clearError } = rolesSlice.actions;

export default rolesSlice.reducer;
