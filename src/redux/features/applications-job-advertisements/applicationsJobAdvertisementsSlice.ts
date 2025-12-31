import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
  type ActionReducerMapBuilder,
} from '@reduxjs/toolkit';
import { getErrorMessage } from '@/lib/http';
import { applicationsJobAdvertisementApiService } from '@/services/api/applications-job-advertisements/applications-job-advertisements.service';
import type {
  ApplicationsJobAdvertisement,
  ApplicationsJobAdvertisementQueryParams,
  ApplicationsJobAdvertisementListResponse,
  CreateApplicationsJobAdvertisementRequest,
  UpdateApplicationStatusRequest,
} from '@/services/api/types/applications-job-advertisement.types';
import type { ApiResponseModel } from '@/services/api';

// ============================================================================
// Types
// ============================================================================

export interface ApplicationsJobAdvertisementFilters {
  jobAdvertisementId?: string;
  applicationStatus?: number;
  search?: string;
  workShedule?: number;
  nationalityId?: string;
  lkQualificationId?: string;
  experienceYears?: number;
}

export interface ApplicationsJobAdvertisementsState {
  applications: ApplicationsJobAdvertisement[];
  currentApplication: ApplicationsJobAdvertisement | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: ApplicationsJobAdvertisementFilters;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  error: string | null;
  validationErrors: Record<string, string> | null;
  isInitialized: boolean;
}

export interface FetchApplicationsJobAdvertisementsPayload {
  page?: number;
  limit?: number;
  filters?: ApplicationsJobAdvertisementFilters;
}

export interface FetchApplicationsJobAdvertisementsResponse {
  data: ApplicationsJobAdvertisement[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const initialState: ApplicationsJobAdvertisementsState = {
  applications: [],
  currentApplication: null,
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
  error: null,
  validationErrors: null,
  isInitialized: false,
};

export const fetchApplicationsJobAdvertisements = createAsyncThunk<
  FetchApplicationsJobAdvertisementsResponse,
  FetchApplicationsJobAdvertisementsPayload | void
>(
  'applicationsJobAdvertisements/fetchApplicationsJobAdvertisements',
  async (payload, { rejectWithValue }) => {
    try {
      const params: ApplicationsJobAdvertisementQueryParams = {};

      if (payload) {
        if (payload.page !== undefined) params.PageIndex = payload.page;
        if (payload.limit !== undefined) params.PageSize = payload.limit;

        if (payload.filters) {
          const {
            jobAdvertisementId,
            applicationStatus,
            search,
            workShedule,
            nationalityId,
            lkQualificationId,
            experienceYears,
          } = payload.filters;

          if (jobAdvertisementId) params.JobAdvertisementId = jobAdvertisementId;
          if (applicationStatus !== undefined) params.ApplicationStatus = applicationStatus;
          if (search) params.Search = search;
          if (workShedule !== undefined) params.WorkShedule = workShedule;
          if (nationalityId) params.NationalityId = nationalityId;
          if (lkQualificationId) params.LKQualificationId = lkQualificationId;
          if (experienceYears !== undefined) params.ExperienceYears = experienceYears;
        }
      }

      const response = await applicationsJobAdvertisementApiService.getApplicationsJobAdvertisements(
        params
      );

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

      const { applicationsJobAdvertisementDtos, totalItems, pageIndex, pageSize, totalPages } =
        response.data;

      return {
        data: applicationsJobAdvertisementDtos || [],
        meta: {
          total: totalItems || 0,
          page: pageIndex || params.PageIndex || 1,
          limit: pageSize || params.PageSize || 10,
          totalPages: totalPages || 0,
        },
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createApplicationsJobAdvertisement = createAsyncThunk<
  ApiResponseModel<null>,
  CreateApplicationsJobAdvertisementRequest
>('applicationsJobAdvertisements/createApplicationsJobAdvertisement', async (payload, { rejectWithValue }) => {
  try {
    const response = await applicationsJobAdvertisementApiService.createApplicationsJobAdvertisement(
      payload
    );
    return response;
  } catch (error: any) {
    if (error.isValidationError && error.validationErrors) {
      return rejectWithValue({ validationErrors: error.validationErrors });
    }
    return rejectWithValue(getErrorMessage(error));
  }
});

export const editApplicationsJobAdvertisementStatus = createAsyncThunk<
  ApiResponseModel<null>,
  UpdateApplicationStatusRequest
>('applicationsJobAdvertisements/editApplicationsJobAdvertisementStatus', async (payload, { rejectWithValue }) => {
  try {
    const response = await applicationsJobAdvertisementApiService.editApplicationsJobAdvertisementStatus(
      payload
    );
    return response;
  } catch (error: any) {
    if (error.isValidationError && error.validationErrors) {
      return rejectWithValue({ validationErrors: error.validationErrors });
    }
    return rejectWithValue(getErrorMessage(error));
  }
});

const applicationsJobAdvertisementsSlice = createSlice({
  name: 'applicationsJobAdvertisements',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<ApplicationsJobAdvertisementFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setCurrentApplication: (state, action: PayloadAction<ApplicationsJobAdvertisement | null>) => {
      state.currentApplication = action.payload;
    },
    clearError: (state) => {
      state.error = null;
      state.validationErrors = null;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<ApplicationsJobAdvertisementsState>) => {
    builder
      .addCase(fetchApplicationsJobAdvertisements.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchApplicationsJobAdvertisements.fulfilled,
        (state, action: PayloadAction<FetchApplicationsJobAdvertisementsResponse>) => {
          state.isLoading = false;
          state.applications = action.payload.data;
          state.pagination = {
            page: action.payload.meta.page,
            limit: action.payload.meta.limit,
            total: action.payload.meta.total,
            totalPages: action.payload.meta.totalPages,
          };
          state.isInitialized = true;
        }
      )
      .addCase(fetchApplicationsJobAdvertisements.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createApplicationsJobAdvertisement.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(
        createApplicationsJobAdvertisement.fulfilled,
        (state, action: PayloadAction<ApiResponseModel<null>>) => {
          state.isCreating = false;
          const { isSuccess, validationErrors } = action.payload;
          if (!isSuccess && validationErrors) {
            state.validationErrors = validationErrors as any;
          }
        }
      )
      .addCase(createApplicationsJobAdvertisement.rejected, (state, action) => {
        state.isCreating = false;
        const payload = action.payload as any;
        if (payload?.validationErrors) {
          state.validationErrors = payload.validationErrors;
        } else {
          state.error = payload as string;
        }
      })
      .addCase(editApplicationsJobAdvertisementStatus.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(
        editApplicationsJobAdvertisementStatus.fulfilled,
        (state, action: PayloadAction<ApiResponseModel<null>>) => {
          state.isUpdating = false;
          const { isSuccess, validationErrors } = action.payload;
          if (!isSuccess && validationErrors) {
            state.validationErrors = validationErrors as any;
          } else if (isSuccess && action.meta?.arg) {
            const { applicationsJobAdvertisementId, applicationStatus } = action.meta.arg;
            state.applications = state.applications.map((application) =>
              application.id === applicationsJobAdvertisementId
                ? { ...application, applicationStatus }
                : application
            );
            if (state.currentApplication?.id === applicationsJobAdvertisementId) {
              state.currentApplication = {
                ...state.currentApplication,
                applicationStatus,
              };
            }
          }
        }
      )
      .addCase(editApplicationsJobAdvertisementStatus.rejected, (state, action) => {
        state.isUpdating = false;
        const payload = action.payload as any;
        if (payload?.validationErrors) {
          state.validationErrors = payload.validationErrors;
        } else {
          state.error = payload as string;
        }
      });
  },
});

export const { setFilters, clearFilters, setCurrentApplication, clearError } =
  applicationsJobAdvertisementsSlice.actions;

export default applicationsJobAdvertisementsSlice.reducer;
