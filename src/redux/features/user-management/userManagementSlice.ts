/**
 * User Management Redux Slice
 * State management for users
 */

import {
  createSlice,
  type PayloadAction,
  type ActionReducerMapBuilder,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import type {
  FetchUsersPayload,
  FetchUsersResponse,
  UserManagementState,
} from './userManagementTypes';
import {
  usersApiService,
  type CreateUserRequest,
  type User,
  type UserQueryParams,
  type UpdateUserRequest,
  type DeleteUserRequest,
  type AssignSchoolRoleRequest,
} from '@/services/api';
import { getErrorMessage } from '@/lib/http';

const initialState: UserManagementState = {
  // Data
  users: [],
  currentUser: null,

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
  isAssigning: false,

  // Error States
  error: null,
  validationErrors: null,

  // UI States
  selectedUserIds: [],
  isInitialized: false,
};

// ============================================================================
// Async Thunks
// ============================================================================

export const fetchUsers = createAsyncThunk<FetchUsersResponse, FetchUsersPayload | void>(
  'userManagement/fetchUsers',
  async (payload, { rejectWithValue }) => {
    try {
      const params: Partial<UserQueryParams> = {};

      if (payload) {
        if (payload.page) params.PageNumber = payload.page;
        if (payload.limit) params.PageSize = payload.limit;
        if (payload.sortBy) params.sortBy = payload.sortBy as UserQueryParams['sortBy'];
        if (payload.sortOrder) params.sortOrder = payload.sortOrder;

        if (payload.filters) {
          if (payload.filters.searchTerm) params.Search = payload.filters.searchTerm;
          if (payload.filters.roleId) params.roleId = payload.filters.roleId;
          if (payload.filters.lkCountryId) params.lkCountryId = payload.filters.lkCountryId;
          if (payload.filters.schoolBranchesId)
            params.SchoolBranchId = payload.filters.schoolBranchesId;
        }
      }

      const response = await usersApiService.getUsers(params as UserQueryParams);

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

export const fetchUserById = createAsyncThunk<User, string>(
  'userManagement/fetchUserById',
  async (id, { rejectWithValue }) => {
    try {
      const user = await usersApiService.getUserById(id);
      return user;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createUser = createAsyncThunk<User, CreateUserRequest>(
  'userManagement/createUser',
  async (data, { rejectWithValue }) => {
    try {
      const user = await usersApiService.createUser(data);
      return user;
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'isValidationError' in error &&
        error.isValidationError
      ) {
        return rejectWithValue({
          message: getErrorMessage(error),
          validationErrors: (error as unknown as { validationErrors: unknown }).validationErrors,
        });
      }
      return rejectWithValue({ message: getErrorMessage(error), validationErrors: null });
    }
  }
);

export const updateUser = createAsyncThunk<User, UpdateUserRequest>(
  'userManagement/updateUser',
  async (data, { rejectWithValue }) => {
    try {
      const user = await usersApiService.updateUser(data);
      return user;
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'isValidationError' in error &&
        error.isValidationError
      ) {
        return rejectWithValue({
          message: getErrorMessage(error),
          validationErrors: (error as unknown as { validationErrors: unknown }).validationErrors,
        });
      }
      return rejectWithValue({ message: getErrorMessage(error), validationErrors: null });
    }
  }
);

export const deleteUser = createAsyncThunk<string, string>(
  'userManagement/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      const deleteRequest: DeleteUserRequest = { userId: id };
      await usersApiService.deleteUser(deleteRequest);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const assignSchoolRole = createAsyncThunk<AssignSchoolRoleRequest, AssignSchoolRoleRequest>(
  'userManagement/assignSchoolRole',
  async (data, { rejectWithValue }) => {
    try {
      await usersApiService.assignSchoolRole(data);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// ============================================================================
// Slice
// ============================================================================

const userManagementSlice = createSlice({
  name: 'userManagement',
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
    setFilters: (state, action: PayloadAction<UserManagementState['filters']>) => {
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

  extraReducers: (builder: ActionReducerMapBuilder<UserManagementState>) => {
    // Fetch Users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.users = action.payload.data;
        state.pagination = {
          page: action.payload.meta.page,
          limit: action.payload.meta.limit,
          total: action.payload.meta.total,
          totalPages: action.payload.meta.totalPages,
        };
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch User By ID
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create User
    builder
      .addCase(createUser.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isCreating = false;
        state.users.unshift(action.payload);
        state.pagination.total += 1;
        state.error = null;
      })
      .addCase(createUser.rejected, (state, action) => {
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

    // Update User
    builder
      .addCase(updateUser.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.currentUser?.id === action.payload.id) {
          state.currentUser = action.payload;
        }
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
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

    // Delete User
    builder
      .addCase(deleteUser.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.users = state.users.filter((u) => u.id !== action.payload);
        state.pagination.total -= 1;
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });

    // Assign School Role
    builder
      .addCase(assignSchoolRole.pending, (state) => {
        state.isAssigning = true;
        state.error = null;
      })
      .addCase(assignSchoolRole.fulfilled, (state) => {
        state.isAssigning = false;
        state.error = null;
      })
      .addCase(assignSchoolRole.rejected, (state, action) => {
        state.isAssigning = false;
        state.error = action.payload as string;
      });
  },
});

export const { setPagination, resetPagination, setFilters, clearError } =
  userManagementSlice.actions;

export default userManagementSlice.reducer;
