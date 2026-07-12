import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { getErrorMessage } from '@/lib/http';
import { studentRequestEarlyLeaveApiService } from '@/services/api/requests/student-request-early-leave.service';
import { EarlyLeaveStatus } from '@/services/api/requests/requests.types';
import type {
  EarlyLeaveRequestDto,
  EarlyLeaveStatusCount,
  StudentEarlyLeaveRequestsListResponse,
  StudentEarlyLeaveRequestsQueryParams,
  UpdateStudentEarlyLeaveRequest,
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
  stats: {
    totalRequests: number;
    statusCounts: EarlyLeaveStatusCount[];
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
  stats: {
    totalRequests: 0,
    statusCounts: [],
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

export const approveStudentEarlyLeaveRequest = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('studentRequestEarlyLeave/approve', async (id, { rejectWithValue }) => {
  try {
    await studentRequestEarlyLeaveApiService.approveStudentEarlyLeaveRequest(id);
    return id;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteStudentEarlyLeaveRequest = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('studentRequestEarlyLeave/delete', async (id, { rejectWithValue }) => {
  try {
    await studentRequestEarlyLeaveApiService.deleteStudentEarlyLeaveRequest(id);
    return id;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateStudentEarlyLeaveRequest = createAsyncThunk<
  EarlyLeaveRequestDto,
  UpdateStudentEarlyLeaveRequest,
  { rejectValue: string }
>('studentRequestEarlyLeave/update', async (data, { rejectWithValue }) => {
  try {
    await studentRequestEarlyLeaveApiService.updateStudentEarlyLeaveRequest(data);
    return await studentRequestEarlyLeaveApiService.getStudentEarlyLeaveRequestById(data.Id);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const updateStatusCount = (
  statusCounts: EarlyLeaveStatusCount[],
  status: EarlyLeaveStatus,
  delta: number
) => {
  const existingStatusCount = statusCounts.find((item) => item.status === status);

  if (existingStatusCount) {
    existingStatusCount.count = Math.max(0, existingStatusCount.count + delta);
    return;
  }

  if (delta > 0) {
    statusCounts.push({ status, count: delta });
  }
};

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
          state.stats = {
            totalRequests: action.payload.totalRequests,
            statusCounts: action.payload.statusCounts,
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
      .addCase(approveStudentEarlyLeaveRequest.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(
        approveStudentEarlyLeaveRequest.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isUpdating = false;
          const id = action.payload;
          const previousRequest = state.requests.find((request) => request.id === id);

          if (previousRequest && previousRequest.status !== EarlyLeaveStatus.Approved) {
            updateStatusCount(state.stats.statusCounts, previousRequest.status, -1);
            updateStatusCount(state.stats.statusCounts, EarlyLeaveStatus.Approved, 1);
          }

          state.requests = state.requests.map((request) =>
            request.id === id ? { ...request, status: EarlyLeaveStatus.Approved } : request
          );
          if (state.currentRequest?.id === id) {
            state.currentRequest = {
              ...state.currentRequest,
              status: EarlyLeaveStatus.Approved,
            };
          }
        }
      )
      .addCase(approveStudentEarlyLeaveRequest.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload ?? action.error.message ?? null;
      })
      .addCase(deleteStudentEarlyLeaveRequest.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(deleteStudentEarlyLeaveRequest.fulfilled, (state, action: PayloadAction<string>) => {
        state.isUpdating = false;
        const id = action.payload;
        const removedRequest = state.requests.find((request) => request.id === id);

        if (removedRequest) {
          updateStatusCount(state.stats.statusCounts, removedRequest.status, -1);
          state.stats.totalRequests = Math.max(0, state.stats.totalRequests - 1);
        }

        state.requests = state.requests.filter((request) => request.id !== id);
        if (state.currentRequest?.id === id) {
          state.currentRequest = null;
        }
        state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1);
      })
      .addCase(deleteStudentEarlyLeaveRequest.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload ?? action.error.message ?? null;
      })
      .addCase(updateStudentEarlyLeaveRequest.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(
        updateStudentEarlyLeaveRequest.fulfilled,
        (state, action: PayloadAction<EarlyLeaveRequestDto>) => {
          state.isUpdating = false;
          const updatedRequest = action.payload;
          const previousRequest = state.requests.find(
            (request) => request.id === updatedRequest.id
          );

          if (previousRequest && previousRequest.status !== updatedRequest.status) {
            updateStatusCount(state.stats.statusCounts, previousRequest.status, -1);
            updateStatusCount(state.stats.statusCounts, updatedRequest.status, 1);
          }

          state.requests = state.requests.map((request) =>
            request.id === updatedRequest.id
              ? {
                  ...request,
                  ...updatedRequest,
                  studentName:
                    updatedRequest.studentName !== '-'
                      ? updatedRequest.studentName
                      : request.studentName,
                  stage: updatedRequest.stage !== '-' ? updatedRequest.stage : request.stage,
                  classroom:
                    updatedRequest.classroom !== '-' ? updatedRequest.classroom : request.classroom,
                }
              : request
          );

          state.currentRequest = updatedRequest;
        }
      )
      .addCase(updateStudentEarlyLeaveRequest.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload ?? action.error.message ?? null;
      });
  },
});

export const { clearCurrentStudentEarlyLeaveRequest, clearStudentEarlyLeaveError } =
  studentRequestEarlyLeaveSlice.actions;

export default studentRequestEarlyLeaveSlice.reducer;
