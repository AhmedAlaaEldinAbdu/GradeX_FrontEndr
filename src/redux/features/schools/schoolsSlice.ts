import { createSlice, type PayloadAction, type ActionReducerMapBuilder, createAsyncThunk } from '@reduxjs/toolkit';
import type { FetchSchoolsPayload, FetchSchoolsResponse, SchoolsState, UpdateSchoolStatusPayload } from './schoolsTypes';
import { schoolsApiService, type CreateSchoolRequest, type SchoolDetail, type SchoolQueryParams, type SchoolStatisticsResponse, type UpdateSchoolRequest } from '@/services/api';
import { getErrorMessage } from '@/lib/http';


const initialState: SchoolsState = {
  // Data
  schools: [],
  currentSchool: null,
  statistics: null,

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
  isFetchingStats: false,

  // Error States
  error: null,
  validationErrors: null,

  // UI States
  selectedSchoolIds: [],
  isInitialized: false,
};

export const fetchSchools = createAsyncThunk<FetchSchoolsResponse, FetchSchoolsPayload | void>(
  'schools/fetchSchools',
  async (payload, { rejectWithValue }) => {
    try {
      const params: Partial<SchoolQueryParams> = payload
        ? {
          page: payload.page,
          limit: payload.limit,
          ...payload.filters,
          sortBy: payload.sortBy as SchoolQueryParams['sortBy'],
          sortOrder: payload.sortOrder,
        }
        : {};

      const response = await schoolsApiService.getSchools(params as SchoolQueryParams);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchSchoolById = createAsyncThunk<SchoolDetail, string>(
  'schools/fetchSchoolById',
  async (id, { rejectWithValue }) => {
    try {
      const school = await schoolsApiService.getSchoolById(id);
      return school;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createSchool = createAsyncThunk<SchoolDetail, CreateSchoolRequest>(
  'schools/createSchool',
  async (data, { rejectWithValue }) => {
    try {
      const school = await schoolsApiService.createSchool(data);
      return school;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateSchool = createAsyncThunk<
  SchoolDetail,
  { id: string; data: UpdateSchoolRequest }
>('schools/updateSchool', async ({ id, data }, { rejectWithValue }) => {
  try {
    const school = await schoolsApiService.updateSchool(id, data);
    return school;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteSchool = createAsyncThunk<string, string>(
  'schools/deleteSchool',
  async (id, { rejectWithValue }) => {
    try {
      await schoolsApiService.deleteSchool(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const restoreSchool = createAsyncThunk<string, string>(
  'schools/restoreSchool',
  async (id, { rejectWithValue }) => {
    try {
      await schoolsApiService.restoreSchool(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateSchoolStatus = createAsyncThunk<SchoolDetail, UpdateSchoolStatusPayload>(
  'schools/updateSchoolStatus',
  async ({ id, status, reason, notes }, { rejectWithValue }) => {
    try {
      const school = await schoolsApiService.updateSchoolStatus(id, status, { reason, notes });
      return school;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const approveSchool = createAsyncThunk<SchoolDetail, { id: string; notes?: string }>(
  'schools/approveSchool',
  async ({ id, notes }, { rejectWithValue }) => {
    try {
      const school = await schoolsApiService.updateSchoolStatus(id, 'approved', { notes });
      return school;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const rejectSchool = createAsyncThunk<SchoolDetail, { id: string; reason: string }>(
  'schools/rejectSchool',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const school = await schoolsApiService.updateSchoolStatus(id, 'rejected', { reason });
      return school;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const activateSchool = createAsyncThunk<SchoolDetail, string>(
  'schools/activateSchool',
  async (id, { rejectWithValue }) => {
    try {
      const school = await schoolsApiService.updateSchoolStatus(id, 'active');
      return school;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deactivateSchool = createAsyncThunk<SchoolDetail, string>(
  'schools/deactivateSchool',
  async (id, { rejectWithValue }) => {
    try {
      const school = await schoolsApiService.updateSchoolStatus(id, 'inactive');
      return school;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchSchoolStatistics = createAsyncThunk<SchoolStatisticsResponse, void>(
  'schools/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const statistics = await schoolsApiService.getSchoolStatistics();
      return statistics;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const schoolsSlice = createSlice({
  name: 'schools',
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

   
  },

  extraReducers: (builder: ActionReducerMapBuilder<SchoolsState>) => {

    builder
      .addCase(fetchSchools.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSchools.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.schools = action.payload.data;
        state.pagination = {
          page: action.payload.meta.page,
          limit: action.payload.meta.limit,
          total: action.payload.meta.total,
          totalPages: action.payload.meta.totalPages,
        };
        state.error = null;
      })
      .addCase(fetchSchools.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchSchoolById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSchoolById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSchool = action.payload;
        state.error = null;
      })
      .addCase(fetchSchoolById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createSchool.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(createSchool.fulfilled, (state, action) => {
        state.isCreating = false;
        state.schools.unshift(action.payload);
        state.pagination.total += 1;
        state.error = null;
      })
      .addCase(createSchool.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateSchool.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(updateSchool.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.schools.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.schools[index] = action.payload;
        }
        if (state.currentSchool?.id === action.payload.id) {
          state.currentSchool = action.payload;
        }
        state.error = null;
      })
      .addCase(updateSchool.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(deleteSchool.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteSchool.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.schools = state.schools.filter((s) => s.id !== action.payload);
        state.pagination.total -= 1;
        state.error = null;
      })
      .addCase(deleteSchool.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateSchoolStatus.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateSchoolStatus.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.schools.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.schools[index] = action.payload;
        }
        if (state.currentSchool?.id === action.payload.id) {
          state.currentSchool = action.payload;
        }
        state.error = null;
      })
      .addCase(updateSchoolStatus.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(approveSchool.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(approveSchool.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.schools.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.schools[index] = action.payload;
        }
      })
      .addCase(approveSchool.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(rejectSchool.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(rejectSchool.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.schools.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.schools[index] = action.payload;
        }
      })
      .addCase(rejectSchool.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });


    builder
      .addCase(activateSchool.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(activateSchool.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.schools.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.schools[index] = action.payload;
        }
      })
      .addCase(activateSchool.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });


    builder
      .addCase(deactivateSchool.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(deactivateSchool.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.schools.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.schools[index] = action.payload;
        }
      })
      .addCase(deactivateSchool.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchSchoolStatistics.pending, (state) => {
        state.isFetchingStats = true;
        state.error = null;
      })
      .addCase(fetchSchoolStatistics.fulfilled, (state, action) => {
        state.isFetchingStats = false;
        state.statistics = action.payload;
        state.error = null;
      })
      .addCase(fetchSchoolStatistics.rejected, (state, action) => {
        state.isFetchingStats = false;
        state.error = action.payload as string;
      });
  },
});


export default schoolsSlice.reducer;
