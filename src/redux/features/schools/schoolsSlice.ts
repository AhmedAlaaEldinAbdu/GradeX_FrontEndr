import {
  createSlice,
  type PayloadAction,
  type ActionReducerMapBuilder,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import type {
  FetchSchoolsPayload,
  FetchSchoolsResponse,
  SchoolsState,
  UpdateSchoolStatusPayload,
} from './schoolsTypes';
import {
  schoolsApiService,
  type CreateSchoolRequest,
  type SchoolDetail,
  type SchoolQueryParams,
  type SchoolStatisticsResponse,
  type UpdateSchoolRequest,
  SchoolStatusEnum,
} from '@/services/api';
import { getErrorMessage } from '@/lib/http';

const initialState: SchoolsState = {
  // Data
  schools: [],
  currentSchool: null,
  statistics: null,
  currentTabType: null, // Track which tab the current data belongs to

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
      const params: Partial<SchoolQueryParams> = {};

      if (payload) {
        if (payload.page) params.pageIndex = payload.page;
        if (payload.limit) params.pageSize = payload.limit;
        if (payload.sortBy) params.sortBy = payload.sortBy as SchoolQueryParams['sortBy'];
        if (payload.sortOrder) params.sortOrder = payload.sortOrder;

        if (payload.filters) {
          if (payload.filters.searchTerm) params.searchTerm = payload.filters.searchTerm;
          if (payload.filters.academicSystemId)
            params.academicSystemId = payload.filters.academicSystemId;
          if (payload.filters.lKCountryId) params.lKCountryId = payload.filters.lKCountryId;
          if (payload.filters.region) params.region = payload.filters.region;
          if (payload.filters.neighborhood) params.neighborhood = payload.filters.neighborhood;
          if (payload.filters.schoolStatus !== undefined)
            params.schoolStatus = payload.filters.schoolStatus;
        }
      }

      const response = await schoolsApiService.getSchools(params as SchoolQueryParams);

      // Transform backend response to match FetchSchoolsResponse
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
        data: response.items || [],
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
  }
);

// Fetch registered schools
export const fetchRegisteredSchools = createAsyncThunk<
  FetchSchoolsResponse,
  FetchSchoolsPayload | void
>('schools/fetchRegisteredSchools', async (payload, { rejectWithValue }) => {
  try {
    const params: Partial<SchoolQueryParams> = {
      pageIndex: payload?.page || 1,
      pageSize: payload?.limit || 10,
      schoolStatus: SchoolStatusEnum.ACTIVE,
    };

    if (payload?.filters) {
      if (payload.filters.searchTerm) params.searchTerm = payload.filters.searchTerm;
      if (payload.filters.academicSystemId)
        params.academicSystemId = payload.filters.academicSystemId;
      if (payload.filters.lKCountryId) params.lKCountryId = payload.filters.lKCountryId;
      if (payload.filters.region) params.region = payload.filters.region;
      if (payload.filters.neighborhood) params.neighborhood = payload.filters.neighborhood;
    }

    if (payload?.sortBy) params.sortBy = payload.sortBy as SchoolQueryParams['sortBy'];
    if (payload?.sortOrder) params.sortOrder = payload.sortOrder;

    const response = await schoolsApiService.getSchools(params as SchoolQueryParams);

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
      data: response.items || [],
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

// Fetch pending schools (status 3)
export const fetchPendingSchools = createAsyncThunk<
  FetchSchoolsResponse,
  FetchSchoolsPayload | void
>('schools/fetchPendingSchools', async (payload, { rejectWithValue }) => {
  try {
    // Build params object with only defined values to avoid null/undefined issues
    const params: Partial<SchoolQueryParams> = {
      pageIndex: payload?.page || 1,
      pageSize: payload?.limit || 10,
      schoolStatus: SchoolStatusEnum.PENDING,
    };

    if (payload?.filters) {
      if (payload.filters.searchTerm) params.searchTerm = payload.filters.searchTerm;
      if (payload.filters.academicSystemId)
        params.academicSystemId = payload.filters.academicSystemId;
      if (payload.filters.lKCountryId) params.lKCountryId = payload.filters.lKCountryId;
      if (payload.filters.region) params.region = payload.filters.region;
      if (payload.filters.neighborhood) params.neighborhood = payload.filters.neighborhood;
    }

    if (payload?.sortBy) params.sortBy = payload.sortBy as SchoolQueryParams['sortBy'];
    if (payload?.sortOrder) params.sortOrder = payload.sortOrder;

    const response = await schoolsApiService.getSchools(params as SchoolQueryParams);

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
      data: response.items || [],
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

// Fetch deleted schools
export const fetchDeletedSchools = createAsyncThunk<
  FetchSchoolsResponse,
  FetchSchoolsPayload | void
>('schools/fetchDeletedSchools', async (payload, { rejectWithValue }) => {
  try {
    const params: Partial<SchoolQueryParams> = {
      pageIndex: payload?.page || 1,
      pageSize: payload?.limit || 10,
      schoolStatus: [SchoolStatusEnum.REJECTED, SchoolStatusEnum.DELETED],
    };

    if (payload?.filters) {
      if (payload.filters.searchTerm) params.searchTerm = payload.filters.searchTerm;
      if (payload.filters.academicSystemId)
        params.academicSystemId = payload.filters.academicSystemId;
      if (payload.filters.lKCountryId) params.lKCountryId = payload.filters.lKCountryId;
      if (payload.filters.region) params.region = payload.filters.region;
      if (payload.filters.neighborhood) params.neighborhood = payload.filters.neighborhood;
    }

    if (payload?.sortBy) params.sortBy = payload.sortBy as SchoolQueryParams['sortBy'];
    if (payload?.sortOrder) params.sortOrder = payload.sortOrder;

    const response = await schoolsApiService.getSchools(params as SchoolQueryParams);

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
      data: response.items || [],
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

export const createSchoolWithFormData = createAsyncThunk<SchoolDetail, FormData>(
  'schools/createSchoolWithFormData',
  async (formData, { rejectWithValue }) => {
    try {
      const school = await schoolsApiService.createSchool(formData);
      return school;
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'isValidationError' in error &&
        error.isValidationError
      ) {
        return rejectWithValue({
          message: getErrorMessage(error),
          validationErrors: (error as unknown as { validationErrors: unknown }).validationErrors,
        });
      }
      return rejectWithValue({ message: getErrorMessage(error), validationErrors: null });
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

export const updateSchoolWithFormData = createAsyncThunk<
  SchoolDetail,
  { id: string; formData: FormData }
>('schools/updateSchoolWithFormData', async ({ id, formData }, { rejectWithValue }) => {
  try {
    const school = await schoolsApiService.updateSchool(id, formData);
    return school;
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'isValidationError' in error &&
      error.isValidationError
    ) {
      return rejectWithValue({
        message: getErrorMessage(error),
        validationErrors: (error as unknown as { validationErrors: unknown }).validationErrors,
      });
    }
    return rejectWithValue({ message: getErrorMessage(error), validationErrors: null });
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

export const acceptSchoolApplication = createAsyncThunk<
  { id: string; success: boolean; message: string },
  string
>('schools/acceptSchoolApplication', async (id, { rejectWithValue }) => {
  try {
    const result = await schoolsApiService.acceptSchool(id);
    return { id, ...result };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const rejectSchoolApplication = createAsyncThunk<
  { id: string; success: boolean; message: string },
  { id: string; rejectionReason: string }
>('schools/rejectSchoolApplication', async ({ id, rejectionReason }, { rejectWithValue }) => {
  try {
    const result = await schoolsApiService.rejectSchool(id, rejectionReason);
    return { id, ...result };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

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

export const sendSchoolEditRequest = createAsyncThunk<
  { id: string; success: boolean; message: string },
  { id: string; message: string }
>('schools/sendSchoolEditRequest', async ({ id, message }, { rejectWithValue }) => {
  try {
    const result = await schoolsApiService.addSchoolUpdateRequest(id, message);
    return { id, ...result };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

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
    /**
     * Clear schools data - used when switching tabs to prevent stale data
     */
    clearSchools: (state) => {
      state.schools = [];
      state.currentTabType = null;
      state.pagination = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };
      state.error = null;
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

    // Registered Schools
    builder
      .addCase(fetchRegisteredSchools.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRegisteredSchools.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.currentTabType = 'registered'; // Mark data as belonging to registered tab
        state.schools = action.payload.data;
        state.pagination = {
          page: action.payload.meta.page,
          limit: action.payload.meta.limit,
          total: action.payload.meta.total,
          totalPages: action.payload.meta.totalPages,
        };
        state.error = null;
      })
      .addCase(fetchRegisteredSchools.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Pending Schools
    builder
      .addCase(fetchPendingSchools.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPendingSchools.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.currentTabType = 'pending'; // Mark data as belonging to pending tab
        state.schools = action.payload.data;
        state.pagination = {
          page: action.payload.meta.page,
          limit: action.payload.meta.limit,
          total: action.payload.meta.total,
          totalPages: action.payload.meta.totalPages,
        };
        state.error = null;
      })
      .addCase(fetchPendingSchools.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Deleted Schools
    builder
      .addCase(fetchDeletedSchools.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDeletedSchools.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.currentTabType = 'deleted'; // Mark data as belonging to deleted tab
        state.schools = action.payload.data;
        state.pagination = {
          page: action.payload.meta.page,
          limit: action.payload.meta.limit,
          total: action.payload.meta.total,
          totalPages: action.payload.meta.totalPages,
        };
        state.error = null;
      })
      .addCase(fetchDeletedSchools.rejected, (state, action) => {
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

    // Handle createSchoolWithFormData
    builder
      .addCase(createSchoolWithFormData.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(createSchoolWithFormData.fulfilled, (state, action) => {
        state.isCreating = false;
        state.schools.unshift(action.payload);
        state.pagination.total += 1;
        state.error = null;
      })
      .addCase(createSchoolWithFormData.rejected, (state, action) => {
        state.isCreating = false;
        const payload = action.payload as
          | { message: string; validationErrors: unknown }
          | undefined;
        if (payload) {
          state.error = payload.message;
          state.validationErrors = payload.validationErrors as Record<string, string> | null;
        } else {
          state.error = 'An error occurred';
        }
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

    // Handle updateSchoolWithFormData (multipart edit)
    builder
      .addCase(updateSchoolWithFormData.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(updateSchoolWithFormData.fulfilled, (state, action) => {
        state.isUpdating = false;
        // Guard against an envelope that doesn't carry the full school object, so the
        // success flow (popup + cleared loading state) never breaks on a 200 response.
        const updated = action.payload;
        if (updated?.id) {
          const index = state.schools.findIndex((s) => s.id === updated.id);
          if (index !== -1) {
            state.schools[index] = updated;
          }
          if (state.currentSchool?.id === updated.id) {
            state.currentSchool = updated;
          }
        }
        state.error = null;
      })
      .addCase(updateSchoolWithFormData.rejected, (state, action) => {
        state.isUpdating = false;
        const payload = action.payload as
          | { message: string; validationErrors: unknown }
          | undefined;
        if (payload) {
          state.error = payload.message;
          state.validationErrors = payload.validationErrors as Record<string, string> | null;
        } else {
          state.error = 'An error occurred';
        }
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

    // Accept School Application
    builder
      .addCase(acceptSchoolApplication.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(acceptSchoolApplication.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.schools = state.schools.filter((s) => s.id !== action.payload.id);
        state.pagination.total -= 1;
        state.error = null;
      })
      .addCase(acceptSchoolApplication.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Reject School Application
    builder
      .addCase(rejectSchoolApplication.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(rejectSchoolApplication.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.schools = state.schools.filter((s) => s.id !== action.payload.id);
        state.pagination.total -= 1;
        state.error = null;
      })
      .addCase(rejectSchoolApplication.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Send School Edit Request
    builder
      .addCase(sendSchoolEditRequest.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(sendSchoolEditRequest.fulfilled, (state) => {
        state.isUpdating = false;
        state.error = null;
      })
      .addCase(sendSchoolEditRequest.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });
  },
});

export const { setPagination, resetPagination, clearSchools } = schoolsSlice.actions;

export default schoolsSlice.reducer;
