import {
  createSlice,
  type PayloadAction,
  type ActionReducerMapBuilder,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { studentAttendanceApiService } from '@/services/api/student-attendance/student-attendance.service';
import type {
  StudentAttendanceDto,
  StudentBulkAttendanceRequest,
  StudentAttendanceByStudentDto,
} from '@/types/studentAttendance';
import { getErrorMessage } from '@/lib/http';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';

// ============================================================================
// Types
// ============================================================================

interface StudentAttendanceByStudentState {
  attendances: StudentAttendanceByStudentDto[];
  summary: {
    totalAttendance: number;
    totalAbsence: number;
    totalLate: number;
  };
  pagination: {
    pageIndex: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
}

interface StudentAttendanceState {
  attendances: StudentAttendanceDto[];
  pagination: {
    pageIndex: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
  selectedAttendanceIds: string[];
  byStudent: StudentAttendanceByStudentState;
}

const initialState: StudentAttendanceState = {
  attendances: [],
  pagination: {
    pageIndex: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  },
  isLoading: false,
  error: null,
  selectedAttendanceIds: [],
  byStudent: {
    attendances: [],
    summary: {
      totalAttendance: 0,
      totalAbsence: 0,
      totalLate: 0,
    },
    pagination: {
      pageIndex: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 0,
    },
    isLoading: false,
    error: null,
  },
};

export interface FetchStudentAttendancePayload {
  schoolBranchId?: string;
  page?: number;
  limit?: number;
  search?: string;
  lkSchoolStageId?: string;
  classroomId?: string;
  status?: number;
  date?: string;
}

export interface FetchStudentAttendanceResponse {
  data: StudentAttendanceDto[];
  meta: {
    totalItems: number;
    pageIndex: number;
    pageSize: number;
    totalPages: number;
  };
}

// ============================================================================
// Async Thunks
// ============================================================================

export const fetchStudentAttendance = createAsyncThunk<
  FetchStudentAttendanceResponse,
  FetchStudentAttendancePayload | undefined,
  { rejectValue: string }
>('studentAttendance/fetchStudentAttendance', async (payload, { rejectWithValue }) => {
  try {
    const schoolBranchId = payload?.schoolBranchId || getCurrentSchoolBranchId();

    if (!schoolBranchId) {
      return rejectWithValue('School branch ID is missing');
    }

    const response = await studentAttendanceApiService.getStudentAttendanceByBranch({
      SchoolBrancheId: schoolBranchId,
      PageIndex: payload?.page || 1,
      PageSize: payload?.limit || 10,
      Search: payload?.search,
      LKSchoolStageId: payload?.lkSchoolStageId,
      ClassroomId: payload?.classroomId,
      Status: payload?.status,
      Date: payload?.date,
    });

    if (!response?.isSuccess || !response.data) {
      return {
        data: [],
        meta: {
          totalItems: 0,
          pageIndex: 1,
          pageSize: 10,
          totalPages: 0,
        },
      };
    }

    return {
      data: response.data.studentsAttends || [],
      meta: {
        totalItems: response.data.totalItems || 0,
        pageIndex: response.data.pageIndex || 1,
        pageSize: response.data.pageSize || 10,
        totalPages: response.data.totalPages || 0,
      },
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export interface FetchStudentAttendanceByStudentPayload {
  studentId: string;
  page?: number;
  limit?: number;
  status?: number;
  date?: string;
}

export interface FetchStudentAttendanceByStudentResponse {
  data: StudentAttendanceByStudentDto[];
  summary: {
    totalAttendance: number;
    totalAbsence: number;
    totalLate: number;
  };
  meta: {
    totalItems: number;
    pageIndex: number;
    pageSize: number;
    totalPages: number;
  };
}

export const fetchStudentAttendanceByStudent = createAsyncThunk<
  FetchStudentAttendanceByStudentResponse,
  FetchStudentAttendanceByStudentPayload,
  { rejectValue: string }
>('studentAttendance/fetchStudentAttendanceByStudent', async (payload, { rejectWithValue }) => {
  try {
    if (!payload?.studentId) {
      return rejectWithValue('Student ID is required');
    }

    const response = await studentAttendanceApiService.getStudentAttendanceByStudent({
      StudentId: payload.studentId,
      PageIndex: payload?.page || 1,
      PageSize: payload?.limit || 10,
      Status: payload?.status,
      Date: payload?.date,
    });

    return {
      data: response?.attendances || [],
      summary: {
        totalAttendance: response?.totalAttendance || 0,
        totalAbsence: response?.totalAbsence || 0,
        totalLate: response?.totalLate || 0,
      },
      meta: {
        totalItems: response?.totalItems || 0,
        pageIndex: response?.pageIndex || 1,
        pageSize: response?.pageSize || 10,
        totalPages: response?.totalPages || 0,
      },
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const bulkCreateStudentAttendance = createAsyncThunk<void, StudentBulkAttendanceRequest>(
  'studentAttendance/bulkCreateStudentAttendance',
  async (payload, { rejectWithValue }) => {
    try {
      await studentAttendanceApiService.bulkCreateStudentAttendance(payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// ============================================================================
// Slice
// ============================================================================

const studentAttendanceSlice = createSlice({
  name: 'studentAttendance',
  initialState,
  reducers: {
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
      state.selectedAttendanceIds = state.attendances.map((attendance) => attendance.studentId);
    },
    clearSelection: (state) => {
      state.selectedAttendanceIds = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<StudentAttendanceState>) => {
    // Fetch Student Attendance
    builder
      .addCase(fetchStudentAttendance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchStudentAttendance.fulfilled,
        (state, action: PayloadAction<FetchStudentAttendanceResponse>) => {
          state.isLoading = false;
          state.attendances = action.payload.data;
          state.pagination = {
            pageIndex: action.payload.meta.pageIndex,
            pageSize: action.payload.meta.pageSize,
            totalItems: action.payload.meta.totalItems,
            totalPages: action.payload.meta.totalPages,
          };
        }
      )
      .addCase(fetchStudentAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Bulk Create Student Attendance
    builder
      .addCase(bulkCreateStudentAttendance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(bulkCreateStudentAttendance.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(bulkCreateStudentAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Student Attendance By Student Id
    builder
      .addCase(fetchStudentAttendanceByStudent.pending, (state) => {
        state.byStudent.isLoading = true;
        state.byStudent.error = null;
      })
      .addCase(
        fetchStudentAttendanceByStudent.fulfilled,
        (state, action: PayloadAction<FetchStudentAttendanceByStudentResponse>) => {
          state.byStudent.isLoading = false;
          state.byStudent.attendances = action.payload.data;
          state.byStudent.summary = action.payload.summary;
          state.byStudent.pagination = {
            pageIndex: action.payload.meta.pageIndex,
            pageSize: action.payload.meta.pageSize,
            totalItems: action.payload.meta.totalItems,
            totalPages: action.payload.meta.totalPages,
          };
        }
      )
      .addCase(fetchStudentAttendanceByStudent.rejected, (state, action) => {
        state.byStudent.isLoading = false;
        state.byStudent.error = action.payload as string;
      });
  },
});

// ============================================================================
// Exports
// ============================================================================

export const {
  selectAttendance,
  deselectAttendance,
  selectAllAttendances,
  clearSelection,
  clearError,
} = studentAttendanceSlice.actions;

export default studentAttendanceSlice.reducer;
