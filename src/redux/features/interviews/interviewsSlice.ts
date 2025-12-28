import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
  type ActionReducerMapBuilder,
} from '@reduxjs/toolkit';
import { getErrorMessage } from '@/lib/http';
import { interviewApiService } from '@/services/api/interviews/interviews.service';
import type {
  Interview,
  InterviewQueryParams,
  CreateInterviewRequest,
  UpdateInterviewRequest,
} from '@/services/api/types/interviews.types';
import type { ApiResponseModel } from '@/services/api';

// ============================================================================
// Types
// ============================================================================

export interface InterviewFilters {
  teacherId?: string;
  supervisorId?: string;
  jobAdvertisementId?: string;
  teacherName?: string;
  supervisorName?: string;
  month?: number;
  year?: number;
  date?: string;
}

export interface InterviewsState {
  interviews: Interview[];
  currentInterview: Interview | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: InterviewFilters;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  validationErrors: Record<string, string> | null;
  selectedInterviewIds: string[];
  isInitialized: boolean;
}

export interface FetchInterviewsPayload {
  page?: number;
  limit?: number;
  filters?: InterviewFilters;
}

export interface FetchInterviewsResponse {
  data: Interview[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const initialState: InterviewsState = {
  interviews: [],
  currentInterview: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {},
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  validationErrors: null,
  selectedInterviewIds: [],
  isInitialized: false,
};

export const fetchInterviews = createAsyncThunk<
  FetchInterviewsResponse,
  FetchInterviewsPayload | void
>('interviews/fetchInterviews', async (payload, { rejectWithValue }) => {
  try {
    const params: InterviewQueryParams = {};

    if (payload) {
      if (payload.page !== undefined) params.PageIndex = payload.page;
      if (payload.limit !== undefined) params.PageSize = payload.limit;

      if (payload.filters) {
        const {
          teacherId,
          supervisorId,
          jobAdvertisementId,
          teacherName,
          supervisorName,
          month,
          year,
          date,
        } = payload.filters;

        if (teacherId) params.teacherId = teacherId;
        if (supervisorId) params.supervisorId = supervisorId;
        if (jobAdvertisementId) params.jobAdvertisementId = jobAdvertisementId;
        if (teacherName) params.TeacherName = teacherName;
        if (supervisorName) params.SupervisorName = supervisorName;
        if (month !== undefined) params.Month = month;
        if (year !== undefined) params.Year = year;
        if (date) params.Date = date;
      }
    }

    const response = await interviewApiService.getInterviews(params);

    if (!response?.isSuccess || !response.data) {
      return {
        data: [],
        meta: {
          total: 0,
          page: params.PageIndex || 1,
          limit: params.PageSize || 10,
          totalPages: 0,
        },
      };
    }

    return {
      data: response.data.interviewDto || [],
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

export const fetchInterviewById = createAsyncThunk<Interview, string>(
  'interviews/fetchInterviewById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await interviewApiService.getInterviewById(id);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createInterview = createAsyncThunk<
  ApiResponseModel<null>,
  CreateInterviewRequest | FormData
>('interviews/createInterview', async (payload, { rejectWithValue }) => {
  try {
    const response = await interviewApiService.createInterview(payload);
    return response;
  } catch (error: any) {
    if (error.isValidationError && error.validationErrors) {
      return rejectWithValue({ validationErrors: error.validationErrors });
    }
    return rejectWithValue(getErrorMessage(error));
  }
});

export const editInterview = createAsyncThunk<
  ApiResponseModel<null>,
  { id: string; data: UpdateInterviewRequest | FormData }
>('interviews/editInterview', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await interviewApiService.updateInterview(id, data);
    return response;
  } catch (error: any) {
    if (error.isValidationError && error.validationErrors) {
      return rejectWithValue({ validationErrors: error.validationErrors });
    }
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteInterview = createAsyncThunk<string, string>(
  'interviews/deleteInterview',
  async (id, { rejectWithValue }) => {
    try {
      await interviewApiService.deleteInterview(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const interviewsSlice = createSlice({
  name: 'interviews',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<InterviewFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setCurrentInterview: (state, action: PayloadAction<Interview | null>) => {
      state.currentInterview = action.payload;
    },
    clearError: (state) => {
      state.error = null;
      state.validationErrors = null;
    },
    selectInterview: (state, action: PayloadAction<string>) => {
      if (!state.selectedInterviewIds.includes(action.payload)) {
        state.selectedInterviewIds.push(action.payload);
      }
    },
    deselectInterview: (state, action: PayloadAction<string>) => {
      state.selectedInterviewIds = state.selectedInterviewIds.filter((id) => id !== action.payload);
    },
    selectAllInterviews: (state) => {
      state.selectedInterviewIds = state.interviews.map((interview) => interview.id);
    },
    clearSelection: (state) => {
      state.selectedInterviewIds = [];
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<InterviewsState>) => {
    builder
      .addCase(fetchInterviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInterviews.fulfilled, (state, action: PayloadAction<FetchInterviewsResponse>) => {
        state.isLoading = false;
        state.interviews = action.payload.data;
        state.pagination = {
          page: action.payload.meta.page,
          limit: action.payload.meta.limit,
          total: action.payload.meta.total,
          totalPages: action.payload.meta.totalPages,
        };
        state.isInitialized = true;
      })
      .addCase(fetchInterviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchInterviewById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInterviewById.fulfilled, (state, action: PayloadAction<Interview>) => {
        state.isLoading = false;
        state.currentInterview = action.payload;
      })
      .addCase(fetchInterviewById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createInterview.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(createInterview.fulfilled, (state, action: PayloadAction<ApiResponseModel<null>>) => {
        state.isCreating = false;
        const { isSuccess, validationErrors } = action.payload;
        if (!isSuccess && validationErrors) {
          state.validationErrors = validationErrors as any;
        }
      })
      .addCase(createInterview.rejected, (state, action) => {
        state.isCreating = false;
        const payload = action.payload as any;
        if (payload?.validationErrors) {
          state.validationErrors = payload.validationErrors;
        } else {
          state.error = payload as string;
        }
      })
      .addCase(editInterview.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(editInterview.fulfilled, (state, action: PayloadAction<ApiResponseModel<null>>) => {
        state.isUpdating = false;
        const { isSuccess, validationErrors } = action.payload;
        if (!isSuccess && validationErrors) {
          state.validationErrors = validationErrors as any;
        }
      })
      .addCase(editInterview.rejected, (state, action) => {
        state.isUpdating = false;
        const payload = action.payload as any;
        if (payload?.validationErrors) {
          state.validationErrors = payload.validationErrors;
        } else {
          state.error = payload as string;
        }
      })
      .addCase(deleteInterview.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteInterview.fulfilled, (state, action: PayloadAction<string>) => {
        state.isDeleting = false;
        state.interviews = state.interviews.filter((interview) => interview.id !== action.payload);
        state.selectedInterviewIds = state.selectedInterviewIds.filter((id) => id !== action.payload);
      })
      .addCase(deleteInterview.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setCurrentInterview,
  clearError,
  selectInterview,
  deselectInterview,
  selectAllInterviews,
  clearSelection,
} = interviewsSlice.actions;

export default interviewsSlice.reducer;
