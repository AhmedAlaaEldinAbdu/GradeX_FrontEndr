import {
  createSlice,
  type PayloadAction,
  type ActionReducerMapBuilder,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { teacherApiService } from '@/services/api/teachers/teachers.service';
import type { Teacher, TeacherQueryParams, TeacherFilters } from '@/types/teachers';
import type { TeacherAssignmentData } from '@/types/teacherAssignment';
import { getErrorMessage } from '@/lib/http';

// ============================================================================
// Types
// ============================================================================

export interface TeachersState {
  // Data
  teachers: Teacher[];
  currentTeacher: Teacher | null;
  teacherAssignment: TeacherAssignmentData | null;

  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Filters
  filters: TeacherFilters;

  // Loading States
  isLoading: boolean;
  isDeleting: boolean;
  isLoadingAssignment: boolean;

  // Error States
  error: string | null;
  assignmentError: string | null;

  // UI States
  selectedTeacherIds: string[];
  isInitialized: boolean;
}

export interface FetchTeachersPayload {
  page?: number;
  limit?: number;
  filters?: TeacherFilters;
}

export interface FetchTeachersResponse {
  data: Teacher[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const initialState: TeachersState = {
  // Data
  teachers: [],
  currentTeacher: null,
  teacherAssignment: null,

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
  isDeleting: false,
  isLoadingAssignment: false,

  // Error States
  error: null,
  assignmentError: null,

  // UI States
  selectedTeacherIds: [],
  isInitialized: false,
};

export const fetchTeachers = createAsyncThunk<FetchTeachersResponse, FetchTeachersPayload | void>(
  'teachers/fetchTeachers',
  async (payload, { rejectWithValue }) => {
    try {
      const params: Partial<TeacherQueryParams> = {};

      if (payload) {
        if (payload.page) params.PageIndex = payload.page;
        if (payload.limit) params.PageSize = payload.limit;

        if (payload.filters) {
          if (payload.filters.searchName) params.SearchName = payload.filters.searchName;
          if (payload.filters.subjectId) params.SubjectId = payload.filters.subjectId;
          if (payload.filters.educationalStageId)
            params.EducationalStageId = payload.filters.educationalStageId;
          if (payload.filters.classroomId) params.ClassroomId = payload.filters.classroomId;
          if (payload.filters.schoolBranchId)
            params.SchoolBranchId = payload.filters.schoolBranchId;
        }
      }

      const response = await teacherApiService.getTeachers(params as TeacherQueryParams);

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
        data: response.data.teachers || [],
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
  }
);

export const fetchTeacherById = createAsyncThunk<Teacher, string>(
  'teachers/fetchTeacherById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await teacherApiService.getTeacherById(id);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteTeacher = createAsyncThunk<string, string>(
  'teachers/deleteTeacher',
  async (id, { rejectWithValue }) => {
    try {
      await teacherApiService.deleteTeacher(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchTeacherAssignment = createAsyncThunk<TeacherAssignmentData, string>(
  'teachers/fetchTeacherAssignment',
  async (teacherId, { rejectWithValue }) => {
    try {
      const response = await teacherApiService.getTeacherAssignment(teacherId);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const teachersSlice = createSlice({
  name: 'teachers',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<TeachersState['filters']>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setCurrentTeacher: (state, action: PayloadAction<Teacher | null>) => {
      state.currentTeacher = action.payload;
    },
    clearTeacherAssignment: (state) => {
      state.teacherAssignment = null;
      state.assignmentError = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    selectTeacher: (state, action: PayloadAction<string>) => {
      if (!state.selectedTeacherIds.includes(action.payload)) {
        state.selectedTeacherIds.push(action.payload);
      }
    },
    deselectTeacher: (state, action: PayloadAction<string>) => {
      state.selectedTeacherIds = state.selectedTeacherIds.filter((id) => id !== action.payload);
    },
    selectAllTeachers: (state) => {
      state.selectedTeacherIds = state.teachers.map((teacher) => teacher.id);
    },
    clearSelection: (state) => {
      state.selectedTeacherIds = [];
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<TeachersState>) => {
    // Fetch Teachers
    builder
      .addCase(fetchTeachers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTeachers.fulfilled, (state, action: PayloadAction<FetchTeachersResponse>) => {
        state.isLoading = false;
        state.teachers = action.payload.data;
        state.pagination = {
          page: action.payload.meta.page,
          limit: action.payload.meta.limit,
          total: action.payload.meta.total,
          totalPages: action.payload.meta.totalPages,
        };
        state.isInitialized = true;
      })
      .addCase(fetchTeachers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Teacher By ID
    builder
      .addCase(fetchTeacherById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTeacherById.fulfilled, (state, action: PayloadAction<Teacher>) => {
        state.isLoading = false;
        state.currentTeacher = action.payload;
      })
      .addCase(fetchTeacherById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Teacher
    builder
      .addCase(deleteTeacher.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteTeacher.fulfilled, (state, action: PayloadAction<string>) => {
        state.isDeleting = false;
        state.teachers = state.teachers.filter((teacher) => teacher.id !== action.payload);
        state.selectedTeacherIds = state.selectedTeacherIds.filter((id) => id !== action.payload);
      })
      .addCase(deleteTeacher.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });

    // Fetch Teacher Assignment
    builder
      .addCase(fetchTeacherAssignment.pending, (state) => {
        state.isLoadingAssignment = true;
        state.assignmentError = null;
      })
      .addCase(
        fetchTeacherAssignment.fulfilled,
        (state, action: PayloadAction<TeacherAssignmentData>) => {
          state.isLoadingAssignment = false;
          state.teacherAssignment = action.payload;
        }
      )
      .addCase(fetchTeacherAssignment.rejected, (state, action) => {
        state.isLoadingAssignment = false;
        state.assignmentError = action.payload as string;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setCurrentTeacher,
  clearTeacherAssignment,
  clearError,
  selectTeacher,
  deselectTeacher,
  selectAllTeachers,
  clearSelection,
} = teachersSlice.actions;

export default teachersSlice.reducer;
