import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
  type ActionReducerMapBuilder,
} from '@reduxjs/toolkit';
import { getErrorMessage } from '@/lib/http';
import { academicCalendarApiService } from '@/services/api/academic-calendar/academic-calendar.service';
import type {
  AcademicCalendarEntity,
  AcademicCalendarQueryParams,
  CreateAcademicCalendarRequest,
  UpdateAcademicCalendarRequest,
} from '@/services/api/types/academic-calendar.types';
import type { ApiResponseModel } from '@/services/api';

export interface AcademicCalendarFilters {
  schoolBranchId?: string;
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
}

export interface AcademicCalendarState {
  calendars: AcademicCalendarEntity[];
  currentCalendar: AcademicCalendarEntity | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: AcademicCalendarFilters;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  validationErrors: Record<string, string> | null;
  isInitialized: boolean;
}

export interface FetchAcademicCalendarsPayload {
  page?: number;
  limit?: number;
  filters?: AcademicCalendarFilters;
}

export interface FetchAcademicCalendarsResponse {
  data: AcademicCalendarEntity[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const initialState: AcademicCalendarState = {
  calendars: [],
  currentCalendar: null,
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
  isInitialized: false,
};

export const fetchAcademicCalendars = createAsyncThunk<
  FetchAcademicCalendarsResponse,
  FetchAcademicCalendarsPayload | void
>('academicCalendar/fetchAcademicCalendars', async (payload, { rejectWithValue }) => {
  try {
    const params: AcademicCalendarQueryParams = {};

    if (payload) {
      if (payload.page !== undefined) params.PageIndex = payload.page;
      if (payload.limit !== undefined) params.PageSize = payload.limit;

      if (payload.filters) {
        const { schoolBranchId, searchTerm, startDate, endDate } = payload.filters;
        if (schoolBranchId) params.schoolBranchId = schoolBranchId;
        if (searchTerm) params.Search = searchTerm;
        if (startDate) params.StartDate = startDate;
        if (endDate) params.EndDate = endDate;
      }
    }

    const response = await academicCalendarApiService.getAcademicCalendars(params);
    const responseData = response.data || response.value;

    if (!responseData) {
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
      data: responseData.academicCalendarDto || [],
      meta: {
        total: responseData.totalItems || 0,
        page: responseData.pageIndex || params.PageIndex || 1,
        limit: responseData.pageSize || params.PageSize || 10,
        totalPages: responseData.totalPages || 0,
      },
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchAcademicCalendarById = createAsyncThunk<AcademicCalendarEntity, string>(
  'academicCalendar/fetchAcademicCalendarById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await academicCalendarApiService.getAcademicCalendarById(id);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createAcademicCalendar = createAsyncThunk<
  ApiResponseModel<null>,
  CreateAcademicCalendarRequest
>('academicCalendar/createAcademicCalendar', async (payload, { rejectWithValue }) => {
  try {
    const response = await academicCalendarApiService.createAcademicCalendar(payload);
    return response;
  } catch (error: any) {
    if (error.isValidationError && error.validationErrors) {
      return rejectWithValue({ validationErrors: error.validationErrors });
    }
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateAcademicCalendar = createAsyncThunk<
  ApiResponseModel<null>,
  { id: string; data: UpdateAcademicCalendarRequest }
>('academicCalendar/updateAcademicCalendar', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await academicCalendarApiService.updateAcademicCalendar(id, data);
    return response;
  } catch (error: any) {
    if (error.isValidationError && error.validationErrors) {
      return rejectWithValue({ validationErrors: error.validationErrors });
    }
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteAcademicCalendar = createAsyncThunk<string, string>(
  'academicCalendar/deleteAcademicCalendar',
  async (id, { rejectWithValue }) => {
    try {
      await academicCalendarApiService.deleteAcademicCalendar(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const academicCalendarSlice = createSlice({
  name: 'academicCalendar',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<AcademicCalendarFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setCurrentCalendar: (state, action: PayloadAction<AcademicCalendarEntity | null>) => {
      state.currentCalendar = action.payload;
    },
    clearError: (state) => {
      state.error = null;
      state.validationErrors = null;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<AcademicCalendarState>) => {
    builder
      .addCase(fetchAcademicCalendars.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAcademicCalendars.fulfilled, (state, action) => {
        state.isLoading = false;
        state.calendars = action.payload.data;
        state.pagination = {
          page: action.payload.meta.page,
          limit: action.payload.meta.limit,
          total: action.payload.meta.total,
          totalPages: action.payload.meta.totalPages,
        };
        state.isInitialized = true;
      })
      .addCase(fetchAcademicCalendars.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchAcademicCalendarById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAcademicCalendarById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCalendar = action.payload;
      })
      .addCase(fetchAcademicCalendarById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(createAcademicCalendar.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(createAcademicCalendar.fulfilled, (state, action) => {
        state.isCreating = false;
        if (!action.payload.isSuccess) {
          state.validationErrors = (action.payload.validationErrors || null) as any;
        }
      })
      .addCase(createAcademicCalendar.rejected, (state, action) => {
        state.isCreating = false;
        if (typeof action.payload === 'object' && action.payload && 'validationErrors' in action.payload) {
          state.validationErrors = (action.payload as any).validationErrors;
        } else {
          state.error = action.payload as string;
        }
      })

      .addCase(updateAcademicCalendar.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(updateAcademicCalendar.fulfilled, (state, action) => {
        state.isUpdating = false;
        if (!action.payload.isSuccess) {
          state.validationErrors = (action.payload.validationErrors || null) as any;
        }
      })
      .addCase(updateAcademicCalendar.rejected, (state, action) => {
        state.isUpdating = false;
        if (typeof action.payload === 'object' && action.payload && 'validationErrors' in action.payload) {
          state.validationErrors = (action.payload as any).validationErrors;
        } else {
          state.error = action.payload as string;
        }
      })

      .addCase(deleteAcademicCalendar.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteAcademicCalendar.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.calendars = state.calendars.filter((c) => c.id !== action.payload);
        if (typeof state.pagination.total === 'number' && state.pagination.total > 0) {
          state.pagination.total -= 1;
        }
      })
      .addCase(deleteAcademicCalendar.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, clearFilters, setCurrentCalendar, clearError } = academicCalendarSlice.actions;

export default academicCalendarSlice.reducer;
