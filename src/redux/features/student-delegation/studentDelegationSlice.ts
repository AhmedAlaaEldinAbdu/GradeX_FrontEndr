import {
  createSlice,
  type PayloadAction,
  type ActionReducerMapBuilder,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { studentDelegationApiService } from '@/services/api/student-delegation/student-delegation.service';
import type {
  StudentDelegation,
  StudentDelegationQueryParams,
  CreateStudentDelegationRequest,
  UpdateStudentDelegationRequest,
} from '@/services/api/types/student-delegation.types';
import { getErrorMessage } from '@/lib/http';

// ============================================================================
// Types
// ============================================================================

export interface StudentDelegationState {
  delegations: StudentDelegation[];
  selectedDelegation: StudentDelegation | null;

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  isLoading: boolean;
  isLoadingDelegation: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  error: string | null;
  isInitialized: boolean;
}

export interface FetchStudentDelegationsPayload {
  studentId?: string;
  page?: number;
  limit?: number;
}

export interface FetchStudentDelegationsResponse {
  data: StudentDelegation[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: StudentDelegationState = {
  delegations: [],
  selectedDelegation: null,

  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  isLoading: false,
  isLoadingDelegation: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,

  error: null,
  isInitialized: false,
};

// ============================================================================
// Async Thunks
// ============================================================================

export const fetchStudentDelegations = createAsyncThunk<
  FetchStudentDelegationsResponse,
  FetchStudentDelegationsPayload | void
>('studentDelegation/fetchStudentDelegations', async (payload, { rejectWithValue }) => {
  try {
    const params: StudentDelegationQueryParams = {};

    if (payload) {
      if (payload.studentId) params.studentId = payload.studentId;
      if (payload.page) params.PageIndex = payload.page;
      if (payload.limit) params.PageSize = payload.limit;
    }

    const response = await studentDelegationApiService.getStudentDelegations(params);

    if (!response?.isSuccess || !response.data) {
      return {
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };
    }

    return {
      data: response.data.studentDelegations || [],
      meta: {
        total: response.data.totalItems || 0,
        page: response.data.pageIndex || 1,
        limit: response.data.pageSize || 10,
        totalPages: response.data.totalPages || 0,
      },
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const getStudentDelegationById = createAsyncThunk<StudentDelegation, string>(
  'studentDelegation/getStudentDelegationById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await studentDelegationApiService.getStudentDelegationById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createStudentDelegation = createAsyncThunk<
  StudentDelegation,
  CreateStudentDelegationRequest
>('studentDelegation/createStudentDelegation', async (data, { rejectWithValue }) => {
  try {
    const response = await studentDelegationApiService.createStudentDelegation(data);
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateStudentDelegation = createAsyncThunk<
  StudentDelegation,
  UpdateStudentDelegationRequest
>('studentDelegation/updateStudentDelegation', async (data, { rejectWithValue }) => {
  try {
    const response = await studentDelegationApiService.updateStudentDelegation(data);
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteStudentDelegation = createAsyncThunk<string, string>(
  'studentDelegation/deleteStudentDelegation',
  async (id, { rejectWithValue }) => {
    try {
      await studentDelegationApiService.deleteStudentDelegation(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// ============================================================================
// Slice
// ============================================================================

const studentDelegationSlice = createSlice({
  name: 'studentDelegation',
  initialState,
  reducers: {
    setPagination: (state, action: PayloadAction<{ page?: number; limit?: number }>) => {
      if (action.payload.page !== undefined) state.pagination.page = action.payload.page;
      if (action.payload.limit !== undefined) state.pagination.limit = action.payload.limit;
    },
    setSelectedDelegation: (state, action: PayloadAction<StudentDelegation | null>) => {
      state.selectedDelegation = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<StudentDelegationState>) => {
    builder
      .addCase(fetchStudentDelegations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchStudentDelegations.fulfilled,
        (state, action: PayloadAction<FetchStudentDelegationsResponse>) => {
          state.isLoading = false;
          state.isInitialized = true;
          state.delegations = action.payload.data;
          state.pagination = {
            page: action.payload.meta.page,
            limit: action.payload.meta.limit,
            total: action.payload.meta.total,
            totalPages: action.payload.meta.totalPages,
          };
          state.error = null;
        }
      )
      .addCase(fetchStudentDelegations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(getStudentDelegationById.pending, (state) => {
        state.isLoadingDelegation = true;
        state.error = null;
      })
      .addCase(getStudentDelegationById.fulfilled, (state, action) => {
        state.isLoadingDelegation = false;
        state.selectedDelegation = action.payload;
        state.error = null;
      })
      .addCase(getStudentDelegationById.rejected, (state, action) => {
        state.isLoadingDelegation = false;
        state.selectedDelegation = null;
        state.error = action.payload as string;
      });

    builder
      .addCase(createStudentDelegation.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createStudentDelegation.fulfilled, (state) => {
        state.isCreating = false;
        state.error = null;
      })
      .addCase(createStudentDelegation.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateStudentDelegation.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateStudentDelegation.fulfilled, (state) => {
        state.isUpdating = false;
        state.error = null;
      })
      .addCase(updateStudentDelegation.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(deleteStudentDelegation.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteStudentDelegation.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.delegations = state.delegations.filter((d) => d.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteStudentDelegation.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

// ============================================================================
// Exports
// ============================================================================

export const { setPagination, setSelectedDelegation, clearError } = studentDelegationSlice.actions;

export default studentDelegationSlice.reducer;
