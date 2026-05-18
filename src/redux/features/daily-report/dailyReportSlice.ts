import {
  createSlice,
  type PayloadAction,
  type ActionReducerMapBuilder,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { dailyReportApiService } from '@/services/api/daily-report/daily-report.service';
import type {
  DailyReport,
  DailyReportQueryParams,
  DailyReportByParentQueryParams,
  CreateDailyReportRequest,
  UpdateDailyReportRequest,
} from '@/services/api/types/daily-report.types';
import { getErrorMessage } from '@/lib/http';

// ============================================================================
// Types
// ============================================================================

export interface DailyReportState {
  reports: DailyReport[];
  selectedReport: DailyReport | null;

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  isLoading: boolean;
  isLoadingReport: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  error: string | null;
  isInitialized: boolean;
}

export interface FetchDailyReportsResponse {
  data: DailyReport[];
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

const initialState: DailyReportState = {
  reports: [],
  selectedReport: null,

  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  isLoading: false,
  isLoadingReport: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,

  error: null,
  isInitialized: false,
};

// ============================================================================
// Async Thunks
// ============================================================================

export const fetchDailyReports = createAsyncThunk<
  FetchDailyReportsResponse,
  DailyReportQueryParams | void
>('dailyReport/fetchDailyReports', async (params, { rejectWithValue }) => {
  try {
    const response = await dailyReportApiService.getDailyReports(params || undefined);

    if (!response?.isSuccess || !response.data) {
      return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
    }

    return {
      data: response.data.dailyReportDto || [],
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

export const fetchDailyReportsByParent = createAsyncThunk<
  FetchDailyReportsResponse,
  DailyReportByParentQueryParams | void
>('dailyReport/fetchDailyReportsByParent', async (params, { rejectWithValue }) => {
  try {
    const response = await dailyReportApiService.getDailyReportsByParent(params || undefined);

    if (!response?.isSuccess || !response.data) {
      return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
    }

    return {
      data: response.data.dailyReportDto || [],
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

export const getDailyReportById = createAsyncThunk<DailyReport, string>(
  'dailyReport/getDailyReportById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await dailyReportApiService.getDailyReportById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createDailyReport = createAsyncThunk<DailyReport, CreateDailyReportRequest>(
  'dailyReport/createDailyReport',
  async (data, { rejectWithValue }) => {
    try {
      const response = await dailyReportApiService.createDailyReport(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateDailyReport = createAsyncThunk<DailyReport, UpdateDailyReportRequest>(
  'dailyReport/updateDailyReport',
  async (data, { rejectWithValue }) => {
    try {
      const response = await dailyReportApiService.updateDailyReport(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteDailyReport = createAsyncThunk<string, string>(
  'dailyReport/deleteDailyReport',
  async (id, { rejectWithValue }) => {
    try {
      await dailyReportApiService.deleteDailyReport(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// ============================================================================
// Slice
// ============================================================================

const dailyReportSlice = createSlice({
  name: 'dailyReport',
  initialState,
  reducers: {
    setPagination: (state, action: PayloadAction<{ page?: number; limit?: number }>) => {
      if (action.payload.page !== undefined) state.pagination.page = action.payload.page;
      if (action.payload.limit !== undefined) state.pagination.limit = action.payload.limit;
    },
    setSelectedReport: (state, action: PayloadAction<DailyReport | null>) => {
      state.selectedReport = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<DailyReportState>) => {
    const handleListFulfilled = (
      state: DailyReportState,
      action: PayloadAction<FetchDailyReportsResponse>
    ) => {
      state.isLoading = false;
      state.isInitialized = true;
      state.reports = action.payload.data;
      state.pagination = {
        page: action.payload.meta.page,
        limit: action.payload.meta.limit,
        total: action.payload.meta.total,
        totalPages: action.payload.meta.totalPages,
      };
      state.error = null;
    };

    builder
      .addCase(fetchDailyReports.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDailyReports.fulfilled, handleListFulfilled)
      .addCase(fetchDailyReports.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchDailyReportsByParent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDailyReportsByParent.fulfilled, handleListFulfilled)
      .addCase(fetchDailyReportsByParent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(getDailyReportById.pending, (state) => {
        state.isLoadingReport = true;
        state.error = null;
      })
      .addCase(getDailyReportById.fulfilled, (state, action) => {
        state.isLoadingReport = false;
        state.selectedReport = action.payload;
        state.error = null;
      })
      .addCase(getDailyReportById.rejected, (state, action) => {
        state.isLoadingReport = false;
        state.selectedReport = null;
        state.error = action.payload as string;
      });

    builder
      .addCase(createDailyReport.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createDailyReport.fulfilled, (state) => {
        state.isCreating = false;
        state.error = null;
      })
      .addCase(createDailyReport.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateDailyReport.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateDailyReport.fulfilled, (state) => {
        state.isUpdating = false;
        state.error = null;
      })
      .addCase(updateDailyReport.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(deleteDailyReport.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteDailyReport.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.reports = state.reports.filter((r) => r.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteDailyReport.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

// ============================================================================
// Exports
// ============================================================================

export const { setPagination, setSelectedReport, clearError } = dailyReportSlice.actions;

export default dailyReportSlice.reducer;
