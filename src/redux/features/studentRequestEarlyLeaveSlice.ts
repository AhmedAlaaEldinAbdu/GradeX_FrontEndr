import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { getErrorMessage } from '@/lib/http';
import { studentRequestEarlyLeaveApiService } from '@/services/api/requests/student-request-early-leave.service';
import type {
  EarlyLeaveRequestDto,
  EarlyLeaveStatus,
  StudentEarlyLeaveRequestsListResponse,
  StudentEarlyLeaveRequestsQueryParams,
  UpdateStudentEarlyLeaveStatusRequest,
} from '@/services/api/requests/requests.types';

interface StudentRequestEarlyLeaveState {
  requests: EarlyLeaveRequestDto[];
  currentRequest: EarlyLeaveRequestDto | null;
  pagination: {
    pageIndex: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  isLoading: boolean;
  isDetailsLoading: boolean;
  isUpdating: boolean;
  error: string | null;
}

const initialState: StudentRequestEarlyLeaveState = {
  requests: [],
  currentRequest: null,
  pagination: {
    pageIndex: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  },
  isLoading: false,
  isDetailsLoading: false,
  isUpdating: false,
  error: null,
};

export interface FetchStudentEarlyLeaveRequestsPayload {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: EarlyLeaveStatus;
  date?: string;
  gradeId?: string;
  classroomId?: string;
}

export const fetchStudentEarlyLeaveRequests = createAsyncThunk<
  StudentEarlyLeaveRequestsListResponse,
  FetchStudentEarlyLeaveRequestsPayload | void,
  { rejectValue: string }
>('studentRequestEarlyLeave/fetchRequests', async (payload, { rejectWithValue }) => {
  try {
    const params: StudentEarlyLeaveRequestsQueryParams = {
      PageNumber: payload?.page ?? 1,
      PageSize: payload?.limit ?? 10,
      SearchStudentName: payload?.searchTerm?.trim() || undefined,
      RequestStatus: payload?.status,
      Date: payload?.date || undefined,
      GradeId: payload?.gradeId || undefined,
      ClassroomId: payload?.classroomId || undefined,
    };

    return await studentRequestEarlyLeaveApiService.getStudentEarlyLeaveRequests(params);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchStudentEarlyLeaveRequestById = createAsyncThunk<
  EarlyLeaveRequestDto,
  string,
  { rejectValue: string }
>('studentRequestEarlyLeave/fetchById', async (id, { rejectWithValue }) => {
  try {
    return await studentRequestEarlyLeaveApiService.getStudentEarlyLeaveRequestById(id);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateStudentEarlyLeaveStatus = createAsyncThunk<
  UpdateStudentEarlyLeaveStatusRequest,
  UpdateStudentEarlyLeaveStatusRequest,
  { rejectValue: string }
>('studentRequestEarlyLeave/updateStatus', async (body, { rejectWithValue }) => {
  try {
    await studentRequestEarlyLeaveApiService.updateStudentEarlyLeaveStatus(body);
    return body;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const studentRequestEarlyLeaveSlice = createSlice({
  name: 'studentRequestEarlyLeave',
  initialState,
  reducers: {
    clearCurrentStudentEarlyLeaveRequest: (state) => {
      state.currentRequest = null;
    },
    clearStudentEarlyLeaveError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentEarlyLeaveRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchStudentEarlyLeaveRequests.fulfilled,
        (state, action: PayloadAction<StudentEarlyLeaveRequestsListResponse>) => {
          state.isLoading = false;
          state.requests = action.payload.requests;
          state.pagination = {
            pageIndex: action.payload.pageIndex,
            pageSize: action.payload.pageSize,
            totalItems: action.payload.totalItems,
            totalPages: action.payload.totalPages,
          };
        }
      )
      .addCase(fetchStudentEarlyLeaveRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? action.error.message ?? null;
      })
      .addCase(fetchStudentEarlyLeaveRequestById.pending, (state) => {
        state.isDetailsLoading = true;
        state.error = null;
      })
      .addCase(
        fetchStudentEarlyLeaveRequestById.fulfilled,
        (state, action: PayloadAction<EarlyLeaveRequestDto>) => {
          state.isDetailsLoading = false;
          state.currentRequest = action.payload;
        }
      )
      .addCase(fetchStudentEarlyLeaveRequestById.rejected, (state, action) => {
        state.isDetailsLoading = false;
        state.error = action.payload ?? action.error.message ?? null;
      })
      .addCase(updateStudentEarlyLeaveStatus.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(
        updateStudentEarlyLeaveStatus.fulfilled,
        (state, action: PayloadAction<UpdateStudentEarlyLeaveStatusRequest>) => {
          state.isUpdating = false;
          const { id, status } = action.payload;
          state.requests = state.requests.map((request) =>
            request.id === id ? { ...request, status } : request
          );
          if (state.currentRequest?.id === id) {
            state.currentRequest = { ...state.currentRequest, status };
          }
        }
      )
      .addCase(updateStudentEarlyLeaveStatus.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload ?? action.error.message ?? null;
      });
  },
});

export const { clearCurrentStudentEarlyLeaveRequest, clearStudentEarlyLeaveError } =
  studentRequestEarlyLeaveSlice.actions;

export default studentRequestEarlyLeaveSlice.reducer;
