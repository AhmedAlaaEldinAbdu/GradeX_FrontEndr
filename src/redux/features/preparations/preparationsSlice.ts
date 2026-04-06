import {
  createSlice,
  type PayloadAction,
  type ActionReducerMapBuilder,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { preparationApiService } from '@/services/api/preparations/preparations.service';
import type { Preparation, PreparationQueryParams } from '@/types/preparations';
import { getErrorMessage } from '@/lib/http';

export interface PreparationFilters {
  searchTerm?: string;
  gradeId?: string;
  classRoomId?: string;
  date?: string;
}

export interface PreparationsState {
  preparations: Preparation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: PreparationFilters;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

export interface FetchPreparationsPayload {
  schoolBranchId?: string;
  page?: number;
  limit?: number;
  filters?: PreparationFilters;
}

export interface FetchPreparationsResponse {
  preparations: Preparation[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const initialState: PreparationsState = {
  preparations: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {},
  isLoading: false,
  error: null,
  isInitialized: false,
};

export const fetchPreparations = createAsyncThunk<
  FetchPreparationsResponse,
  FetchPreparationsPayload | void
>('preparations/fetchPreparations', async (payload, { rejectWithValue }) => {
  try {
    const params: Partial<PreparationQueryParams> = {};

    if (payload) {
      if (payload.schoolBranchId) params.schoolBranchId = payload.schoolBranchId;
      if (payload.page) params.PageIndex = payload.page;
      if (payload.limit) params.PageSize = payload.limit;

      if (payload.filters) {
        if (payload.filters.searchTerm) params.Search = payload.filters.searchTerm;
        if (payload.filters.gradeId) params.GradeId = payload.filters.gradeId;
        if (payload.filters.classRoomId) params.ClassRoomId = payload.filters.classRoomId;
        if (payload.filters.date) params.Date = payload.filters.date;
      }
    }

    const response = await preparationApiService.getPreparations(params as PreparationQueryParams);

    if (!response?.isSuccess || !response.data) {
      return {
        preparations: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      };
    }

    return {
      preparations: response.data.preparations || [],
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

const preparationsSlice = createSlice({
  name: 'preparations',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<PreparationsState['filters']>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<PreparationsState>) => {
    builder
      .addCase(fetchPreparations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchPreparations.fulfilled,
        (state, action: PayloadAction<FetchPreparationsResponse>) => {
          state.isLoading = false;
          state.preparations = action.payload.preparations;
          state.pagination = {
            page: action.payload.meta.page,
            limit: action.payload.meta.limit,
            total: action.payload.meta.total,
            totalPages: action.payload.meta.totalPages,
          };
          state.isInitialized = true;
        }
      )
      .addCase(fetchPreparations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, clearFilters, clearError } = preparationsSlice.actions;

export default preparationsSlice.reducer;
