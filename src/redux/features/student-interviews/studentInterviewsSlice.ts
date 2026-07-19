import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
  type ActionReducerMapBuilder,
} from '@reduxjs/toolkit';
import { getErrorMessage } from '@/lib/http';
import { studentInterviewsApiService } from '@/services/api/student-interviews/student-interviews.service';
import type {
  StudentInterview,
  StudentInterviewQueryParams,
  CreateStudentInterviewRequest,
  UpdateStudentInterviewRequest,
} from '@/services/api/types/student-interviews.types';
import type { ApiResponseModel } from '@/services/api';

// ============================================================================
// Types
// ============================================================================

export interface StudentInterviewFilters {
  search?: string;
  studentName?: string;
  studentId?: string;
  supervisorId?: string;
  schoolBranchId?: string;
  GradeId?: string;
  date?: string;
  month?: number;
  year?: number;
}

export interface StudentInterviewsState {
  studentInterviews: StudentInterview[];
  popupStudentInterviews: StudentInterview[];
  currentStudentInterview: StudentInterview | null;
  pagination: {
    pageIndex: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  filters: StudentInterviewFilters;
  isLoading: boolean;
  popupIsLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  validationErrors: Record<string, string> | null;
  selectedStudentInterviewIds: string[];
  isInitialized: boolean;
}

export interface FetchStudentInterviewsPayload {
  page?: number;
  limit?: number;
  filters?: StudentInterviewFilters;
  target?: 'list' | 'popup';
}

export interface FetchStudentInterviewsResponse {
  data: StudentInterview[];
  meta: {
    totalItems: number;
    pageIndex: number;
    pageSize: number;
    totalPages: number;
  };
}

const initialState: StudentInterviewsState = {
  studentInterviews: [],
  popupStudentInterviews: [],
  currentStudentInterview: null,
  pagination: {
    pageIndex: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  },
  filters: {},
  isLoading: false,
  popupIsLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  validationErrors: null,
  selectedStudentInterviewIds: [],
  isInitialized: false,
};

export const fetchStudentInterviews = createAsyncThunk<
  FetchStudentInterviewsResponse,
  FetchStudentInterviewsPayload | void
>('studentInterviews/fetchStudentInterviews', async (payload, { rejectWithValue }) => {
  try {
    const params: StudentInterviewQueryParams = {};

    if (payload) {
      if (payload.page !== undefined) params.PageIndex = payload.page;
      if (payload.limit !== undefined) params.PageSize = payload.limit;

      if (payload.filters) {
        const {
          search,
          studentName,
          studentId,
          supervisorId,
          schoolBranchId,
          GradeId,
          date,
          month,
          year,
        } = payload.filters;

        if (search) params.Search = search;
        if (studentName) params.StudentName = studentName;
        if (studentId) params.StudentId = studentId;
        if (supervisorId) params.SupervisorId = supervisorId;
        if (schoolBranchId) params.schoolBranchId = schoolBranchId;
        if (GradeId) params.GradeId = GradeId;
        if (date) params.Date = date;
        if (month !== undefined) params.Month = month;
        if (year !== undefined) params.Year = year;
      }
    }

    const response = await studentInterviewsApiService.getStudentInterviews(params);

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
      data: response.data.studentInterviewDto || [],
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

export const fetchStudentInterviewById = createAsyncThunk<StudentInterview, string>(
  'studentInterviews/fetchStudentInterviewById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await studentInterviewsApiService.getStudentInterviewById(id);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createStudentInterview = createAsyncThunk<
  ApiResponseModel<null>,
  CreateStudentInterviewRequest | FormData
>('studentInterviews/createStudentInterview', async (payload, { rejectWithValue }) => {
  try {
    const response = await studentInterviewsApiService.createStudentInterview(payload);
    return response;
  } catch (error: any) {
    if (error.isValidationError && error.validationErrors) {
      return rejectWithValue({ validationErrors: error.validationErrors });
    }
    return rejectWithValue(getErrorMessage(error));
  }
});

export const editStudentInterview = createAsyncThunk<
  ApiResponseModel<null>,
  { id: string; data: UpdateStudentInterviewRequest | FormData }
>('studentInterviews/editStudentInterview', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await studentInterviewsApiService.updateStudentInterview(id, data);
    return response;
  } catch (error: any) {
    if (error.isValidationError && error.validationErrors) {
      return rejectWithValue({ validationErrors: error.validationErrors });
    }
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteStudentInterview = createAsyncThunk<string, string>(
  'studentInterviews/deleteStudentInterview',
  async (id, { rejectWithValue }) => {
    try {
      await studentInterviewsApiService.deleteStudentInterview(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const studentInterviewsSlice = createSlice({
  name: 'studentInterviews',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<StudentInterviewFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setCurrentStudentInterview: (state, action: PayloadAction<StudentInterview | null>) => {
      state.currentStudentInterview = action.payload;
    },
    clearError: (state) => {
      state.error = null;
      state.validationErrors = null;
    },
    selectStudentInterview: (state, action: PayloadAction<string>) => {
      if (!state.selectedStudentInterviewIds.includes(action.payload)) {
        state.selectedStudentInterviewIds.push(action.payload);
      }
    },
    deselectStudentInterview: (state, action: PayloadAction<string>) => {
      state.selectedStudentInterviewIds = state.selectedStudentInterviewIds.filter(
        (id) => id !== action.payload
      );
    },
    selectAllStudentInterviews: (state) => {
      state.selectedStudentInterviewIds = state.studentInterviews.map((x) => x.id);
    },
    clearSelection: (state) => {
      state.selectedStudentInterviewIds = [];
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<StudentInterviewsState>) => {
    builder
      .addCase(fetchStudentInterviews.pending, (state, action) => {
        const target = action.meta.arg?.target === 'popup' ? 'popup' : 'list';
        state.error = null;
        if (target === 'popup') {
          state.popupIsLoading = true;
        } else {
          state.isLoading = true;
        }
      })
      .addCase(
        fetchStudentInterviews.fulfilled,
        (state, action: PayloadAction<FetchStudentInterviewsResponse>) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const requestedTarget = (action as any).meta?.arg?.target;
          const resolvedTarget = requestedTarget === 'popup' ? 'popup' : 'list';

          if (resolvedTarget === 'popup') {
            state.popupIsLoading = false;
            state.popupStudentInterviews = action.payload.data;
          } else {
            state.isLoading = false;
            state.studentInterviews = action.payload.data;
            state.pagination = {
              pageIndex: action.payload.meta.pageIndex,
              pageSize: action.payload.meta.pageSize,
              totalItems: action.payload.meta.totalItems,
              totalPages: action.payload.meta.totalPages,
            };
            state.isInitialized = true;
          }
        }
      )
      .addCase(fetchStudentInterviews.rejected, (state, action) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const requestedTarget = (action as any).meta?.arg?.target;
        const resolvedTarget = requestedTarget === 'popup' ? 'popup' : 'list';

        if (resolvedTarget === 'popup') {
          state.popupIsLoading = false;
        } else {
          state.isLoading = false;
        }
        state.error = action.payload as string;
      })

      .addCase(fetchStudentInterviewById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchStudentInterviewById.fulfilled,
        (state, action: PayloadAction<StudentInterview>) => {
          state.isLoading = false;
          state.currentStudentInterview = action.payload;
        }
      )
      .addCase(fetchStudentInterviewById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(createStudentInterview.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(
        createStudentInterview.fulfilled,
        (state, action: PayloadAction<ApiResponseModel<null>>) => {
          state.isCreating = false;
          const { isSuccess, validationErrors } = action.payload;
          if (!isSuccess && validationErrors) {
            state.validationErrors = validationErrors as unknown as Record<string, string>;
          }
        }
      )
      .addCase(createStudentInterview.rejected, (state, action) => {
        state.isCreating = false;
        const payload = action.payload as any;
        if (payload?.validationErrors) {
          state.validationErrors = payload.validationErrors;
          state.error = 'Validation failed';
        } else {
          state.error = action.payload as string;
        }
      })

      .addCase(editStudentInterview.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(
        editStudentInterview.fulfilled,
        (state, action: PayloadAction<ApiResponseModel<null>>) => {
          state.isUpdating = false;
          const { isSuccess, validationErrors } = action.payload;
          if (!isSuccess && validationErrors) {
            state.validationErrors = validationErrors as unknown as Record<string, string>;
          }
        }
      )
      .addCase(editStudentInterview.rejected, (state, action) => {
        state.isUpdating = false;
        const payload = action.payload as any;
        if (payload?.validationErrors) {
          state.validationErrors = payload.validationErrors;
          state.error = 'Validation failed';
        } else {
          state.error = action.payload as string;
        }
      })

      .addCase(deleteStudentInterview.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteStudentInterview.fulfilled, (state, action: PayloadAction<string>) => {
        state.isDeleting = false;
        state.studentInterviews = state.studentInterviews.filter((x) => x.id !== action.payload);
        state.selectedStudentInterviewIds = state.selectedStudentInterviewIds.filter(
          (id) => id !== action.payload
        );
      })
      .addCase(deleteStudentInterview.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setCurrentStudentInterview,
  clearError,
  selectStudentInterview,
  deselectStudentInterview,
  selectAllStudentInterviews,
  clearSelection,
} = studentInterviewsSlice.actions;

export default studentInterviewsSlice.reducer;
