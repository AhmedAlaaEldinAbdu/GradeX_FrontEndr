import {
  createSlice,
  type PayloadAction,
  type ActionReducerMapBuilder,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import type {
  FetchOfficialHolidaysPayload,
  FetchOfficialHolidaysResponse,
  OfficialHolidaysState,
} from './officialHolidaysTypes';
import { officialHolidaysApiService, type OfficialHolidaysQueryParams } from '@/services/api';
import { getErrorMessage } from '@/lib/http';

const initialState: OfficialHolidaysState = {
  // Data
  holidays: [],

  // Pagination
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  // Filters
  filters: {},

  // Loading States
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,

  // Error States
  error: null,

  // UI States
  isInitialized: false,
};

export const fetchOfficialHolidays = createAsyncThunk<
  FetchOfficialHolidaysResponse,
  FetchOfficialHolidaysPayload | void
>('officialHolidays/fetchOfficialHolidays', async (payload, { rejectWithValue }) => {
  try {
    const params: Partial<OfficialHolidaysQueryParams> = {};

    if (payload) {
      if (payload.page) params.PageIndex = payload.page;
      if (payload.limit) params.PageSize = payload.limit;
      if (payload.sortBy) params.sortBy = payload.sortBy as OfficialHolidaysQueryParams['sortBy'];
      if (payload.sortOrder) params.sortOrder = payload.sortOrder;

      if (payload.filters) {
        if (payload.filters.searchTerm) params.searchTerm = payload.filters.searchTerm;
        if (payload.filters.countryId) params.countryId = payload.filters.countryId;
        if (payload.filters.leaveCategory) params.leaveCategory = payload.filters.leaveCategory;
        if (payload.filters.startDate) params.startDate = payload.filters.startDate;
        if (payload.filters.endDate) params.endDate = payload.filters.endDate;
      }
    }

    const response = await officialHolidaysApiService.getOfficialHolidays(
      params as OfficialHolidaysQueryParams
    );

    // Transform backend response to match FetchOfficialHolidaysResponse
    if (!response) {
      return {
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      };
    }

    return {
      data: response.leaveDto || [],
      meta: {
        total: response.totalItems || 0,
        page: response.pageIndex || 1,
        limit: response.pageSize || 10,
        totalPages: response.totalPages || 0,
      },
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const createHoliday = createAsyncThunk<
  { success: boolean; id?: string },
  import('@/services/api/types/official-holidays.types').CreateOfficialHolidayRequest
>('officialHolidays/createHoliday', async (data, { rejectWithValue }) => {
  try {
    const result = await officialHolidaysApiService.createHoliday(data);
    return result;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateHoliday = createAsyncThunk<
  { success: boolean },
  { id: string; data: import('@/services/api/types/official-holidays.types').UpdateOfficialHolidayRequest }
>('officialHolidays/updateHoliday', async ({ id, data }, { rejectWithValue }) => {
  try {
    const result = await officialHolidaysApiService.updateHoliday(id, data);
    return result;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteHoliday = createAsyncThunk<string, string>(
  'officialHolidays/deleteHoliday',
  async (id, { rejectWithValue }) => {
    try {
      await officialHolidaysApiService.deleteHoliday(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const officialHolidaysSlice = createSlice({
  name: 'officialHolidays',
  initialState,
  reducers: {
    /**
     * Set pagination
     */
    setPagination: (state, action: PayloadAction<{ page?: number; limit?: number }>) => {
      if (action.payload.page !== undefined) {
        state.pagination.page = action.payload.page;
      }
      if (action.payload.limit !== undefined) {
        state.pagination.limit = action.payload.limit;
      }
    },
    /**
     * Reset pagination to initial state
     */
    resetPagination: (state) => {
      state.pagination = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };
    },
  },

  extraReducers: (builder: ActionReducerMapBuilder<OfficialHolidaysState>) => {
    builder
      .addCase(fetchOfficialHolidays.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOfficialHolidays.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.holidays = action.payload.data;
        state.pagination = {
          page: action.payload.meta.page,
          limit: action.payload.meta.limit,
          total: action.payload.meta.total,
          totalPages: action.payload.meta.totalPages,
        };
        state.error = null;
      })
      .addCase(fetchOfficialHolidays.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Holiday
    builder
      .addCase(createHoliday.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createHoliday.fulfilled, (state) => {
        state.isCreating = false;
        state.error = null;
        // Optionally refresh the list after creation
      })
      .addCase(createHoliday.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Update Holiday
    builder
      .addCase(updateHoliday.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateHoliday.fulfilled, (state) => {
        state.isUpdating = false;
        state.error = null;
        // Optionally refresh the list after update
      })
      .addCase(updateHoliday.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Delete Holiday
    builder
      .addCase(deleteHoliday.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteHoliday.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.holidays = state.holidays.filter((h) => h.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteHoliday.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export const { setPagination, resetPagination } = officialHolidaysSlice.actions;

export default officialHolidaysSlice.reducer;
