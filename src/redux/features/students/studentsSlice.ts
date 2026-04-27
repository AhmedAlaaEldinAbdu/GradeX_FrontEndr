import {
  createSlice,
  type PayloadAction,
  type ActionReducerMapBuilder,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { studentsApiService } from '@/services/api/students/students.service';
import type { StudentDto, StudentQueryParams } from '@/services/api/types/students.types';
import { getErrorMessage } from '@/lib/http';

// ============================================================================
// Types
// ============================================================================

export interface StudentFilters {
  search?: string;
  gradeId?: string;
  classroomId?: string;
  schoolBranchId?: string;
}

export interface StudentsState {
  // Data
  students: StudentDto[];
  classroomStudents: StudentDto[];
  currentStudent: StudentDto | null;

  // Pagination
  pagination: {
    pageIndex: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };

  // Filters
  filters: StudentFilters;

  // Loading States
  isLoading: boolean;
  isLoadingClassroomStudents: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Error States
  error: string | null;
  validationErrors: Record<string, string[]> | null;

  // UI States
  selectedStudentIds: string[];
  isInitialized: boolean;
}

export interface FetchStudentsPayload {
  page?: number;
  limit?: number;
  filters?: StudentFilters;
}

export interface FetchStudentsResponse {
  data: StudentDto[];
  meta: {
    totalItems: number;
    pageIndex: number;
    pageSize: number;
    totalPages: number;
  };
}

const initialState: StudentsState = {
  // Data
  students: [],
  classroomStudents: [],
  currentStudent: null,

  // Pagination
  pagination: {
    pageIndex: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  },

  // Filters
  filters: {},

  // Loading States
  isLoading: false,
  isLoadingClassroomStudents: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,

  // Error States
  error: null,
  validationErrors: null,

  // UI States
  selectedStudentIds: [],
  isInitialized: false,
};

export const fetchStudents = createAsyncThunk<FetchStudentsResponse, FetchStudentsPayload | void>(
  'students/fetchStudents',
  async (payload, { rejectWithValue }) => {
    try {
      const params: StudentQueryParams = {};

      if (payload) {
        if (payload.page) params.PageIndex = payload.page;
        if (payload.limit) params.PageSize = payload.limit;

        if (payload.filters) {
          if (payload.filters.search) params.Search = payload.filters.search;
          if (payload.filters.gradeId) params.GradeId = payload.filters.gradeId;
          if (payload.filters.classroomId) params.ClassroomId = payload.filters.classroomId;
          if (payload.filters.schoolBranchId)
            params.SchoolBranchId = payload.filters.schoolBranchId;
          params.SchoolBrancheId = payload.filters.schoolBranchId; // TODO: temp fix for inconsistent API param name, should be removed once API is fixed
        }
      }

      const response = await studentsApiService.getStudents(params);

      if (!response?.isSuccess || !response.data) {
        return {
          data: [],
          meta: {
            totalItems: 0,
            pageIndex: 1,
            pageSize: 10,
            totalPages: 0,
          },
        };
      }

      return {
        data: response.data.studentDto || [],
        meta: {
          totalItems: response.data.totalItems || 0,
          pageIndex: response.data.pageIndex || 1,
          pageSize: response.data.pageSize || 10,
          totalPages: response.data.totalPages || 0,
        },
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Fetch student by id without mutating slice state/loading flags (useful for background operations)
export const fetchStudentByIdSilent = createAsyncThunk<StudentDto, string>(
  'students/fetchStudentByIdSilent',
  async (id, { rejectWithValue }) => {
    try {
      const response = await studentsApiService.getStudentById(id);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteStudent = createAsyncThunk<string, string>(
  'students/deleteStudent',
  async (id, { rejectWithValue }) => {
    try {
      await studentsApiService.deleteStudent(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const searchStudentsByName = createAsyncThunk<
  StudentDto[],
  { schoolBrancheId: string; studentName: string }
>(
  'students/searchStudentsByName',
  async ({ schoolBrancheId, studentName }, { rejectWithValue }) => {
    try {
      return await studentsApiService.searchStudentsByName(schoolBrancheId, studentName);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchStudentsByClassroomId = createAsyncThunk<StudentDto[], string>(
  'students/fetchStudentsByClassroomId',
  async (classroomId, { rejectWithValue }) => {
    try {
      return await studentsApiService.getStudentsByClassroomId(classroomId);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const studentsSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<StudentsState['filters']>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setCurrentStudent: (state, action: PayloadAction<StudentDto | null>) => {
      state.currentStudent = action.payload;
    },
    clearError: (state) => {
      state.error = null;
      state.validationErrors = null;
    },
    selectStudent: (state, action: PayloadAction<string>) => {
      if (!state.selectedStudentIds.includes(action.payload)) {
        state.selectedStudentIds.push(action.payload);
      }
    },
    deselectStudent: (state, action: PayloadAction<string>) => {
      state.selectedStudentIds = state.selectedStudentIds.filter((id) => id !== action.payload);
    },
    selectAllStudents: (state) => {
      state.selectedStudentIds = state.students.map((student) => student.id);
    },
    clearSelection: (state) => {
      state.selectedStudentIds = [];
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<StudentsState>) => {
    // Fetch Students
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action: PayloadAction<FetchStudentsResponse>) => {
        state.isLoading = false;
        state.students = action.payload.data;
        state.pagination = {
          pageIndex: action.payload.meta.pageIndex,
          pageSize: action.payload.meta.pageSize,
          totalItems: action.payload.meta.totalItems,
          totalPages: action.payload.meta.totalPages,
        };
        state.isInitialized = true;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch Students By Classroom Id
      .addCase(fetchStudentsByClassroomId.pending, (state) => {
        state.isLoadingClassroomStudents = true;
        state.error = null;
        state.classroomStudents = [];
      })
      .addCase(
        fetchStudentsByClassroomId.fulfilled,
        (state, action: PayloadAction<StudentDto[]>) => {
          state.isLoadingClassroomStudents = false;
          state.classroomStudents = action.payload;
        }
      )
      .addCase(fetchStudentsByClassroomId.rejected, (state, action) => {
        state.isLoadingClassroomStudents = false;
        state.classroomStudents = [];
        state.error = action.payload as string;
      })

      // Delete Student
      .addCase(deleteStudent.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteStudent.fulfilled, (state, action: PayloadAction<string>) => {
        state.isDeleting = false;
        state.students = state.students.filter((student) => student.id !== action.payload);
        if (state.pagination.totalItems > 0) {
          state.pagination.totalItems -= 1;
        }
      })
      .addCase(deleteStudent.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setCurrentStudent,
  clearError,
  selectStudent,
  deselectStudent,
  selectAllStudents,
  clearSelection,
} = studentsSlice.actions;

export default studentsSlice.reducer;
