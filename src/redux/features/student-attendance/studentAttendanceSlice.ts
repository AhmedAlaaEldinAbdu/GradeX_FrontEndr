import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { studentAttendanceApiService } from '@/services/api/student-attendance/student-attendance.service';
import type { StudentAttendanceDto } from '@/types/studentAttendance';
import { getErrorMessage } from '@/lib/http';

// Use the same static branch ID as teacher attendance
export const STATIC_SCHOOL_BRANCH_ID = '471d89c1-61a8-4b13-d682-08de1657abad';

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
};

export interface FetchStudentAttendancePayload {
  schoolBranchId?: string;
  page?: number;
  limit?: number;
  search?: string;
  lkSchoolStageId?: string;
  classroomId?: string;
  status?: number;
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

export const fetchStudentAttendance = createAsyncThunk<
  FetchStudentAttendanceResponse,
  FetchStudentAttendancePayload | undefined,
  { rejectValue: string }
>('studentAttendance/fetchStudentAttendance', async (payload, { rejectWithValue }) => {
  try {
    const response = await studentAttendanceApiService.getStudentAttendanceByBranch({
      SchoolBrancheId: payload?.schoolBranchId || STATIC_SCHOOL_BRANCH_ID,
      PageIndex: payload?.page || 1,
      PageSize: payload?.limit || 10,
      Search: payload?.search,
      LKSchoolStageId: payload?.lkSchoolStageId,
      ClassroomId: payload?.classroomId,
      Status: payload?.status,
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

const studentAttendanceSlice = createSlice({
  name: 'studentAttendance',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
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
  },
});

export default studentAttendanceSlice.reducer;
