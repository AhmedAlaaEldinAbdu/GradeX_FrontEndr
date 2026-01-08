import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
  type ActionReducerMapBuilder,
} from '@reduxjs/toolkit';
import { getErrorMessage } from '@/lib/http';
import { monthlyCalendarApiService } from '@/services/api/monthly-calendar/monthly-calendar.service';
import type {
  MonthlyCalendarEvent,
  MonthlyCalendarQueryParams,
  CreateMonthlyCalendarRequest,
  UpdateMonthlyCalendarRequest,
} from '@/services/api/types/monthly-calendar.types';
import type { ApiResponseModel } from '@/services/api';

export interface MonthlyCalendarFilters {
  searchTerm?: string;
  grade?: string;
  classroomId?: string;
  date?: string;
}

export interface MonthlyCalendarState {
  events: MonthlyCalendarEvent[];
  popupEvents: MonthlyCalendarEvent[];
  currentEvent: MonthlyCalendarEvent | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: MonthlyCalendarFilters;
  isLoading: boolean;
  popupIsLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  validationErrors: Record<string, string> | null;
  selectedEventIds: string[];
  isInitialized: boolean;
}

export interface FetchMonthlyCalendarPayload {
  page?: number;
  limit?: number;
  filters?: MonthlyCalendarFilters;
  target?: 'list' | 'popup';
}

export interface FetchMonthlyCalendarResponse {
  data: MonthlyCalendarEvent[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const initialState: MonthlyCalendarState = {
  events: [],
  popupEvents: [],
  currentEvent: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
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
  selectedEventIds: [],
  isInitialized: false,
};

export const fetchMonthlyCalendarEvents = createAsyncThunk<
  FetchMonthlyCalendarResponse,
  FetchMonthlyCalendarPayload | void
>('monthlyCalendar/fetchMonthlyCalendarEvents', async (payload, { rejectWithValue }) => {
  try {
    const params: MonthlyCalendarQueryParams = {};

    if (payload) {
      if (payload.page !== undefined) params.PageIndex = payload.page;
      if (payload.limit !== undefined) params.PageSize = payload.limit;

      if (payload.filters) {
        const { searchTerm, grade, classroomId, date } = payload.filters;
        if (searchTerm) params.Search = searchTerm;
        if (grade) params.Grade = grade;
        if (classroomId) params.ClassRoomId = classroomId;
        if (date) params.Date = date;
      }
    }

    const response = await monthlyCalendarApiService.getMonthlyCalendarEvents(params);
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
      data: responseData.monthlyCalendarDto || [],
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

export const fetchMonthlyCalendarEventById = createAsyncThunk<MonthlyCalendarEvent, string>(
  'monthlyCalendar/fetchMonthlyCalendarEventById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await monthlyCalendarApiService.getMonthlyCalendarEventById(id);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createMonthlyCalendarEvent = createAsyncThunk<
  ApiResponseModel<null>,
  CreateMonthlyCalendarRequest
>('monthlyCalendar/createMonthlyCalendarEvent', async (payload, { rejectWithValue }) => {
  try {
    const response = await monthlyCalendarApiService.createMonthlyCalendarEvent(payload);
    return response;
  } catch (error: any) {
    if (error.isValidationError && error.validationErrors) {
      return rejectWithValue({ validationErrors: error.validationErrors });
    }
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateMonthlyCalendarEvent = createAsyncThunk<
  ApiResponseModel<null>,
  { id: string; data: UpdateMonthlyCalendarRequest }
>('monthlyCalendar/updateMonthlyCalendarEvent', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await monthlyCalendarApiService.updateMonthlyCalendarEvent(id, data);
    return response;
  } catch (error: any) {
    if (error.isValidationError && error.validationErrors) {
      return rejectWithValue({ validationErrors: error.validationErrors });
    }
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteMonthlyCalendarEvent = createAsyncThunk<string, string>(
  'monthlyCalendar/deleteMonthlyCalendarEvent',
  async (id, { rejectWithValue }) => {
    try {
      await monthlyCalendarApiService.deleteMonthlyCalendarEvent(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const monthlyCalendarSlice = createSlice({
  name: 'monthlyCalendar',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<MonthlyCalendarFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setCurrentEvent: (state, action: PayloadAction<MonthlyCalendarEvent | null>) => {
      state.currentEvent = action.payload;
    },
    clearError: (state) => {
      state.error = null;
      state.validationErrors = null;
    },
    selectEvent: (state, action: PayloadAction<string>) => {
      if (!state.selectedEventIds.includes(action.payload)) {
        state.selectedEventIds.push(action.payload);
      }
    },
    deselectEvent: (state, action: PayloadAction<string>) => {
      state.selectedEventIds = state.selectedEventIds.filter((id) => id !== action.payload);
    },
    selectAllEvents: (state) => {
      state.selectedEventIds = state.events.map((event) => event.id);
    },
    clearSelection: (state) => {
      state.selectedEventIds = [];
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<MonthlyCalendarState>) => {
    builder
      .addCase(fetchMonthlyCalendarEvents.pending, (state, action) => {
        const target = action.meta.arg?.target === 'popup' ? 'popup' : 'list';
        state.error = null;
        if (target === 'popup') {
          state.popupIsLoading = true;
        } else {
          state.isLoading = true;
        }
      })
      .addCase(fetchMonthlyCalendarEvents.fulfilled, (state, action) => {
        const target = action.meta.arg?.target === 'popup' ? 'popup' : 'list';
        if (target === 'popup') {
          state.popupIsLoading = false;
          state.popupEvents = action.payload.data;
        } else {
          state.isLoading = false;
          state.events = action.payload.data;
          state.pagination = {
            page: action.payload.meta.page,
            limit: action.payload.meta.limit,
            total: action.payload.meta.total,
            totalPages: action.payload.meta.totalPages,
          };
          state.isInitialized = true;
        }
      })
      .addCase(fetchMonthlyCalendarEvents.rejected, (state, action) => {
        const target = action.meta.arg?.target === 'popup' ? 'popup' : 'list';
        if (target === 'popup') {
          state.popupIsLoading = false;
        } else {
          state.isLoading = false;
        }
        state.error = action.payload as string;
      })
      .addCase(fetchMonthlyCalendarEventById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchMonthlyCalendarEventById.fulfilled,
        (state, action: PayloadAction<MonthlyCalendarEvent>) => {
          state.isLoading = false;
          state.currentEvent = action.payload;
        }
      )
      .addCase(fetchMonthlyCalendarEventById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createMonthlyCalendarEvent.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(
        createMonthlyCalendarEvent.fulfilled,
        (state, action: PayloadAction<ApiResponseModel<null>>) => {
        state.isCreating = false;
        const { isSuccess, validationErrors } = action.payload;
        if (!isSuccess && validationErrors) {
          state.validationErrors = validationErrors as any;
        }
        }
      )
      .addCase(createMonthlyCalendarEvent.rejected, (state, action) => {
        state.isCreating = false;
        const payload = action.payload as any;
        if (payload?.validationErrors) {
          state.validationErrors = payload.validationErrors;
        } else {
          state.error = payload as string;
        }
      })
      .addCase(updateMonthlyCalendarEvent.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(
        updateMonthlyCalendarEvent.fulfilled,
        (state, action: PayloadAction<ApiResponseModel<null>>) => {
        state.isUpdating = false;
        const { isSuccess, validationErrors } = action.payload;
        if (!isSuccess && validationErrors) {
          state.validationErrors = validationErrors as any;
        }
        }
      )
      .addCase(updateMonthlyCalendarEvent.rejected, (state, action) => {
        state.isUpdating = false;
        const payload = action.payload as any;
        if (payload?.validationErrors) {
          state.validationErrors = payload.validationErrors;
        } else {
          state.error = payload as string;
        }
      })
      .addCase(deleteMonthlyCalendarEvent.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteMonthlyCalendarEvent.fulfilled, (state, action: PayloadAction<string>) => {
        state.isDeleting = false;
        state.events = state.events.filter((event) => event.id !== action.payload);
        state.selectedEventIds = state.selectedEventIds.filter((id) => id !== action.payload);
      })
      .addCase(deleteMonthlyCalendarEvent.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setCurrentEvent,
  clearError,
  selectEvent,
  deselectEvent,
  selectAllEvents,
  clearSelection,
} = monthlyCalendarSlice.actions;

export default monthlyCalendarSlice.reducer;
