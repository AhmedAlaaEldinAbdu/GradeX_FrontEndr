import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
  type ActionReducerMapBuilder,
} from '@reduxjs/toolkit';
import { getErrorMessage } from '@/lib/http';
import { jobAdvertismentApiService } from '@/services/api/job-advertisments/job-advertisments.service';
import type {
  JobAdvertisment,
  JobAdvertismentQueryParams,
  CreateJobAdvertismentRequest,
  UpdateJobAdvertismentRequest,
  JobAdvertismentWorkShedule,
} from '@/services/api/types/job-advertisment.types';
import type { ApiResponseModel } from '@/services/api';

// ==========================================================================
// Types
// ==========================================================================

export interface JobAdvertismentFilters {
  schoolBranchId?: string;
  lkCountryId?: string;
  lkSchoolStageId?: string;
  materialId?: string;
  workShedule?: JobAdvertismentWorkShedule;
  searchName?: string;
  isActive?: boolean;
}

export interface JobAdvertismentsState {
  jobAdvertisments: JobAdvertisment[];
  currentJobAdvertisment: JobAdvertisment | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: JobAdvertismentFilters;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  validationErrors: Record<string, string> | null;
  selectedJobAdvertismentIds: string[];
  isInitialized: boolean;
}

export interface FetchJobAdvertismentsPayload {
  page?: number;
  limit?: number;
  filters?: JobAdvertismentFilters;
}

export interface FetchJobAdvertismentsResponse {
  data: JobAdvertisment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const initialState: JobAdvertismentsState = {
  jobAdvertisments: [],
  currentJobAdvertisment: null,
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
  selectedJobAdvertismentIds: [],
  isInitialized: false,
};

export const fetchJobAdvertisments = createAsyncThunk<
  FetchJobAdvertismentsResponse,
  FetchJobAdvertismentsPayload | void
>('jobAdvertisments/fetchJobAdvertisments', async (payload, { rejectWithValue }) => {
  try {
    const params: JobAdvertismentQueryParams = {};

    if (payload) {
      if (payload.page !== undefined) params.PageIndex = payload.page;
      if (payload.limit !== undefined) params.PageSize = payload.limit;

      if (payload.filters) {
        const {
          schoolBranchId,
          lkCountryId,
          lkSchoolStageId,
          materialId,
          workShedule,
          searchName,
          isActive,
        } = payload.filters;

        if (schoolBranchId) params.SchoolBranchId = schoolBranchId;
        if (lkCountryId) params.LKCountryId = lkCountryId;
        if (lkSchoolStageId) params.LKSchoolStageId = lkSchoolStageId;
        if (materialId) params.MaterialId = materialId;
        if (workShedule !== undefined) params.WorkShedule = workShedule;
        if (searchName) params.SearchName = searchName;
        if (isActive !== undefined) params.IsActive = isActive;
      }
    }

    const response = await jobAdvertismentApiService.getJobAdvertisments(params);

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
      data: response.data.jobAdvertismentDto || [],
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

export const fetchJobAdvertismentById = createAsyncThunk<JobAdvertisment, string>(
  'jobAdvertisments/fetchJobAdvertismentById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await jobAdvertismentApiService.getJobAdvertismentById(id);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createJobAdvertisment = createAsyncThunk<
  ApiResponseModel<null>,
  CreateJobAdvertismentRequest
>('jobAdvertisments/createJobAdvertisment', async (payload, { rejectWithValue }) => {
  try {
    const response = await jobAdvertismentApiService.createJobAdvertisment(payload);
    return response;
  } catch (error: any) {
    if (error.isValidationError && error.validationErrors) {
      return rejectWithValue({ validationErrors: error.validationErrors });
    }
    return rejectWithValue(getErrorMessage(error));
  }
});

export const editJobAdvertisment = createAsyncThunk<
  ApiResponseModel<null>,
  { id: string; data: UpdateJobAdvertismentRequest }
>('jobAdvertisments/editJobAdvertisment', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await jobAdvertismentApiService.updateJobAdvertisment(id, data);
    return response;
  } catch (error: any) {
    if (error.isValidationError && error.validationErrors) {
      return rejectWithValue({ validationErrors: error.validationErrors });
    }
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteJobAdvertisment = createAsyncThunk<string, string>(
  'jobAdvertisments/deleteJobAdvertisment',
  async (id, { rejectWithValue }) => {
    try {
      await jobAdvertismentApiService.deleteJobAdvertisment(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const jobAdvertismentsSlice = createSlice({
  name: 'jobAdvertisments',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<JobAdvertismentFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setCurrentJobAdvertisment: (state, action: PayloadAction<JobAdvertisment | null>) => {
      state.currentJobAdvertisment = action.payload;
    },
    clearError: (state) => {
      state.error = null;
      state.validationErrors = null;
    },
    selectJobAdvertisment: (state, action: PayloadAction<string>) => {
      if (!state.selectedJobAdvertismentIds.includes(action.payload)) {
        state.selectedJobAdvertismentIds.push(action.payload);
      }
    },
    deselectJobAdvertisment: (state, action: PayloadAction<string>) => {
      state.selectedJobAdvertismentIds = state.selectedJobAdvertismentIds.filter(
        (id) => id !== action.payload
      );
    },
    selectAllJobAdvertisments: (state) => {
      state.selectedJobAdvertismentIds = state.jobAdvertisments.map((item) => item.id);
    },
    clearSelection: (state) => {
      state.selectedJobAdvertismentIds = [];
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<JobAdvertismentsState>) => {
    builder
      .addCase(fetchJobAdvertisments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchJobAdvertisments.fulfilled,
        (state, action: PayloadAction<FetchJobAdvertismentsResponse>) => {
          state.isLoading = false;
          state.jobAdvertisments = action.payload.data;
          state.pagination = {
            page: action.payload.meta.page,
            limit: action.payload.meta.limit,
            total: action.payload.meta.total,
            totalPages: action.payload.meta.totalPages,
          };
          state.isInitialized = true;
        }
      )
      .addCase(fetchJobAdvertisments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchJobAdvertismentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchJobAdvertismentById.fulfilled,
        (state, action: PayloadAction<JobAdvertisment>) => {
          state.isLoading = false;
          state.currentJobAdvertisment = action.payload;
        }
      )
      .addCase(fetchJobAdvertismentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createJobAdvertisment.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(
        createJobAdvertisment.fulfilled,
        (state, action: PayloadAction<ApiResponseModel<null>>) => {
          state.isCreating = false;
          const { isSuccess, validationErrors } = action.payload;
          if (!isSuccess && validationErrors) {
            state.validationErrors = validationErrors as any;
          }
        }
      )
      .addCase(createJobAdvertisment.rejected, (state, action) => {
        state.isCreating = false;
        const payload = action.payload as any;
        if (payload?.validationErrors) {
          state.validationErrors = payload.validationErrors;
        } else {
          state.error = payload as string;
        }
      })
      .addCase(editJobAdvertisment.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(
        editJobAdvertisment.fulfilled,
        (state, action: PayloadAction<ApiResponseModel<null>>) => {
          state.isUpdating = false;
          const { isSuccess, validationErrors } = action.payload;
          if (!isSuccess && validationErrors) {
            state.validationErrors = validationErrors as any;
          }
        }
      )
      .addCase(editJobAdvertisment.rejected, (state, action) => {
        state.isUpdating = false;
        const payload = action.payload as any;
        if (payload?.validationErrors) {
          state.validationErrors = payload.validationErrors;
        } else {
          state.error = payload as string;
        }
      })
      .addCase(deleteJobAdvertisment.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteJobAdvertisment.fulfilled, (state, action: PayloadAction<string>) => {
        state.isDeleting = false;
        state.jobAdvertisments = state.jobAdvertisments.filter(
          (item) => item.id !== action.payload
        );
        state.selectedJobAdvertismentIds = state.selectedJobAdvertismentIds.filter(
          (id) => id !== action.payload
        );
      })
      .addCase(deleteJobAdvertisment.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setCurrentJobAdvertisment,
  clearError,
  selectJobAdvertisment,
  deselectJobAdvertisment,
  selectAllJobAdvertisments,
  clearSelection,
} = jobAdvertismentsSlice.actions;

export default jobAdvertismentsSlice.reducer;
