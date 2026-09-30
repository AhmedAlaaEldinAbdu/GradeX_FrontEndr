import {
  createSlice,
  type PayloadAction,
  type ActionReducerMapBuilder,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { teacherAttendanceApiService } from '@/services/api/teacher-attendance/teacher-attendance.service';
import type {
  TeacherAttendance,
  TeacherAttendanceQueryParams,
  TeacherAttendanceFilters,
  BulkAttendanceRequest,
} from '@/types/teacherAttendance';
import { getErrorMessage } from '@/lib/http';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';

// ============================================================================
// Types
// ============================================================================

export interface TeacherAttendanceState {
  // Data
  attendances: TeacherAttendance[];
  currentAttendance: TeacherAttendance | null;

  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Filters
  filters: TeacherAttendanceFilters;

  // Loading States
  isLoading: boolean;

  // Error States
  error: string | null;

  // UI States
  selectedAttendanceIds: string[];
  isInitialized: boolean;
}

export interface FetchTeacherAttendancePayload {
  page?: number;
  limit?: number;
  filters?: TeacherAttendanceFilters;
  schoolBranchId?: string;
}

export interface FetchTeacherAttendanceResponse {
  data: TeacherAttendance[];
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

const initialState: TeacherAttendanceState = {
  // Data
  attendances: [],
  currentAttendance: null,

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

  // Error States
  error: null,

  // UI States
  selectedAttendanceIds: [],
  isInitialized: false,
};

// ============================================================================
// Async Thunks
// ============================================================================

export const fetchTeacherAttendance = createAsyncThunk<
  FetchTeacherAttendanceResponse,
  FetchTeacherAttendancePayload | void
>('teacherAttendance/fetchTeacherAttendance', async (payload, { rejectWithValue }) => {
  try {
    const schoolBranchId = payload?.schoolBranchId || getCurrentSchoolBranchId();

    if (!schoolBranchId) {
      return rejectWithValue('School branch ID is missing');
    }

    const params: TeacherAttendanceQueryParams = {
      SchoolBrancheId: schoolBranchId,
    };

    if (payload) {
      if (payload.page) params.PageIndex = payload.page;
      if (payload.limit) params.PageSize = payload.limit;

      if (payload.filters) {
        if (payload.filters.search) params.Search = payload.filters.search;
        if (payload.filters.gradeId) params.gradeId = payload.filters.gradeId;
        if (payload.filters.classroomId) params.ClassroomId = payload.filters.classroomId;
        if (payload.filters.status) params.Status = payload.filters.status;
      }
    }

    const response = await teacherAttendanceApiService.getTeacherAttendanceByBranch(params);

    if (!response?.isSuccess || !response.data) {
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
      data: response.data.teachersAttends || [],
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

export const bulkCreateAttendance = createAsyncThunk<void, BulkAttendanceRequest>(
  'teacherAttendance/bulkCreateAttendance',
  async (payload, { rejectWithValue }) => {
    try {
      await teacherAttendanceApiService.bulkCreateAttendance(payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// ============================================================================
// Slice
// ============================================================================

const teacherAttendanceSlice = createSlice({
  name: 'teacherAttendance',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<TeacherAttendanceFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setCurrentAttendance: (state, action: PayloadAction<TeacherAttendance | null>) => {
      state.currentAttendance = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    selectAttendance: (state, action: PayloadAction<string>) => {
      if (!state.selectedAttendanceIds.includes(action.payload)) {
        state.selectedAttendanceIds.push(action.payload);
      }
    },
    deselectAttendance: (state, action: PayloadAction<string>) => {
      state.selectedAttendanceIds = state.selectedAttendanceIds.filter(
        (id) => id !== action.payload
      );
    },
    selectAllAttendances: (state) => {
      state.selectedAttendanceIds = state.attendances.map((attendance) => attendance.teacherId);
    },
    clearSelection: (state) => {
      state.selectedAttendanceIds = [];
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<TeacherAttendanceState>) => {
    // Fetch Teacher Attendance
    builder
      .addCase(fetchTeacherAttendance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchTeacherAttendance.fulfilled,
        (state, action: PayloadAction<FetchTeacherAttendanceResponse>) => {
          state.isLoading = false;
          state.attendances = action.payload.data;
          state.pagination = {
            page: action.payload.meta.page,
            limit: action.payload.meta.limit,
            total: action.payload.meta.total,
            totalPages: action.payload.meta.totalPages,
          };
          state.isInitialized = true;
        }
      )
      .addCase(fetchTeacherAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Bulk Create Attendance
    builder
      .addCase(bulkCreateAttendance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(bulkCreateAttendance.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(bulkCreateAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// ============================================================================
// Exports
// ============================================================================

export const {
  setFilters,
  clearFilters,
  setCurrentAttendance,
  clearError,
  selectAttendance,
  deselectAttendance,
  selectAllAttendances,
  clearSelection,
} = teacherAttendanceSlice.actions;

export default teacherAttendanceSlice.reducer;
