import {
  createSlice,
  type PayloadAction,
  type ActionReducerMapBuilder,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { classroomApiService } from '@/services/api/classrooms/classrooms.service';
import type {
  Classroom,
  ClassroomQueryParams,
  CreateClassroomRequest,
} from '@/services/api/types/classrooms.types';
import { getErrorMessage } from '@/lib/http';
import type { ApiResponseModel } from '@/services/api';

// ============================================================================
// Types
// ============================================================================

export interface ClassroomFilters {
  name?: string;
  academicSystemId?: string;
  gradeId?: string;
  schoolBranchId?: string;
}

export interface ClassroomsState {
  // Data
  classrooms: Classroom[];
  currentClassroom: Classroom | null;

  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Filters
  filters: ClassroomFilters;

  // Loading States
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Error States
  error: string | null;
  validationErrors: Record<string, string> | null;

  // UI States
  selectedClassroomIds: string[];
  isInitialized: boolean;
  gradeClassrooms: Classroom[];
  isLoadingGradeClassrooms: boolean;
}

export interface FetchClassroomsPayload {
  page?: number;
  limit?: number;
  filters?: ClassroomFilters;
}

export interface FetchClassroomsResponse {
  data: Classroom[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const initialState: ClassroomsState = {
  // Data
  classrooms: [],
  currentClassroom: null,

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
  validationErrors: null,

  // UI States
  selectedClassroomIds: [],
  isInitialized: false,
  gradeClassrooms: [],
  isLoadingGradeClassrooms: false,
};

export const fetchClassrooms = createAsyncThunk<
  FetchClassroomsResponse,
  FetchClassroomsPayload | void
>('classrooms/fetchClassrooms', async (payload, { rejectWithValue }) => {
  try {
    const params: Partial<ClassroomQueryParams> = {};

    if (payload) {
      if (payload.page) params.PageIndex = payload.page;
      if (payload.limit) params.PageSize = payload.limit;

      if (payload.filters) {
        if (payload.filters.name) params.Name = payload.filters.name;
        if (payload.filters.academicSystemId)
          params.AcademicSystemId = payload.filters.academicSystemId;
        if (payload.filters.gradeId) params.GradeId = payload.filters.gradeId;
        if (payload.filters.schoolBranchId)
          params.SchoolBranchId = payload.filters.schoolBranchId;
      }
    }

    const response = await classroomApiService.getClassrooms(params as ClassroomQueryParams);

    if (!response?.isSuccess || !response.data) {
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
      data: response.data.classroomDto || [],
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

export const fetchClassroomById = createAsyncThunk<Classroom, string>(
  'classrooms/fetchClassroomById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await classroomApiService.getClassroomById(id);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createClassroom = createAsyncThunk<ApiResponseModel<null>, CreateClassroomRequest>(
  'classrooms/createClassroom',
  async (requestData, { rejectWithValue }) => {
    try {
      const response = await classroomApiService.createClassroom(requestData);
      return response;
    } catch (error: any) {
      if (error.isValidationError && error.validationErrors) {
        return rejectWithValue({ validationErrors: error.validationErrors });
      }
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const editClassroom = createAsyncThunk<ApiResponseModel<null>, { data: FormData }>(
  'classrooms/editClassroom',
  async ({ data }, { rejectWithValue }) => {
    try {
      const response = await classroomApiService.updateClassroom(data);
      return response;
    } catch (error: any) {
      if (error.isValidationError && error.validationErrors) {
        return rejectWithValue({ validationErrors: error.validationErrors });
      }
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteClassroom = createAsyncThunk<string, string>(
  'classrooms/deleteClassroom',
  async (id, { rejectWithValue }) => {
    try {
      await classroomApiService.deleteClassroom(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchClassroomsByGrade = createAsyncThunk<Classroom[], string>(
  'classrooms/fetchClassroomsByGrade',
  async (gradeId, { rejectWithValue }) => {
    try {
      const response = await classroomApiService.getClassrooms({ GradeId: gradeId });
      return response.data?.classroomDto ?? [];
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const classroomsSlice = createSlice({
  name: 'classrooms',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<ClassroomsState['filters']>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setCurrentClassroom: (state, action: PayloadAction<Classroom | null>) => {
      state.currentClassroom = action.payload;
    },
    clearError: (state) => {
      state.error = null;
      state.validationErrors = null;
    },
    selectClassroom: (state, action: PayloadAction<string>) => {
      if (!state.selectedClassroomIds.includes(action.payload)) {
        state.selectedClassroomIds.push(action.payload);
      }
    },
    deselectClassroom: (state, action: PayloadAction<string>) => {
      state.selectedClassroomIds = state.selectedClassroomIds.filter((id) => id !== action.payload);
    },
    selectAllClassrooms: (state) => {
      state.selectedClassroomIds = state.classrooms.map((classroom) => classroom.id);
    },
    clearSelection: (state) => {
      state.selectedClassroomIds = [];
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<ClassroomsState>) => {
    // Fetch Classrooms
    builder
      .addCase(fetchClassrooms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchClassrooms.fulfilled,
        (state, action: PayloadAction<FetchClassroomsResponse>) => {
          state.isLoading = false;
          state.classrooms = action.payload.data;
          state.pagination = {
            page: action.payload.meta.page,
            limit: action.payload.meta.limit,
            total: action.payload.meta.total,
            totalPages: action.payload.meta.totalPages,
          };
          state.isInitialized = true;
        }
      )
      .addCase(fetchClassrooms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Classroom By ID
    builder
      .addCase(fetchClassroomById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClassroomById.fulfilled, (state, action: PayloadAction<Classroom>) => {
        state.isLoading = false;
        state.currentClassroom = action.payload;
      })
      .addCase(fetchClassroomById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Classroom
    builder
      .addCase(createClassroom.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(
        createClassroom.fulfilled,
        (state, action: PayloadAction<ApiResponseModel<null>>) => {
          state.isCreating = false;
          const { isSuccess, validationErrors } = action.payload;
          if (!isSuccess && validationErrors) {
            state.validationErrors = validationErrors as any;
          }
          // Note: API doesn't return created classrooms, need to refetch list after creation
        }
      )
      .addCase(createClassroom.rejected, (state, action) => {
        state.isCreating = false;
        const payload = action.payload as any;
        if (payload?.validationErrors) {
          state.validationErrors = payload.validationErrors;
        } else {
          state.error = payload as string;
        }
      });

    // Edit Classroom
    builder
      .addCase(editClassroom.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(editClassroom.fulfilled, (state, action: PayloadAction<ApiResponseModel<null>>) => {
        state.isUpdating = false;
        const { isSuccess, validationErrors } = action.payload;
        if (!isSuccess && validationErrors) {
          state.validationErrors = validationErrors as any;
        }
      })
      .addCase(editClassroom.rejected, (state, action) => {
        state.isUpdating = false;
        const payload = action.payload as any;
        if (payload?.validationErrors) {
          state.validationErrors = payload.validationErrors;
        } else {
          state.error = payload as string;
        }
      });

    // Delete Classroom
    builder
      .addCase(deleteClassroom.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteClassroom.fulfilled, (state, action: PayloadAction<string>) => {
        state.isDeleting = false;
        state.classrooms = state.classrooms.filter((classroom) => classroom.id !== action.payload);
        state.selectedClassroomIds = state.selectedClassroomIds.filter(
          (id) => id !== action.payload
        );
      })
      .addCase(deleteClassroom.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });

    // Fetch Classrooms By Grade
    builder
      .addCase(fetchClassroomsByGrade.pending, (state) => {
        state.isLoadingGradeClassrooms = true;
        state.gradeClassrooms = [];
      })
      .addCase(fetchClassroomsByGrade.fulfilled, (state, action: PayloadAction<Classroom[]>) => {
        state.isLoadingGradeClassrooms = false;
        state.gradeClassrooms = action.payload;
      })
      .addCase(fetchClassroomsByGrade.rejected, (state) => {
        state.isLoadingGradeClassrooms = false;
        state.gradeClassrooms = [];
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setCurrentClassroom,
  clearError,
  selectClassroom,
  deselectClassroom,
  selectAllClassrooms,
  clearSelection,
} = classroomsSlice.actions;

export default classroomsSlice.reducer;
